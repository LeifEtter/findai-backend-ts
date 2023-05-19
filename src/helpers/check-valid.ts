import Validators from "./validation";
import { Request, Response, NextFunction } from "express";

const checkValid = (validationType: string) => {
  if (!(validationType in Validators)) {
    throw new Error("Not a valid validation type");
  }

  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const validated = await Validators[
        validationType as keyof typeof Validators
      ]
        .validateAsync(req.body)
        .catch((error) => ({ error: error.details[0].message }));
      if ("error" in validated) {
        return res.status(400).send({ message: validated.error });
      } else {
        next();
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ message: "Something went wrong during validation" });
    }
  };
};

export default checkValid;
