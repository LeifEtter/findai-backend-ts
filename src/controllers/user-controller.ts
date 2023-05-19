import { NextFunction, Request, Response } from "express";

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.cookies);
    next();
  } catch (error) {
    console.error(error);
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  try {
    console.log("something");
    return res.status(200).send({ message: "Profile" });
  } catch (error) {
    console.error(error);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    return res.status(200).send({ message: "profile" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Couldn't log in" });
  }
};

export { getUserById, getUserProfile, login };
