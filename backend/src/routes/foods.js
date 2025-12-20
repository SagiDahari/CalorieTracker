import express from 'express'
import { searchFood, getFood } from '../controllers/foodsController.js'

const router = express.Router();

/**
 * @swagger
 * /foods/search:
 *   get:
 *     summary: Search for foods
 *     description: Search the USDA FoodData Central database for foods by name or description
 *     tags: [Foods]
 *     parameters:
 *       - in: query
 *         name: food
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (food name or description)
 *         example: "chicken breast"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   fdcId:
 *                     type: integer
 *                     description: USDA FoodData Central ID
 *                     example: 171477
 *                   description:
 *                     type: string
 *                     description: Food description
 *                     example: "Chicken, broilers or fryers, breast, meat only, cooked, roasted"
 *                   brandName:
 *                     type: string
 *                     description: Brand name (if available)
 *                     example: "Generic"
 *                   foodNutrients:
 *                     type: object
 *                     description: Nutritional information per 100g
 *                     properties:
 *                       Energy:
 *                         type: number
 *                         example: 165
 *                       Protein:
 *                         type: number
 *                         example: 31
 *                       "Carbohydrate, by difference":
 *                         type: number
 *                         example: 0
 *                       "Total lipid (fat)":
 *                         type: number
 *                         example: 3.6
 *       400:
 *         description: Missing or invalid search query
 *       500:
 *         description: External API error
 */
router.get('/search', searchFood);

/**
 * @swagger
 * /foods/{fdcId}:
 *   get:
 *     summary: Get detailed food information
 *     description: Retrieve complete nutritional information for a specific food by USDA FDC ID. First checks cache, then fetches from USDA API if needed.
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: fdcId
 *         required: true
 *         schema:
 *           type: integer
 *         description: USDA FoodData Central ID
 *         example: 171477
 *     responses:
 *       200:
 *         description: Food details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   enum: [cache, api]
 *                   description: Where the data came from
 *                   example: "cache"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fdc_id:
 *                       type: integer
 *                       example: 171477
 *                     description:
 *                       type: string
 *                       example: "Chicken, broilers or fryers, breast, meat only, cooked, roasted"
 *                     brand_name:
 *                       type: string
 *                       example: null
 *                     serving_size_unit:
 *                       type: string
 *                       example: "g"
 *                     serving_size:
 *                       type: number
 *                       example: 100
 *                     has_real_serving:
 *                       type: boolean
 *                       example: true
 *                     foodNutrients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           nutrient_name:
 *                             type: string
 *                             example: "Energy"
 *                           value:
 *                             type: number
 *                             example: 165
 *                           unit_name:
 *                             type: string
 *                             example: "kcal"
 *       404:
 *         description: Food not found
 *       500:
 *         description: Failed to fetch food data
 */
router.get('/:fdcId', getFood);

export default router;
