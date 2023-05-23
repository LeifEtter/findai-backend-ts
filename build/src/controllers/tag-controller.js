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
exports.getTag = exports.syncTagsWithAirtable = exports.syncTags = void 0;
const dotenv = __importStar(require("dotenv"));
const db_1 = __importDefault(require("../db"));
const logger_1 = __importDefault(require("../logger"));
const airtable_controller_1 = require("./airtable-controller");
dotenv.config();
const unsyncAllTags = () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.tag.updateMany({
        data: {
            synced: false,
        },
    });
});
const deleteUnsyncedTags = () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.tag.deleteMany({
        where: {
            synced: false,
        },
    });
});
const syncTags = (tags) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield unsyncAllTags();
        for (const tag of tags) {
            const record = yield db_1.default.tag.findUnique({
                where: { id: tag.id },
            });
            if (!record) {
                yield db_1.default.tag.create({
                    data: { id: tag.id, name: tag.fields.name, synced: true },
                });
            }
            else {
                yield db_1.default.tag.update({
                    where: { id: tag.id },
                    data: {
                        name: tag.fields.name,
                        synced: true,
                    },
                });
            }
        }
        yield deleteUnsyncedTags();
        return;
    }
    catch (error) {
        console.error(error);
        throw new Error("Couldn't sync tags");
    }
});
exports.syncTags = syncTags;
const syncTagsWithAirtable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //TODO Implement skipping empty fields and fields where not all criteria are present
        const tags = yield (0, airtable_controller_1.fetchTagsFromAirtable)();
        yield syncTags(tags);
        return res.status(200).send({ message: "Tags successfully synced" });
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({ message: "Couldn't Sync Tags" });
    }
});
exports.syncTagsWithAirtable = syncTagsWithAirtable;
const getTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tag = yield db_1.default.tag.findUnique({
            where: { id: req.params.id },
            include: { tools: true },
        });
        logger_1.default.info(tag);
        return res.status(200).send({ tag });
    }
    catch (error) {
        logger_1.default.error(error);
        return res
            .status(500)
            .send({ message: "Something went wrong while trying to get this tag" });
    }
});
exports.getTag = getTag;
