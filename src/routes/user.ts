import express from "express";
import {
  deleteUser,
  getUserById,
  getUserProfile,
  login,
  register,
  verify,
} from "../controllers/user-controller";
import validation from "../helpers/validation";
import extractToken from "../helpers/authentication";
import val from "../helpers/validator-schemas";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(extractToken, getUserById, getUserProfile);
userRouter.route("/login").get(validation(val.login), login);
userRouter.route("/register").post(validation(val.register), register);
userRouter.route("/verify").patch(validation(val.verify), verify);
userRouter.route("/deleteSelf").delete();
userRouter.route("/:id").delete(deleteUser);
export default userRouter;
