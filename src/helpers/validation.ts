import Joi from "joi";

const toolValidation = Joi.object({
  title: Joi.string().required().min(10),
});

const loginValidation = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
});

const registrationValidation = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
});

export { toolValidation, loginValidation, registrationValidation };
