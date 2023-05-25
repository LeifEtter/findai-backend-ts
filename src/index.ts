import https from "https";
import http from "http";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import morgan from "morgan";
import fs from "fs";
import api from "./router";
import cookieParser from "cookie-parser";
import logger from "./logger";

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

if (!process.env.NODE_ENV) {
  logger.error("Please add 'NODE_ENV=[server/development]' to the .env file");
} else if (!process.env.JWT_SECRET) {
  logger.error(
    "Please add 'JWT_SECRET=[string for jwt encrypting]' to the .env file"
  );
} else if (!process.env.SENDGRID_API_KEY) {
  logger.error(
    "Please add 'SENDGRID_API_KEY=[api key from sendgrid]' to allow the sending of emails"
  );
} else if (
  !process.env.AIRTABLE_URL ||
  !process.env.AIRTABLE_TOKEN ||
  !process.env.AIRTABLE_TOOL_TABLE_ID ||
  !process.env.AIRTABLE_TAG_TABLE_ID
) {
  logger.error(
    "Please add 'AIRTABLE_URL=[url]' and 'AIRTABLE_TOKEN=[token]' to the env file, also add 'AIRTABLE_TOOL_TABLE_ID=[id]' and 'AIRTABLE_TAG_TABLE_ID=[id]'"
  );
} else if (!process.env.PORT) {
  logger.error("Please add 'PORT=[port to run server on]' to the .env file");
} else if (!process.env.DATABASE_URL) {
  logger.error("Please add 'DATABASE_URL=[url]' to the .env file");
} else if (process.env.NODE_ENV == "server") {
  const options: https.ServerOptions = {
    key: fs.readFileSync("./server.key"),
    cert: fs.readFileSync("./server.cert"),
  };

  http.createServer(options, app).listen(process.env.PORT, () => {
    logger.info(`Server started at port ${process.env.PORT}`);
  });
} else if (process.env.NODE_ENV == "test") {
  http.createServer(app).listen(process.env.PORT, () => {
    logger.info(`Server started at port ${process.env.PORT}`);
  });
} else if (process.env.NODE_ENV == "development") {
  app.listen(process.env.PORT, () => {
    logger.info(`=================================`);
    logger.info(`======= ENV: ${process.env.NODE_ENV} =======`);
    logger.info(`🚀 App listening on the port ${process.env.PORT}`);
    logger.info(`=================================`);
  });
}
