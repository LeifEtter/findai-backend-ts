import express from "express";
import { getUserById, getUserProfile } from "../controllers/userController";

const userRouter: express.Router = express.Router();

userRouter.route("/profile").get(getUserById, getUserProfile);

export default userRouter;
