import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    next();
  } catch (error) {
    console.error(error);
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  try {
    console.log(req.body.userId);
    return res.status(200).send({ message: "Profile" });
  } catch (error) {
    console.error(error);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const token: string = jwt.sign(
      {
        userId: 1,
      },
      process.env.JWT_SECRET!,
      {
        algorithm: "HS256",
        expiresIn: 900000,
      }
    );

    return res.status(200).send({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Couldn't log in" });
  }
};

export { getUserById, getUserProfile, login };
