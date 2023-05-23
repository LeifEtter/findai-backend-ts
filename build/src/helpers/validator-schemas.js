"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createTool = joi_1.default.object({
    title: joi_1.default.string().required().min(10),
});
const login = joi_1.default.object({
    email: joi_1.default.string().required().email(),
    password: joi_1.default.string().required().min(8),
});
const register = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().required().email(),
    password: joi_1.default.string().required().min(8),
    profileImage: joi_1.default.string().uri(),
    biography: joi_1.default.string(),
});
const updateProfile = joi_1.default.object({
    name: joi_1.default.string(),
    email: joi_1.default.string().email(),
    password: joi_1.default.string().min(8),
    profileImage: joi_1.default.string().uri(),
    biography: joi_1.default.string(),
});
const verify = joi_1.default.object({
    id: joi_1.default.number(),
    verificationCode: joi_1.default.number(),
});
const createTag = joi_1.default.object({
    name: joi_1.default.string(),
});
exports.default = {
    createTool,
    login,
    register,
    verify,
    createTag,
    updateProfile,
};
