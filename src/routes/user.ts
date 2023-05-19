import express from "express";
import {
  getUserById,
  getUserProfile,
  login,
} from "../controllers/user-controller";
import checkValid from "../helpers/check-valid";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(getUserById, getUserProfile);
userRouter.route("/login").get(checkValid("login"), login);
export default userRouter;
