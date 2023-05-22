import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";
import prisma from "../db";

dotenv.config();

const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    if (typeof verifiedToken == "string") {
      console.error("The JWT Token decoded to a string unexpectedly");
      return res
        .status(500)
        .send({ message: "Something went wrong during auth" });
    }
    const user = await prisma.user.findUnique({
      where: { id: verifiedToken.userId },
    });
    if (!user) {
      return res.status(400).send({
        message:
          "User couldn't be found with user id provided in the jwt token",
      });
    }
    if (!user.verified) {
      return res.status(401).send({
        message:
          "Your account is still unverified, please verify under 'users/verify' with the code provided by email, before accessing routes that require authentication",
      });
    }
    req.body.user = user;
    next();
  } catch (error) {
    return res.status(403).send({
      message:
        "Your token can't be verified, the time of validity might have passed",
    });
  }
};

export default authentication;
