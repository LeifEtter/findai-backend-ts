import Joi from "joi";

const createTool = Joi.object({
  title: Joi.string().required().min(10),
});

const login = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
});

const register = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
});

export default { createTool, login, register };
