import express from "express";
import toolRouter from "./routes/tool";
import userRouter from "./routes/user";
import tagRouter from "./routes/tag";

const api = express.Router();

api.use("/tools", toolRouter);
api.use("/user", userRouter);
api.use("/tag", tagRouter);

export default api;
