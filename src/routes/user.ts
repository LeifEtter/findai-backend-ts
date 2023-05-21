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
import val from "../helpers/validation";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(extractToken, getUserById, getUserProfile);
userRouter.route("/login").get(checkValid(val.login), login);
userRouter.route("/register").post(checkValid(val.register), register);
userRouter.route("/verify").patch(checkValid(val.verify), verify);
export default userRouter;
