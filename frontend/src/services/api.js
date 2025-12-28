import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api` 
  : "http://localhost:5000/api";

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

const api = {
    // ==================
    // AUTH ROUTES
    // ==================
    
    register: async (userData) => {
        const { data } = await apiClient.post('/auth/register', userData);
        return data;
    },

    login: async (credentials) => {
        const { data } = await apiClient.post('/auth/login', credentials);
        return data;
    },

    logout: async () => {
        const { data } = await apiClient.post('/auth/logout');
        return data;
    },

    getCurrentUser: async () => {
        const { data } = await apiClient.get('/auth/me');
        return data;
    },

    // ==================
    // FOOD ROUTES
    // ==================
    
    searchFoods: async (query) => {
        const { data } = await apiClient.get('/foods/search', {
            params: { food: query }
        });
        return data;
    },

    getFood: async (fdcId) => {
        const { data } = await apiClient.get(`/foods/${fdcId}`);
        return data;
    },

    // ==================
    // MEAL ROUTES
    // ==================
    
    getMeals: async (date) => {
        const { data } = await apiClient.get(`/meals/${date}`);
        return data;
    },

    getMeal: async (mealId) => {
        const { data } = await apiClient.get(`/meals/meal/${mealId}`);
        return data;
    },

    logFood: async (foodData) => {
        const { data } = await apiClient.post('/meals/log-food', foodData);
        return data;
    },

    deleteFood: async (mealId, fdcId) => {
        const { data } = await apiClient.delete(`/meals/delete-food/${mealId}/${fdcId}`);
        return data;
    },

    deleteMeal: async (mealId) => {
        const { data } = await apiClient.delete(`/meals/delete-meal/${mealId}`);
        return data;
    },

    // ==================
    // USER/GOALS ROUTES
    // ==================
    
    getUserGoals: async () => {
        const { data } = await apiClient.get('/users/goals');
        return data;
    },

    updateUserGoals: async (goals) => {
        const { data } = await apiClient.put('/users/goals', goals);
        return data;
    }
};

export default api;