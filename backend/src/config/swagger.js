import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nutrition Tracker API',
      version: '1.0.0',
      description: 'A comprehensive nutrition tracking API with user authentication and meal management',
      contact: {
        name: 'Sagi Dahari',
        email: 'sagidahari7@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints (register, login, logout)',
      },
      {
        name: 'Meals',
        description: 'Meal management endpoints (view, add, delete meals and foods)',
      },
      {
        name: 'Foods',
        description: 'Food search and information from USDA FoodData Central',
      },
      {
        name: 'Users',
        description: 'User profile and nutrition goals management',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in httpOnly cookie. Login to receive the token.',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);