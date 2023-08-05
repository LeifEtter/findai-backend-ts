import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import morgan from "morgan";
import api from "./router";
import cookieParser from "cookie-parser";

const allowedOrigins: string[] = ["localhost:3000", "http://localhost:3000"];
const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

const app: express.Application = express();

app.set("trust proxy", true); //TODO Make line more secure

app.use(express.json({limit: "10mb"}));
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use("/api/v1", api);
app.use("/test", api);
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Working");
});

export default app;
