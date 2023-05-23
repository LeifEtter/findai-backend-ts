"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const router_1 = __importDefault(require("./router"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = __importDefault(require("./logger"));
const allowedOrigins = [(_a = process.env.CURRENT_URL) !== null && _a !== void 0 ? _a : "*"];
const corsOptions = {
    origin: allowedOrigins,
};
const app = (0, express_1.default)();
app.set("trust proxy", true); //TODO Make line more secure
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)("dev"));
app.use("/api/v1", router_1.default);
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send("Working");
});
if (!process.env.NODE_ENV) {
    logger_1.default.error("Please add 'NODE_ENV=[server/development]' to the .env file");
}
else if (!process.env.JWT_SECRET) {
    logger_1.default.error("Please add 'JWT_SECRET=[string for jwt encrypting]' to the .env file");
}
else if (!process.env.SENDGRID_API_KEY) {
    logger_1.default.error("Please add 'SENDGRID_API_KEY=[api key from sendgrid]' to allow the sending of emails");
}
else if (!process.env.AIRTABLE_URL ||
    !process.env.AIRTABLE_TOKEN ||
    !process.env.AIRTABLE_TOOL_TABLE_ID ||
    !process.env.AIRTABLE_TAG_TABLE_ID) {
    logger_1.default.error("Please add 'AIRTABLE_URL=[url]' and 'AIRTABLE_TOKEN=[token]' to the env file, also add 'AIRTABLE_TOOL_TABLE_ID=[id]' and 'AIRTABLE_TAG_TABLE_ID=[id]'");
}
else if (!process.env.PORT) {
    logger_1.default.error("Please add 'PORT=[port to run server on]' to the .env file");
}
else if (!process.env.DATABASE_URL) {
    logger_1.default.error("Please add 'DATABASE_URL=[url]' to the .env file");
}
else if (process.env.NODE_ENV == "server") {
    const options = {
        key: fs_1.default.readFileSync("./server.key"),
        cert: fs_1.default.readFileSync("./server.cert"),
    };
    https_1.default.createServer(options, app).listen(process.env.PORT, () => {
        logger_1.default.info(`Server started at port ${process.env.PORT}`);
    });
}
else if (process.env.NODE_ENV == "test") {
    http_1.default.createServer(app).listen(process.env.PORT, () => {
        logger_1.default.info(`Server started at port ${process.env.PORT}`);
    });
}
else if (process.env.NODE_ENV == "development") {
    app.listen(process.env.PORT, () => {
        logger_1.default.info(`=================================`);
        logger_1.default.info(`======= ENV: ${process.env.NODE_ENV} =======`);
        logger_1.default.info(`🚀 App listening on the port ${process.env.PORT}`);
        logger_1.default.info(`=================================`);
    });
}
