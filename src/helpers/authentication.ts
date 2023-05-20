import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";

dotenv.config();

const extractToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: "Please provide a token" });
  }
  let jwtToken: string;
  if (req.headers.authorization.startsWith("Bearer" || "bearer")) {
    jwtToken = req.headers.authorization.split(" ")[1];
  } else {
    jwtToken = req.headers.authorization;
  }
  try {
    const verifiedToken: JwtPayload | string = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET!
    );
    if (typeof verifiedToken != "string") {
      req.body.userId = verifiedToken.userId;
    }
    next();
  } catch (error) {
    return res.status(403).send({
      message:
        "Your token can't be verified, the time of validity might have passed",
    });
  }
};

export default extractToken;
