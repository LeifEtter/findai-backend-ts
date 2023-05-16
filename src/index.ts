import http from "http";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import morgan from "morgan";

const port = process.env.PORT;

const allowedOrigins: string[] = [process.env.CURRENT_URL ?? "*"];
const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

const app: express.Application = express();

app.set("trust proxy", true); //TODO Make line more secure

app.use(express.json({ limit: "10mb" }));
app.use(cors(corsOptions));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Working");
});

export const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
});
