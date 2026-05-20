const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const inviteUserSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('Admin', 'Employee').required()
});

const acceptInviteSchema = Joi.object({
  name: Joi.string().min(2).required(),
  password: Joi.string().min(8).required()
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
