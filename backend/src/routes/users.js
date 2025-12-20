import express from 'express';
import { getUserGoals, updateUserGoals } from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /users/goals:
 *   get:
 *     summary: Get user's nutrition goals
 *     description: Retrieve the authenticated user's daily nutrition targets
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Goals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 calories:
 *                   type: integer
 *                   description: Daily calorie goal
 *                   example: 2000
 *                 protein:
 *                   type: integer
 *                   description: Daily protein goal in grams
 *                   example: 150
 *                 carbohydrates:
 *                   type: integer
 *                   description: Daily carbohydrate goal in grams
 *                   example: 250
 *                 fats:
 *                   type: integer
 *                   description: Daily fat goal in grams
 *                   example: 65
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Failed to get goals
 */
router.get('/goals', authenticateToken, getUserGoals);

/**
 * @swagger
 * /users/goals:
 *   put:
 *     summary: Update user's nutrition goals
 *     description: Update the authenticated user's daily nutrition targets
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calories
 *               - protein
 *               - carbohydrates
 *               - fats
 *             properties:
 *               calories:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 description: Daily calorie goal
 *                 example: 2000
 *               protein:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000
 *                 description: Daily protein goal in grams
 *                 example: 150
 *               carbohydrates:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000
 *                 description: Daily carbohydrate goal in grams
 *                 example: 250
 *               fats:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 500
 *                 description: Daily fat goal in grams
 *                 example: 65
 *     responses:
 *       200:
 *         description: Goals updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Goals updated successfully"
 *                 goals:
 *                   type: object
 *                   properties:
 *                     calories:
 *                       type: integer
 *                       example: 2000
 *                     protein:
 *                       type: integer
 *                       example: 150
 *                     carbohydrates:
 *                       type: integer
 *                       example: 250
 *                     fats:
 *                       type: integer
 *                       example: 65
 *       400:
 *         description: Invalid input - validation errors
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Failed to update goals
 */
router.put('/goals', authenticateToken, updateUserGoals);

export default router;