import Joi from "joi";

const toolValidation = Joi.object({
  title: Joi.string().required().min(10),
});

export { toolValidation };
