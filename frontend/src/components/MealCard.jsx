import { useState } from 'react'
import FoodItem from './FoodItem'
import AddFoodForm from './AddFoodForm'

function MealCard (props) {

    const { meal, onDeletedFood } = props;
    const [showAddForm, setShowAddForm] = useState(false);

    const handleFoodAdded = () => {
        setShowAddForm(false); // Close the form
        onDeletedFood(); // Refresh meals (reusing the callback) maybe i should rename it, (loadMeals function in Dashboard)
    };


    return (
        <div className='meal-card'>
            <div className="meal-header">
                <h1>{meal.type}</h1>
                <div className="meal-totals">
                    <span>{meal.totals.calories.toFixed(0)} cal</span>
                    <span> C: {meal.totals.carbohydrates.toFixed(1)}g</span>
                    <span> P: {meal.totals.protein.toFixed(1)}g</span>
                    <span> F: {meal.totals.fats.toFixed(1)}g</span>
                </div>
            </div>
            <div className='foods-list'>
                {Object.keys(meal.foods).length !== 0 ? Object.values(meal.foods).map(food => {
                    return <FoodItem 
                    key={food.fdcId}
                    food={food}
                    mealId={meal.id}
                    onDelete={onDeletedFood}
                    />
                    }) : <p>No foods are logged in this specific meal yet</p>
                }
            </div>
             {!showAddForm ? (
                <button 
                    className="add-food-btn"
                    onClick={() => setShowAddForm(true)}
                >
                    + Add Food
                </button>
            ) : (
                <AddFoodForm
                    mealId={meal.id}
                    onFoodAdded={handleFoodAdded}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    )

}

export default MealCard;