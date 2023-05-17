import express from "express";
import toolRouter from "./routes/tool";

const api = express.Router();

api.use("/tools", toolRouter);

export default api;
