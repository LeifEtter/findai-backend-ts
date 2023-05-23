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
const joi_1 = __importDefault(require("joi"));
const logger_1 = __importDefault(require("../logger"));
const validation = (validationObject) => function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield validationObject.validateAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof joi_1.default.ValidationError) {
                return res.status(400).send({ message: error.message });
            }
            logger_1.default.error(error);
            return res
                .status(500)
                .send({ message: "Something went wrong during validation" });
        }
    });
};
exports.default = validation;
