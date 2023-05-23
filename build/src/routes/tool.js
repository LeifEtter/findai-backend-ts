"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tool_controller_1 = require("../controllers/tool-controller");
const validation_1 = __importDefault(require("../helpers/validation"));
const validator_schemas_1 = __importDefault(require("../helpers/validator-schemas"));
const authentication_1 = __importDefault(require("../helpers/authentication"));
const toolRouter = express_1.default.Router();
toolRouter.route("/sync").get(tool_controller_1.syncToolsWithAirtable);
toolRouter.route("/bookmark/:id").patch(authentication_1.default, tool_controller_1.bookmarkTool);
toolRouter.route("/unbookmark/:id").patch(authentication_1.default, tool_controller_1.unbookmarkTool);
toolRouter.route("/").get(tool_controller_1.getToolsByQuery);
toolRouter.route("/:id").put((0, validation_1.default)(validator_schemas_1.default.createTool), tool_controller_1.updateSingleToolById);
toolRouter.route("/:id").delete(tool_controller_1.deleteSingleToolById);
toolRouter.route("/:id").get(tool_controller_1.getSingleToolById);
exports.default = toolRouter;
