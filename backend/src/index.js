import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pg from 'pg';
import cors from 'cors';

dotenv.config();

const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
const PORT = process.env.PORT || 5000;
const URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Functions
async function getFoodFromCache(fdcId) {
  const result = await db.query('SELECT * FROM food_cache WHERE fdc_id = $1'
    , [fdcId]);

  if (result.rows.length === 0) return null;

  const foodNutrients = await db.query('SELECT nutrient_name, value, unit_name FROM food_nutrients WHERE food_id = $1'
    , [fdcId])

  return {
    ...result.rows[0],
    foodNutrients: foodNutrients.rows
  }
}

async function addFoodToCache(food) {
  await db.query(
    'INSERT INTO food_cache (fdc_id, description, brand_name, serving_size_unit, serving_size, has_real_serving) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (fdc_id) DO NOTHING'
    , [food.fdcId,
    food.description,
    food.brandName || null,
    food.servingSizeUnit,
    food.servingSize,
    food.hasRealServing
    ]
  );

  for (let nutrient of food.foodNutrients) {
    await db.query('INSERT INTO food_nutrients (food_id, nutrient_name, value, unit_name) VALUES ($1, $2, $3, $4)'
      , [
        food.fdcId,
        nutrient.nutrientName,
        nutrient.value,
        nutrient.unitName
      ]
    )
  }

}

async function getOrCacheFood(fdcId) {
  // 1. Try cache first
    let cachedFood = await getFoodFromCache(fdcId);
    if (cachedFood) {
      return { source: "cache", data: cachedFood };
    }
    // 2. Fetch from API
  const apiResponse = await axios.get(
    `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`, {
      headers: { "x-api-key": process.env.API_KEY }
    }
  );
  const apiFood = apiResponse.data;

  // 3. Map API response
  const nutrients = [];
  for (let n of apiFood.foodNutrients) {
    if ([1008, 1005, 1004, 1003].includes(n.nutrient.id)) {
      nutrients.push({
        nutrientName: n.nutrient.name,
        value: n.amount,
        unitName: n.nutrient.unitName,
      });
    }
  }

  const foodData = {
    fdcId: apiFood.fdcId,
    description: apiFood.description,
    brandName: apiFood.brandName,
    servingSizeUnit: apiFood.servingSizeUnit || "g",
    servingSize: apiFood.servingSize || 100,
    foodNutrients: nutrients,
    hasRealServing: Boolean(apiFood.servingSize),
  };

  // 4. Save to DB/cache
  await addFoodToCache(foodData);

  return { source: "api", data: foodData };
}

// Getting or meals for a specific date. 
async function getOrCreateMealsForDate(date) {
  // Get existing meals for this date
  let result = await db.query(
    `SELECT id, meal_type FROM meals WHERE meal_date = $1`,
    [date]
  );
  
  const existingMeals = result.rows;
  const existingMealTypes = existingMeals.map(m => m.meal_type);
  
  // Define all required meal types
  const allMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  // Find missing meal types
  const missingMealTypes = allMealTypes.filter(
    type => !existingMealTypes.includes(type)
  );
  
  // Create missing meals
  for (const type of missingMealTypes) {
    const insertResult = await db.query(
      `INSERT INTO meals (meal_date, meal_type) VALUES ($1, $2) RETURNING id, meal_type`,
      [date, type]
    );
    existingMeals.push(insertResult.rows[0]);
  }
  
  return existingMeals;
}

