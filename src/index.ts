import https from "https";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import morgan from "morgan";
import fs from "fs";
import api from "./router";
import cookieParser from "cookie-parser";

const allowedOrigins: string[] = [process.env.CURRENT_URL ?? "*"];
const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
};

const app: express.Application = express();

app.set("trust proxy", true); //TODO Make line more secure

app.use(express.json({ limit: "10mb" }));
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use("/api/v1", api);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Working");
});

if (process.env.NODE_ENV == "server") {
  const options: https.ServerOptions = {
    key: fs.readFileSync("./server.key"),
    cert: fs.readFileSync("./server.cert"),
  };

  https.createServer(options, app).listen(process.env.PORT, () => {
    console.log(`Server started at port ${process.env.PORT}`);
  });
} else if (process.env.NODE_ENV == "development") {
  app.listen(process.env.PORT, () => {
    console.log(`=================================`);
    console.log(`======= ENV: ${process.env.NODE_ENV} =======`);
    console.log(`🚀 App listening on the port ${process.env.PORT}`);
    console.log(`=================================`);
  });
} else {
  console.log("Please defne a NODE_ENV in the .env file");
}
