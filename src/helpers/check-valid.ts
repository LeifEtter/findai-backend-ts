import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import logger from "../logger";

const checkValid = (validationObject: Joi.ObjectSchema) =>
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      await validationObject.validateAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        return res.status(400).send({ message: error.message });
      }
      logger.error(error);
      return res
        .status(500)
        .send({ message: "Something went wrong during validation" });
    }
  };

export default checkValid;
