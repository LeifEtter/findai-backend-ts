import http from "http";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";

const port = process.env.PORT;

const allowedOrigins: string[] = [process.env.CURRENT_URL ?? "*"];
const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

const app: express.Application = express();

app.use(cors(corsOptions));

export const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ data: "Working" }));
});

server.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
});
