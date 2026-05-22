const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const inviteUserSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('Admin', 'Employee').required(),
  workspaceName: Joi.string().optional(),
  sections: Joi.array().items(Joi.string()).optional()
});

const acceptInviteSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  mobileNumber: Joi.string().min(10).required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({ 'any.only': 'Passwords do not match' })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required()
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

module.exports = {
  loginSchema,
  inviteUserSchema,
  acceptInviteSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateRequest
};
