import { useState, useEffect } from 'react';

function Settings() {
    const [goals, setGoals] = useState({
        calories: 2000,
        protein: 150,
        carbohydrates: 250,
        fats: 65
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load goals from localStorage on mount
    useEffect(() => {
        const savedGoals = localStorage.getItem('nutritionGoals');
        if (savedGoals) {
            setGoals(JSON.parse(savedGoals));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGoals(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
        setSaved(false); // Reset saved indicator when editing
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        
        localStorage.setItem('nutritionGoals', JSON.stringify(goals));

        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => setSaved(false), 3000);
        }, 500);
    };

    const handleReset = () => {
        const defaultGoals = {
            calories: 2000,
            protein: 150,
            carbohydrates: 250,
            fats: 65
        };
        setGoals(defaultGoals);
        setSaved(false);
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1>Nutrition Goals</h1>
                <p className="settings-description">
                    Set your daily macronutrient targets. These will be displayed on your dashboard.
                </p>

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="calories">
                            Daily Calories
                            <span className="unit">kcal</span>
                        </label>
                        <input
                            type="number"
                            id="calories"
                            name="calories"
                            value={goals.calories}
                            onChange={handleChange}
                            min="0"
                            step="5"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="protein">
                            Protein
                            <span className="unit">grams</span>
                        </label>
                        <input
                            type="number"
                            id="protein"
                            name="protein"
                            value={goals.protein}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="carbohydrates">
                            Carbohydrates
                            <span className="unit">grams</span>
                        </label>
                        <input
                            type="number"
                            id="carbohydrates"
                            name="carbohydrates"
                            value={goals.carbohydrates}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fats">
                            Fats
                            <span className="unit">grams</span>
                        </label>
                        <input
                            type="number"
                            id="fats"
                            name="fats"
                            value={goals.fats}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={handleReset}
                            className="reset-btn"
                        >
                            Reset to Defaults
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="save-btn"
                        >
                            {loading ? 'Saving...' : 'Save Goals'}
                        </button>
                    </div>

                    {saved && (
                        <div className="success-message">
                            ✓ Goals saved successfully!
                        </div>
                    )}
                </form>

                <div className="macro-breakdown">
                    <h3>Macro Breakdown</h3>
                    <div className="breakdown-grid">
                        <div className="breakdown-item">
                            <span className="macro-label">Protein:</span>
                            <span className="macro-value">
                                {goals.protein}g × 4 = {goals.protein * 4} cal 
                                ({((goals.protein * 4 / goals.calories) * 100).toFixed(0)}%)
                            </span>
                        </div>
                        <div className="breakdown-item">
                            <span className="macro-label">Carbs:</span>
                            <span className="macro-value">
                                {goals.carbohydrates}g × 4 = {goals.carbohydrates * 4} cal 
                                ({((goals.carbohydrates * 4 / goals.calories) * 100).toFixed(0)}%)
                            </span>
                        </div>
                        <div className="breakdown-item">
                            <span className="macro-label">Fats:</span>
                            <span className="macro-value">
                                {goals.fats}g × 9 = {goals.fats * 9} cal 
                                ({((goals.fats * 9 / goals.calories) * 100).toFixed(0)}%)
                            </span>
                        </div>
                        <div className="breakdown-total">
                            <span className="macro-label">Total:</span>
                            <span className="macro-value">
                                {goals.protein * 4 + goals.carbohydrates * 4 + goals.fats * 9} cal
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;