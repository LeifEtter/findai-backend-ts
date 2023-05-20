import express from "express";
import {
  getUserById,
  getUserProfile,
  login,
  register,
} from "../controllers/user-controller";
import checkValid from "../helpers/check-valid";
import extractToken from "../helpers/authentication";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(extractToken, getUserById, getUserProfile);
userRouter.route("/login").get(checkValid("login"), login);
userRouter.route("/register").post(checkValid("register"), register);
export default userRouter;
