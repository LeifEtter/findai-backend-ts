"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const airtable_controller_1 = require("../controllers/airtable-controller");
const authentication_1 = __importDefault(require("../helpers/authentication"));
const authorization_1 = __importDefault(require("../helpers/authorization"));
const client_1 = require("@prisma/client");
const airtableRouter = express_1.default.Router();
airtableRouter
    .route("/sync")
    .get(authentication_1.default, (0, authorization_1.default)(client_1.Role.ADMIN), airtable_controller_1.syncTagsAndToolsWithAirtable);
exports.default = airtableRouter;
