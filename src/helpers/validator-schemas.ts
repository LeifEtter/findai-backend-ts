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

const updateProfile = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  profileImage: Joi.string().uri(),
  biography: Joi.string(),
});

const verify = Joi.object({
  id: Joi.number(),
  verificationCode: Joi.number(),
});

const createTag = Joi.object({
  name: Joi.string(),
});

export default {
  createTool,
  login,
  register,
  verify,
  createTag,
  updateProfile,
};
