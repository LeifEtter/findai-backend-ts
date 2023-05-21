import Joi from "joi";

const createTool = Joi.object({
  title: Joi.string().required().min(10),
});

const login = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
});

const register = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
  profileImage: Joi.string().uri(),
  biography: Joi.string(),
});

const verify = Joi.object({
  id: Joi.number(),
  verificationCode: Joi.number(),
});

export default { createTool, login, register, verify };