// Routes
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.get('/search-food', async (req, res) => {
  try {

    const { food } = req.query;

    if (!food) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const response = await axios.get(URL, {
      headers: {
        'x-api-key': process.env.API_KEY
      },
      params: {
        query: food,
      }
    });
    const result = response.data;
    const foodsList = [];
    let nutrients = {};


    for (let food of result.foods) {
      for (let nutrient of food.foodNutrients) {
        if ([1008, 1005, 1004, 1003].includes(nutrient.nutrientId)) {
          // nutrients.push({
          //   nutrientName: nutrient.nutrientName,
          //   value: nutrient.value,
          //   unitName: nutrient.unitName,
          // });
        if (!nutrients[nutrient.nutrientName]) {
                nutrients[nutrient.nutrientName] = nutrient.value;
            }
        }
      }
      const foodData = {
        fdcId: food.fdcId,
        description: food.description,
        brandName: food.brandName || '',
        foodNutrients: nutrients,
      }
      nutrients = {};
      foodsList.push(foodData)
      }
    res.json(foodsList); 
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get("/food/:fdcId", async (req, res) => { // could be a redundant route and /log-food should suffice,  check when frontend is in work 
  const { fdcId } = req.params;

  try {
    const food = await getOrCacheFood(fdcId);
    res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch food data" });
  }
});

app.post('/log-food', async (req,res) => {
  try {
    const { fdcId, mealId, quantity } = req.body;
    if (!fdcId || !mealId || !quantity) {
      return res.status(400).json({ error: "fdcId, mealId, and quantity are required" });
    }

    const foodData = await getOrCacheFood(fdcId);

    // Insert into meal_foods
    await db.query(
      `INSERT INTO meal_foods (meal_id, food_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (meal_id, food_id) DO UPDATE SET quantity = meal_foods.quantity + EXCLUDED.quantity`,
      [mealId, fdcId, quantity]
    );

    res.json({ message: "Food logged successfully!", food: foodData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
})

app.get("/meals/:mealDate", async (req,res) => { 
  try {
    const {mealDate} = req.params;
    if (!mealDate) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Ensure all 4 meals exist for this date
    await getOrCreateMealsForDate(mealDate);

    const query = `SELECT
    m.id,
    m.meal_date, 
    m.meal_type,
    f.fdc_id, 
    f.description, 
    f.brand_name,
    mf.quantity,
    fn.nutrient_name, 
    fn.value, 
    fn.unit_name
    FROM meals m 
    LEFT JOIN meal_foods mf ON mf.meal_id = m.id
    LEFT JOIN food_cache f ON f.fdc_id = mf.food_id
    LEFT JOIN food_nutrients fn ON fn.food_id = f.fdc_id
    WHERE m.meal_date = $1
    ORDER BY 
        CASE m.meal_type
          WHEN 'Breakfast' THEN 1
          WHEN 'Lunch' THEN 2
          WHEN 'Dinner' THEN 3
          WHEN 'Snack' THEN 4
        END,
        m.id;`

    const result = await db.query(query,[mealDate]);

    // Structure SQL into a formatted JSON
    const dailyMeals = {};

    for (let row of result.rows) {
      if (!dailyMeals[row.id]) {
        dailyMeals[row.id] = {
          id: row.id,
          type: row.meal_type,
          date: mealDate,
          foods : {},
          totals: {calories: 0, carbohydrates: 0, protein: 0, fats: 0},
        }
      }
      if (row.fdc_id) {
        if (!dailyMeals[row.id].foods[row.fdc_id]) {
        dailyMeals[row.id].foods[row.fdc_id] = {
          fdcId: row.fdc_id,
          description: row.description,
          brand: row.brand_name,
          quantity: row.quantity,
          calories: 0,
          carbohydrates: 0,
          protein: 0,
          fats: 0
        }
        }
      }
      
      // Normailize values to each food by its quantity.
      let valueTo100GRatio = row.value / 100;
      let adjustedValue = valueTo100GRatio * row.quantity;

      if (row.nutrient_name === 'Energy') {
        dailyMeals[row.id].foods[row.fdc_id].calories += adjustedValue;
      }
      if (row.nutrient_name === 'Carbohydrate, by difference') {
        dailyMeals[row.id].foods[row.fdc_id].carbohydrates += adjustedValue;
      }
      if (row.nutrient_name === 'Protein') {
        dailyMeals[row.id].foods[row.fdc_id].protein += adjustedValue;
      }
      if (row.nutrient_name === 'Total lipid (fat)') {
        dailyMeals[row.id].foods[row.fdc_id].fats += adjustedValue;
      }
    }

  // Calculate daily meals totals
  for (let mealId in dailyMeals) {
    const meal = dailyMeals[mealId]
    for (let fdcId in meal.foods) {
      const food = meal.foods[fdcId]
      meal.totals.calories += food.calories;
      meal.totals.protein += food.protein;
      meal.totals.carbohydrates += food.carbohydrates;
      meal.totals.fats += food.fats;
    }
  }

  // Calculate daily totals
  let dailyTotals = { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };

  for (let mealId in dailyMeals) {
    const meal = dailyMeals[mealId]
    dailyTotals.calories += meal.totals.calories;
    dailyTotals.protein += meal.totals.protein;
    dailyTotals.carbohydrates += meal.totals.carbohydrates;
    dailyTotals.fats += meal.totals.fats;
  }

  res.json({ dailyMeals, dailyTotals });
    
   
  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Something went wrong"})
  }
})

app.get("/meal/:id", async (req, res) => { // seems redundant
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({error: "Meal ID is required"})
    }
    const query = `SELECT
    m.id,
    m.meal_date, 
    m.meal_type,
    f.fdc_id, 
    f.description, 
    f.brand_name,
    mf.quantity, 
    fn.nutrient_name, 
    fn.value, 
    fn.unit_name
    FROM meals m 
    INNER JOIN meal_foods mf ON mf.meal_id = m.id
    INNER JOIN food_cache f ON f.fdc_id = mf.food_id
    INNER JOIN food_nutrients fn ON fn.food_id = f.fdc_id
    WHERE m.id = $1
    ORDER BY m.id;`

    const result = await db.query(query,[id]);

    if (result.rows.length === 0) {
      // Non existent meal
      return res.json({meal: {
        id: "",
        type: "",
        date: "",
        foods : {},
        totals: {calories: 0, carbohydrates: 0, protein: 0, fats: 0}
      }})
    }

    const meal = {
      id: id,
      type: result.rows[0].meal_type,
      date: result.rows[0].meal_date,
      foods: {},
      totals: {calories: 0, carbohydrates: 0, protein: 0, fats: 0}
    }
    
    for (let row of result.rows) {
      if (!meal.foods[row.fdc_id]) {
        meal.foods[row.fdc_id] = {
          fdcId: row.fdc_id,
          description: row.description,
          brand: row.brand_name,
          quantity: row.quantity,
          calories: 0,
          carbohydrates: 0,
          protein: 0,
          fats: 0
        }
      }
      // Normailize values to each food by its quantity.
        let valueTo100GRatio = row.value / 100;
        let adjustedValue = valueTo100GRatio * row.quantity;

        if (row.nutrient_name === 'Energy') {
          meal.foods[row.fdc_id].calories += adjustedValue;
        }
        if (row.nutrient_name === 'Carbohydrate, by difference') {
          meal.foods[row.fdc_id].carbohydrates += adjustedValue;
        }
        if (row.nutrient_name === 'Protein') {
          meal.foods[row.fdc_id].protein += adjustedValue;
        }
        if (row.nutrient_name === 'Total lipid (fat)') {
          meal.foods[row.fdc_id].fats += adjustedValue;
        }
    }

    // Calculate meal totals
    for (let fdcId in meal.foods) {
      const food = meal.foods[fdcId]
      meal.totals.calories += food.calories
      meal.totals.carbohydrates += food.carbohydrates
      meal.totals.protein += food.protein
      meal.totals.fats += food.fats
    }

    res.json(meal)

  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Something went wrong"})
  }
})

app.delete("/delete-food/:mealId/:fdcId",async (req,res) => {
  try {
    const { mealId, fdcId } = req.params;
    if (!mealId || !fdcId ) {
      return res.status(400).json({error: "Meal ID and Food ID are required"})
    }
    const result = await db.query("DELETE FROM meal_foods WHERE meal_id = $1 AND food_id = $2 RETURNING food_id;"
      ,[mealId,fdcId]);
    // Check if anything was actually deleted
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: "Food or meal was not found" 
      });
    }

    res.status(200).json({ 
      message: `Food with ID ${fdcId} deleted successfully from meal ${mealId}`,
      deletedFoodId: result.rows[0].food_id
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Something went wrong"})
  }
})

app.delete("/delete-meal/:mealId", async (req,res) => { // seems redundant
  try {
    const {mealId} = req.params;
    if (!mealId) {
      return res.status(400).json({error: "Meal ID is required"})
    }
    const result = await db.query("DELETE FROM meals WHERE id = $1 RETURNING meal_type, meal_date",[mealId])

    // Check if anything was actually deleted
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: "meal was not found" 
      });
    }

    res.status(200).json({ 
      message: `meal ${mealId} was deleted`,
      deletedMealType: result.rows[0].meal_type,
      deltedMealDate: result.rows[0].meal_date
    });


  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Something went wrong"})
  }
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));