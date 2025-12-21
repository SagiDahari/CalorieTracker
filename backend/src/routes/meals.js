import express from 'express'
import { getMealsByDate, getMealById, logFood, deleteFood, deleteMeal } from '../controllers/mealsController.js'
import { authenticateToken } from '../middleware/auth.js'
import { schemas, validate } from '../middleware/validation.js'

const router = express.Router();

/**
 * @swagger
 * /meals/{date}:
 *   get:
 *     summary: Get all meals for a specific date
 *     description: Returns all meals (breakfast, lunch, dinner, snack) with foods and nutritional totals for the authenticated user
 *     tags: [Meals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-18"
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Meals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyMeals:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: "breakfast"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-12-18"
 *                       foods:
 *                         type: object
 *                         additionalProperties:
 *                           type: object
 *                           properties:
 *                             fdcId:
 *                               type: integer
 *                               example: 123456
 *                             description:
 *                               type: string
 *                               example: "Chicken breast, grilled"
 *                             brand:
 *                               type: string
 *                               example: "Generic"
 *                             quantity:
 *                               type: number
 *                               example: 150
 *                             calories:
 *                               type: number
 *                               example: 165
 *                             protein:
 *                               type: number
 *                               example: 31
 *                             carbohydrates:
 *                               type: number
 *                               example: 0
 *                             fats:
 *                               type: number
 *                               example: 3.6
 *                       totals:
 *                         type: object
 *                         properties:
 *                           calories:
 *                             type: number
 *                             example: 500
 *                           protein:
 *                             type: number
 *                             example: 45
 *                           carbohydrates:
 *                             type: number
 *                             example: 50
 *                           fats:
 *                             type: number
 *                             example: 15
 *                 dailyTotals:
 *                   type: object
 *                   properties:
 *                     calories:
 *                       type: number
 *                       example: 2000
 *                     protein:
 *                       type: number
 *                       example: 150
 *                     carbohydrates:
 *                       type: number
 *                       example: 200
 *                     fats:
 *                       type: number
 *                       example: 60
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid date format
 */
router.get('/:mealDate', authenticateToken, getMealsByDate);

/**
 * @swagger
 * /meals/meal/{id}:
 *   get:
 *     summary: Get a specific meal by ID
 *     description: Returns detailed information about a single meal including all foods
 *     tags: [Meals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meal ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Meal retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 type:
 *                   type: string
 *                   example: "breakfast"
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-12-18"
 *                 foods:
 *                   type: object
 *                 totals:
 *                   type: object
 *                   properties:
 *                     calories:
 *                       type: number
 *                     protein:
 *                       type: number
 *                     carbohydrates:
 *                       type: number
 *                     fats:
 *                       type: number
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this meal
 *       404:
 *         description: Meal not found
 */
router.get('/meal/:id', authenticateToken, getMealById);

/**
 * @swagger
 * /meals/log-food:
 *   post:
 *     summary: Add food to a meal
 *     description: Logs a food item to a specific meal with quantity
 *     tags: [Meals]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealId
 *               - fdcId
 *               - quantity
 *             properties:
 *               mealId:
 *                 type: integer
 *                 description: ID of the meal to add food to
 *                 example: 1
 *               fdcId:
 *                 type: integer
 *                 description: USDA FoodData Central ID
 *                 example: 123456
 *               quantity:
 *                 type: number
 *                 description: Quantity in grams
 *                 minimum: 1
 *                 example: 150
 *     responses:
 *       200:
 *         description: Food logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Food logged successfully!"
 *                 food:
 *                   type: object
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to modify this meal
 */
router.post('/log-food', authenticateToken, validate(schemas.logFood), logFood);

/**
 * @swagger
 * /meals/delete-food/{mealId}/{fdcId}:
 *   delete:
 *     summary: Remove food from a meal
 *     description: Deletes a specific food item from a meal
 *     tags: [Meals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meal ID
 *         example: 1
 *       - in: path
 *         name: fdcId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID (USDA FDC ID)
 *         example: 123456
 *     responses:
 *       200:
 *         description: Food deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Food with ID 123456 deleted successfully from meal 1"
 *                 deletedFoodId:
 *                   type: integer
 *                   example: 123456
 *       400:
 *         description: Missing meal ID or food ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to modify this meal
 *       404:
 *         description: Food not found in this meal
 */
router.delete('/delete-food/:mealId/:fdcId', authenticateToken, deleteFood);

/**
 * @swagger
 * /meals/delete-meal/{mealId}:
 *   delete:
 *     summary: Delete an entire meal
 *     description: Deletes a meal and all associated foods
 *     tags: [Meals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meal ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "meal 1 was deleted"
 *                 deletedMealType:
 *                   type: string
 *                   example: "breakfast"
 *                 deletedMealDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-12-18"
 *       400:
 *         description: Missing meal ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this meal
 *       404:
 *         description: Meal not found
 */
router.delete('/delete-meal/:mealId', authenticateToken, deleteMeal); 

export default router;