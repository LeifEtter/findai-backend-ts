import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";
dotenv.config();

const extractToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: "Please provide a token" });
  }
  const jwtToken: string = req.headers.authorization.split("")[1];
  try {
    const verifiedToken = jwt.verify(jwtToken, process.env.JWT_SECRET || "");
    console.log(verifiedToken);
  } catch (error) {
    return res.status(403).send({
      message:
        "Your token can't be verified, the time of validity might have passed",
    });
  }
  next();
};

export default extractToken;
