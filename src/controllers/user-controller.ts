import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";
import bcrypt from "bcrypt";
import { Prisma, Role } from "@prisma/client";
import { sendEmail } from "../helpers/email";
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
    const verificationCode = Math.floor(Math.random() * 100000);

    sendEmail({ res: res, email: req.body.email, code: verificationCode });
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        password: hashedPassword,
        email: req.body.email,
        profileImage: req.body.profileImage,
        biography: req.body.biography,
        role: Role.USER,
        verificationCode,
      },
    });

    return res.status(201).send({
      userId: user.id,
      message:
        "An Email with your verification code has been sent, please use the user/verify route and provide you're user id and code",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code == "P2002"
    ) {
      return res.status(400).send({ message: "Email is already in use" });
    }
    console.error(error);
    if (error)
      return res
        .status(500)
        .send({ message: "Something went wrong during registration" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (!user || user.verified == false) {
      return res
        .status(400)
        .send({ message: "No verified user found with this email adress" });
    }
    const pwIsMatch: boolean = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (pwIsMatch) {
      const token: string = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: 900000,
        }
      );
      return res.status(200).send({ token });
    } else {
      return res
        .status(401)
        .send({ message: "Email and Password don't match" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Couldn't log in" });
  }
};

const verify = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.body.id } });
    if (!user || user.verified) {
      return res
        .status(400)
        .send({ message: "No unverified user found for this user id" });
    }
    if (user.verificationCode == req.body.verificationCode) {
      await prisma.user.update({
        where: { id: req.body.id },
        data: { verified: true },
      });
    }
    return res.status(200).send({ message: "Verified user successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong during verification" });
  }
};

export { getUserById, getUserProfile, login, register, verify };
