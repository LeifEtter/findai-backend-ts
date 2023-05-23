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
exports.unbookmarkTool = exports.bookmarkTool = exports.updateSingleToolById = exports.deleteSingleToolById = exports.getToolsByQuery = exports.getSingleToolById = exports.syncToolsWithAirtable = exports.syncTools = void 0;
const db_1 = __importDefault(require("../db"));
const dotenv = __importStar(require("dotenv"));
const scraping_1 = require("../helpers/scraping");
const conversion_1 = require("../helpers/conversion");
const logger_1 = __importDefault(require("../logger"));
const airtable_controller_1 = require("./airtable-controller");
dotenv.config();
const unsyncTools = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.tool.updateMany({ data: { synced: false } });
        return;
    }
    catch (error) {
        throw new Error("Sync Failed");
    }
});
const cleanupUnsyncedTools = () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.tool.deleteMany({
        where: {
            synced: false,
        },
    });
});
const syncTools = (tools) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        yield unsyncTools();
        for (const tool of tools) {
            const meta = yield (0, scraping_1.getMetaDataForUrl)(tool.fields.link);
            const record = yield db_1.default.tool.findUnique({
                where: {
                    url: tool.fields.link,
                },
            });
            if (record == null) {
                //TODO Implement skipping empty fields and fields where not all criteria are present
                yield db_1.default.tool.create({
                    data: {
                        id: tool.id,
                        url: tool.fields.link,
                        name: tool.fields.title,
                        description: tool.fields.description || meta.description || "No description",
                        price: tool.fields.price,
                        priceModel: tool.fields.priceModel,
                        approval: tool.fields.approval,
                        tags: {
                            connect: (_a = tool.fields.tags) === null || _a === void 0 ? void 0 : _a.map((id) => ({ id: id })),
                        },
                        creator: {
                            connect: {
                                id: 1,
                            },
                        },
                        image: meta.image,
                        icon: meta.icon,
                        synced: true,
                    },
                });
            }
            else {
                yield db_1.default.tool.update({
                    where: { url: tool.fields.link },
                    data: {
                        url: tool.fields.link,
                        name: tool.fields.title,
                        price: tool.fields.price,
                        priceModel: tool.fields.priceModel,
                        approval: tool.fields.approval,
                        tags: {
                            connect: (_b = tool.fields.tags) === null || _b === void 0 ? void 0 : _b.map((id) => ({ id: id })),
                        },
                        synced: true,
                    },
                });
            }
        }
        yield cleanupUnsyncedTools();
        return;
    }
    catch (error) {
        console.error(error);
        throw new Error("Couldn't sync tools");
    }
});
exports.syncTools = syncTools;
const syncToolsWithAirtable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tools = yield (0, airtable_controller_1.fetchToolsFromAirtable)();
        yield syncTools(tools);
        //TODO Implement rescraping if this is passed in query
        return res.status(200).send({ message: "Synced Successfully" });
    }
    catch (error) {
        logger_1.default.error(error);
        throw new Error("Couldn't Sync Airtable Data with Database");
    }
});
exports.syncToolsWithAirtable = syncToolsWithAirtable;
const getSingleToolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tool = yield db_1.default.tool.findUnique({
            where: { id: req.params.id },
        });
        return res.status(200).send(tool);
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({ message: "Something went wrong " });
    }
});
exports.getSingleToolById = getSingleToolById;
const getToolsByQuery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = (0, conversion_1.convertQueryToList)(req.query.tag);
        console.log(tags);
        const order = req.query.sort;
        let some = {};
        if (tags.length != 0) {
            some = { OR: tags.map((tag) => ({ name: tag })) };
        }
        const orderBy = (0, conversion_1.convertOrderQueryToOrderObject)(order);
        const result = yield db_1.default.tool.findMany({
            where: {
                tags: Object.assign({}, (some && { some: some })),
            },
            orderBy,
        });
        return res.status(200).send({ result });
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({ message: "Couldn't fulfill query" });
    }
});
exports.getToolsByQuery = getToolsByQuery;
const deleteSingleToolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.tool
            .delete({
            where: { id: req.params.id },
        })
            .catch((error) => {
            if (error.code == "P2025")
                return res
                    .status(404)
                    .send({ message: "Can't find tool to be deleted" });
        });
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({ message: "Couldn't delete tool" });
    }
});
exports.deleteSingleToolById = deleteSingleToolById;
const updateSingleToolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).send({ message: "Updated tool successfully" });
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({ message: "Couldn't update tool" });
    }
});
exports.updateSingleToolById = updateSingleToolById;
const unbookmarkTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tool = yield db_1.default.tool.findUnique({ where: { id: req.params.id } });
        if (!tool) {
            return res
                .status(400)
                .send({ message: "No tool with that id could be found" });
        }
        const user = res.locals.user;
        yield db_1.default.user.update({
            where: { id: user.id },
            data: {
                bookmarkedTools: {
                    disconnect: {
                        id: req.params.id,
                    },
                },
            },
        });
        return res
            .status(201)
            .send({ message: "Tool successfully removed from bookmarks" });
    }
    catch (error) {
        logger_1.default.error(error);
        return res
            .status(500)
            .send({ message: "Something went wrong while trying to bookmark tool" });
    }
});
exports.unbookmarkTool = unbookmarkTool;
const bookmarkTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tool = yield db_1.default.tool.findUnique({ where: { id: req.params.id } });
        if (!tool) {
            return res
                .status(400)
                .send({ message: "No tool with that id could be found" });
        }
        const user = res.locals.user;
        yield db_1.default.user.update({
            where: { id: user.id },
            data: {
                bookmarkedTools: {
                    connect: {
                        id: req.params.id,
                    },
                },
            },
        });
        return res.status(201).send({ message: "Tool successfully bookmarked" });
    }
    catch (error) {
        logger_1.default.error(error);
        return res
            .status(500)
            .send({ message: "Something went wrong while trying to bookmark tool" });
    }
});
exports.bookmarkTool = bookmarkTool;
