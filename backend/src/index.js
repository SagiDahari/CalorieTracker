import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';


// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import foodsRoutes from './routes/foods.js';
import mealsRoutes from './routes/meals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/foods', foodsRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));