import { Role, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

//! Needs Access to user stored in req.body during authentication to work
const roleLevel = {
  USER: 0,
  ADMIN: 1,
};

const minRole =
  (role: Role) => async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.body.user;
    if (roleLevel[user.role] >= roleLevel[role]) {
      next();
    } else {
      return res
        .status(401)
        .send({ message: "You don't have authorization to access this route" });
    }
  };

export default minRole;
