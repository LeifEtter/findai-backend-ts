import Joi from "joi";
import Validators from "./validation";
import { Request, Response, NextFunction } from "express";

const checkValid = (validationType: string) => {
  if (!(validationType in Validators)) {
    throw new Error("Not a valid validation type");
  }

  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await Validators[validationType as keyof typeof Validators].validateAsync(
        req.body
      );
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        return res.status(400).send({ message: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .send({ message: "Something went wrong during validation" });
    }
  };
};

export default checkValid;
