CREATE TABLE food_cache (
    fdc_id BIGINT PRIMARY KEY,
    description TEXT,
    brand_name TEXT,
    serving_size_unit TEXT,
    serving_size NUMERIC
);

CREATE TABLE food_nutrients (
    id SERIAL PRIMARY KEY,
    food_id BIGINT REFERENCES food_cache(fdc_id) ON DELETE CASCADE,
    nutrient_name TEXT,
    value NUMERIC,
    unit_name TEXT
);

CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack'))
);

CREATE TABLE meal_foods (
    id SERIAL PRIMARY KEY,
    meal_id INT REFERENCES meals(id) ON DELETE CASCADE,
    food_id BIGINT REFERENCES food_cache(fdc_id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL DEFAULT 100,   
    UNIQUE(meal_id, food_id)               
);