import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
const saltRounds = 10;

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.userId) {
      return res.status(500).send({ message: "Problem getting userId" });
    }
    const result = await prisma.user.findUnique({
      where: { id: req.body.userId },
    });
    req.body.user = result;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Something went wrong" });
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

const register = async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        password: hashedPassword,
        email: req.body.email,
        profileImage: req.body.profileImage,
        biography: req.body.biography,
        role: Role.USER,
      },
    });
    return res.status(201).send({ message: "Account succesfully saved" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Something went wrong during registration" });
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

export { getUserById, getUserProfile, login, register };
