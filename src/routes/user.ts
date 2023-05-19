import express from "express";
import {
  getUserById,
  getUserProfile,
  login,
} from "../controllers/user-controller";
import checkValid from "../helpers/check-valid";
import extractToken from "../helpers/authentication";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(extractToken, getUserById, getUserProfile);
userRouter.route("/login").get(checkValid("login"), login);
export default userRouter;
