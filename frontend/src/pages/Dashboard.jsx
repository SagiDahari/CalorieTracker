import { useState, useEffect } from 'react';
import api from '../services/api';
import MealCard from '../components/MealCard'

function Dashboard() {

    const [date ,setDate] = useState(new Date().toISOString().slice(0,10));
    const [day, setDay] = useState (new Date().getDay()) // 0 for Sunday 1 for Monday and so on.. 
    const [month, setMonth] = useState(new Date().getMonth()) // 0 for January and so on..
    const [greeting, setGreeting] = useState('');

    const [meals, setMeals] = useState({});
    const [dailyTotals, setDailyTotals] = useState({
        calories: 0,
        carbohydrates: 0,
        protein: 0,
        fats: 0
    });
     const [goals, setGoals] = useState({
        calories: 2000,
        protein: 150,
        carbohydrates: 250,
        fats: 65
    });
    const [loading, setLoading] = useState(true);

    const loadMeals = async () => {
        try {
        setLoading(true);
        const data = await api.getMeals(date);
        setMeals(data.dailyMeals);
        setDailyTotals(data.dailyTotals);
        } catch (error) {
        console.error('Error loading meals:', error);
        } finally {
        setLoading(false);
        }
    };

    const calculatePercentage = (actual, goal) => {
        return goal > 0 ? Math.round((actual / goal) * 100) : 0;
    };


    useEffect(() => {
        const savedGoals = localStorage.getItem('nutritionGoals');
        if (savedGoals) {
            setGoals(JSON.parse(savedGoals));
        }
    }, []);

    useEffect(() => {
        loadMeals();
    }, [date]);

  

    // Might add a loading screen, line is up for changes.
    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard">
        <h1>Calorie Tracker</h1>
        <input 
            type="date" 
            value={date} 
            onChange={(e) => {
                console.log('Date changed to:', e.target.value)
                setDate(e.target.value)
            }}
        />

        <div className="daily-summary">
                <h2>Daily Totals</h2>
                
                <div className="macro-progress">
                    <div className="macro-item">
                        <div className="macro-header">
                            <span className="macro-name">Calories</span>
                            <span className="macro-values">
                                {dailyTotals.calories.toFixed(0)} / {goals.calories}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill calories" 
                                style={{ width: `${Math.min(calculatePercentage(dailyTotals.calories, goals.calories), 100)}%` }}
                            ></div>
                        </div>
                        <span className="percentage">{calculatePercentage(dailyTotals.calories, goals.calories)}%</span>
                    </div>

                    <div className="macro-item">
                        <div className="macro-header">
                            <span className="macro-name">Protein</span>
                            <span className="macro-values">
                                {dailyTotals.protein.toFixed(1)}g / {goals.protein}g
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill protein" 
                                style={{ width: `${Math.min(calculatePercentage(dailyTotals.protein, goals.protein), 100)}%` }}
                            ></div>
                        </div>
                        <span className="percentage">{calculatePercentage(dailyTotals.protein, goals.protein)}%</span>
                    </div>

                    <div className="macro-item">
                        <div className="macro-header">
                            <span className="macro-name">Carbs</span>
                            <span className="macro-values">
                                {dailyTotals.carbohydrates.toFixed(1)}g / {goals.carbohydrates}g
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill carbs" 
                                style={{ width: `${Math.min(calculatePercentage(dailyTotals.carbohydrates, goals.carbohydrates), 100)}%` }}
                            ></div>
                        </div>
                        <span className="percentage">{calculatePercentage(dailyTotals.carbohydrates, goals.carbohydrates)}%</span>
                    </div>

                    <div className="macro-item">
                        <div className="macro-header">
                            <span className="macro-name">Fats</span>
                            <span className="macro-values">
                                {dailyTotals.fats.toFixed(1)}g / {goals.fats}g
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill fats" 
                                style={{ width: `${Math.min(calculatePercentage(dailyTotals.fats, goals.fats), 100)}%` }}
                            ></div>
                        </div>
                        <span className="percentage">{calculatePercentage(dailyTotals.fats, goals.fats)}%</span>
                    </div>
                </div>
            </div>

        <div className="meals-container">
      {Object.keys(meals).length === 0 ? (
        <p>No meals logged for this date. Start tracking!</p>
      ) : (
        Object.values(meals).map(meal => (
          <MealCard key={meal.id} meal={meal}
          onDeletedFood={loadMeals}/>
        ))
      )}
    </div>
        </div>
        );
    }

    export default Dashboard;