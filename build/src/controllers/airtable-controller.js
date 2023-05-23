"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTagsAndToolsWithAirtable = exports.fetchToolsFromAirtable = exports.fetchTagsFromAirtable = void 0;
const logger_1 = __importDefault(require("../logger"));
const tag_controller_1 = require("./tag-controller");
const tool_controller_1 = require("./tool-controller");
const fetchTagsFromAirtable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${process.env.AIRTABLE_URL}/${process.env.AIRTABLE_TAG_TABLE_ID}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
            },
        });
        const result = JSON.parse(yield response.text());
        return result.records;
    }
    catch (error) {
        logger_1.default.error(error);
        throw new Error("Failed to get data from Airtable");
    }
});
exports.fetchTagsFromAirtable = fetchTagsFromAirtable;
const fetchToolsFromAirtable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${process.env.AIRTABLE_URL}/${process.env.AIRTABLE_TOOL_TABLE_ID}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
            },
        });
        const result = JSON.parse(yield response.text());
        return result.records;
    }
    catch (error) {
        logger_1.default.error(error);
        throw new Error("Failed to get data from Airtable");
    }
});
exports.fetchToolsFromAirtable = fetchToolsFromAirtable;
const syncTagsAndToolsWithAirtable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield fetchTagsFromAirtable();
        yield (0, tag_controller_1.syncTags)(tags);
        const tools = yield fetchToolsFromAirtable();
        yield (0, tool_controller_1.syncTools)(tools);
        return res
            .status(200)
            .send({ message: "Successfully synced tags and tools with airtable" });
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({
            message: "Something went wrong while trying to sync tools and tags with airtable data",
        });
    }
});
exports.syncTagsAndToolsWithAirtable = syncTagsAndToolsWithAirtable;
