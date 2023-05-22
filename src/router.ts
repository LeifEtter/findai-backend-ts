import express from "express";
import toolRouter from "./routes/tool";
import userRouter from "./routes/user";
import tagRouter from "./routes/tag";
import airtableRouter from "./routes/airtable";

const api = express.Router();

api.use("/tools", toolRouter);
api.use("/user", userRouter);
api.use("/tag", tagRouter);
api.use("/airtable", airtableRouter);

export default api;
