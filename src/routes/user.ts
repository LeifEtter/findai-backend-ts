import express from "express";
import {
  getUserById,
  getUserProfile,
  login,
  register,
  verify,
} from "../controllers/user-controller";
import checkValid from "../helpers/check-valid";
import extractToken from "../helpers/authentication";
import validation from "../helpers/validation";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(extractToken, getUserById, getUserProfile);
userRouter.route("/login").get(checkValid(validation.login), login);
userRouter.route("/register").post(checkValid(validation.register), register);
userRouter.route("/verify").patch(checkValid(validation.verify), verify);
export default userRouter;
