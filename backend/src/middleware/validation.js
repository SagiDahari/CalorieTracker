import Joi from 'joi'

export const schemas = {

    // Auth schemas
    register: Joi.object({
         email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
        password: Joi.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        }),
        username: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Username must be at least 2 characters',
            'string.max': 'Username can not exceed 50 characters',
            'any.required': 'Username is required'
        })
    }),
    login: Joi.object({
        email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
        password: Joi.string().required()
    }),

    // Meal schemas
    logFood: Joi.object({
        mealId: Joi.number().integer().positive().required(),
        fdcId: Joi.number().integer().positive().required(),
        quantity: Joi.number().positive().required().messages({
        'number.positive': 'Quantity must be a positive number',
        'any.required': 'Quantity is required'
        })
    }),

    // Goals schemas
    updateGoals: Joi.object({
        calories: Joi.number().integer().min(1).max(10000).required(),
        protein: Joi.number().integer().min(0).max(1000).required(),
        carbohydrates: Joi.number().integer().min(0).max(1000).required(),
        fats: Joi.number().integer().min(0).max(500).required()
    })
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};
    
    

