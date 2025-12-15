import axios from 'axios';

const BACKEND_SERVICE_URL = "http://localhost:5000"

const apiClient = axios.create({
    baseURL: BACKEND_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

const api = {
    // Search foods
    searchFoods: async (query) => {
        const { data } = await apiClient.get('/search-food', {
        params: { food: query }
        });
        return data;
    },
    // Get food by fdcId
    getFood: async (fdcId) => {
        const { data } = await apiClient.get(`/food/${fdcId}`);
        return data;
    },

    // Add a food to a meal
    logFood: async (foodData) => {
        const { data } = await apiClient.post('/log-food',foodData);
        return data
    },

    // Get all the meals of the day
    getMeals: async (date) => {
        const { data } = await apiClient.get(`/meals/${date}`);
        return data;
    },

    // Get meal by ID
    getMeal: async (mealId) => {
        const { data } = await apiClient.get(`/meal/${mealId}`)
        return data
    },

    // Delete food from a specific meal
    deleteFood: async (mealId,fdcId) => {
        const { data } = await apiClient.delete(`/delete-food/${mealId}/${fdcId}`)
        return data
    },

    // Delete Meal.
    deleteMeal: async (mealId) => {
        const { data } = await apiClient.delete(`/delete-meal/${mealId}`)
        return data
    }


}

export default api;