import express from "express";
import {
  deleteUserById,
  deleteSelf,
  login,
  register,
  verify,
  getProfileById,
  getProfile,
  updateProfile,
} from "../controllers/user-controller";
import validation from "../helpers/validation";
import val from "../helpers/validator-schemas";
import { Role } from "@prisma/client";
import minRole from "../helpers/authorization";
import auth from "../helpers/authentication";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(auth, getProfile);
userRouter.route("/").patch(auth, validation(val.updateProfile), updateProfile);
userRouter.route("/profile/:id").get(auth, minRole(Role.ADMIN), getProfileById);
userRouter.route("/login").get(validation(val.login), login);
userRouter.route("/register").post(validation(val.register), register);
userRouter.route("/verify").patch(validation(val.verify), verify);
userRouter.route("/deleteSelf").delete(deleteSelf);
userRouter.route("/:id").delete(auth, minRole(Role.ADMIN), deleteUserById);
export default userRouter;
