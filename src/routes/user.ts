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

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(extractToken, getUserById, getUserProfile);
userRouter.route("/login").get(checkValid("login"), login);
userRouter.route("/register").post(checkValid("register"), register);
userRouter.route("/verify").patch(checkValid("verify"), verify);
export default userRouter;
