"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tag_controller_1 = require("../controllers/tag-controller");
const tagRouter = express_1.default.Router();
tagRouter.route("/sync").get(tag_controller_1.syncTagsWithAirtable);
tagRouter.route("/:id").get(tag_controller_1.getTag);
exports.default = tagRouter;
