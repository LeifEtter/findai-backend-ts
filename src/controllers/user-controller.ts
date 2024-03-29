import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";
import bcrypt from "bcrypt";
import {Prisma, Role, User} from "@prisma/client";
import {sendEmail} from "../helpers/email";
import logger from "../logger";
const saltRounds = 10;

const getProfileById = async (req: Request, res: Response) => {
  try {
    const profile: User | null = await prisma.user.findUnique({
      where: {id: parseInt(req.params.id)},
    });
    if (!profile) {
      return res.status(400).send({
        message: `Couldn't find a profile for user with id: ${req.params.id}`,
      });
    }
    profile["password"] = "-- redacted --";
    return res.status(200).send({
      message: `Successfully queried profile for user with id: ${req.params.id}`,
      profile,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).send({message: "Something went wrong"});
  }
};

const getProfile = async (req: Request, res: Response) => {
  try {
    res.locals.user["password"] = "-- redacted --";
    return res.status(200).send({profile: res.locals.user});
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .send({message: "Something went wrong while getting your profile"});
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const verificationCode = Math.floor(Math.random() * 100000);

    sendEmail({res: res, email: req.body.email, code: verificationCode});
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
      return res.status(400).send({message: "Email is already in use"});
    }
    logger.error(error);
    if (error)
      return res
        .status(500)
        .send({message: "Something went wrong during registration"});
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {email: req.body.email},
    });
    if (!user || user.verified == false) {
      return res
        .status(400)
        .send({message: "No verified user found with this email address"});
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
          expiresIn: "2h",
        }
      );
      return res.status(200).send({token});
    } else {
      return res.status(401).send({message: "Email and Password don't match"});
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).send({message: "Couldn't log in"});
  }
};

const verify = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({where: {id: req.body.id}});
    if (!user || user.verified) {
      return res
        .status(400)
        .send({message: "No unverified user found for this user id"});
    }
    if (user.verificationCode == req.body.verificationCode) {
      await prisma.user.update({
        where: {id: req.body.id},
        data: {verified: true},
      });
    }
    return res.status(200).send({message: "Verified user successfully"});
  } catch (error) {
    res.status(500).send({message: "Something went wrong during verification"});
  }
};

const deleteSelf = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({where: {id: res.locals.user.id}});
    return res.status(200).send({message: "Account deleted successfully"});
  } catch (error) {
    console.error(error);
    return res.status(200);
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({where: {id: parseInt(req.params.id)}});
    return res
      .status(200)
      .send({message: `User with id ${req.params.id} deleted successfully`});
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code == "P2025") {
        return res.status(400).send({message: "User couldn't be found"});
      }
    }
    logger.error(error);
    return res.status(500).send({
      message: "Something went wrong while trying to delete the account",
    });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    if (req.body.email && req.body.email != res.locals.email) {
      return res.status(400).send({
        message:
          "Please use the 'users/update/email' route to change your email ",
      });
    }
    const user = await prisma.user.update({
      where: {
        id: res.locals.user.id,
      },
      data: {
        ...(req.body.biography && {biography: req.body.biography}),
        ...(req.body.profileImage && {profileImage: req.body.profileImage}),
        ...(req.body.password && {
          password: await bcrypt.hash(req.body.password, saltRounds),
        }),
      },
    });
    if (!user) {
      throw new Error();
    }
    user.password = "-- redacted --";
    return res.status(200).send({message: "Updated successfully", user});
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Something went wrong while trying to update your profile",
    });
  }
};

export {
  getProfileById,
  getProfile,
  login,
  register,
  verify,
  deleteUserById,
  deleteSelf,
  updateProfile,
};
