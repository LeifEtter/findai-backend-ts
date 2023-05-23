"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tool_1 = __importDefault(require("./routes/tool"));
const user_1 = __importDefault(require("./routes/user"));
const tag_1 = __importDefault(require("./routes/tag"));
const airtable_1 = __importDefault(require("./routes/airtable"));
const api = express_1.default.Router();
api.use("/tools", tool_1.default);
api.use("/user", user_1.default);
api.use("/tag", tag_1.default);
api.use("/airtable", airtable_1.default);
exports.default = api;
