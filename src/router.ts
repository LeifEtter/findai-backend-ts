import express from "express";
import toolRouter from "./routes/tool";
import userRouter from "./routes/user";

const api = express.Router();

api.use("/tools", toolRouter);
api.use("/user", userRouter);

export default api;
