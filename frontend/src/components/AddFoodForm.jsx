import { useState } from 'react';
import api from '../services/api';

function AddFoodForm(props) {
    const { mealId, onFoodAdded, onCancel } = props;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const results = await api.searchFoods(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching foods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setQuantity(''); // Reset quantity when selecting new food
    };

    const handleAddFood = async (e) => {
        e.preventDefault();
        if (!selectedFood || !quantity) {
            alert('Please select a food and enter quantity');
            return;
        }

        try {
            setLoading(true);
            await api.logFood({
                mealId: mealId,
                fdcId: selectedFood.fdcId,
                quantity: parseFloat(quantity)
            });
            
            // Reset form
            setSearchQuery('');
            setSearchResults([]);
            setSelectedFood(null);
            setQuantity('');
            
            // Notify parent to refresh
            onFoodAdded();
        } catch (error) {
            console.error('Error adding food:', error);
            alert('Failed to add food');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-food-form">
            <div className="form-header">
                <h3>Add Food</h3>
                <button onClick={onCancel} className="close-btn">✕</button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" disabled={loading} className="search-btn">
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedFood && (
                <div className="search-results">
                    <h4>Search Results ({searchResults.length}):</h4>
                    <div className="results-list">
                        {searchResults.map((food) => (
                            <div
                                key={food.fdcId}
                                className="search-result-item"
                                onClick={() => handleSelectFood(food)}
                            >
                                <div className="food-details">
                                    <strong className="food-name">{food.description}</strong>
                                    {food.brandName && (
                                        <span className="brand-name">{food.brandName}</span>
                                    )}
                                </div>
                                
                                {food.foodNutrients && (
                                    <div className="food-macros-preview">
                                        <span className="macro-item">
                                            {Math.round(food.foodNutrients['Energy'])} cal 
                                        </span> 
                                        <span className="macro-item">
                                            P: {food.foodNutrients['Protein'].toFixed(1)}g
                                        </span>
                                        <span className="macro-item">
                                            C: {food.foodNutrients['Carbohydrate, by difference'].toFixed(1)}g
                                        </span>
                                        <span className="macro-item">
                                            F: {food.foodNutrients['Total lipid (fat)'].toFixed(1)}g
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Food & Quantity */}
            {selectedFood && (
                <div className="selected-food">
                    <h4>Selected:</h4>
                    <p><strong>{selectedFood.description}</strong></p>
                    {selectedFood.brandName && <p className="brand">{selectedFood.brandName}</p>}
                    
                    <button 
                        onClick={() => setSelectedFood(null)} 
                        className="change-food-btn"
                    >
                        Change Food
                    </button>

                    <form onSubmit={handleAddFood} className="quantity-form">
                        <label>
                            Quantity (grams):
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g., 100"
                                min="1"
                                required
                                className="quantity-input"
                            />
                        </label>
                        <button type="submit" disabled={loading} className="add-btn">
                            {loading ? 'Adding...' : 'Add to Meal'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AddFoodForm;