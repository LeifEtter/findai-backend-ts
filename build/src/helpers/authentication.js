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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const db_1 = __importDefault(require("../db"));
dotenv.config();
const authentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: "Please provide a token" });
    }
    let jwtToken;
    if (req.headers.authorization.startsWith("Bearer" || "bearer")) {
        jwtToken = req.headers.authorization.split(" ")[1];
    }
    else {
        jwtToken = req.headers.authorization;
    }
    try {
        const verifiedToken = jsonwebtoken_1.default.verify(jwtToken, process.env.JWT_SECRET);
        if (typeof verifiedToken == "string") {
            console.error("The JWT Token decoded to a string unexpectedly");
            return res
                .status(500)
                .send({ message: "Something went wrong during auth" });
        }
        const user = yield db_1.default.user.findUnique({
            where: { id: verifiedToken.userId },
        });
        if (!user) {
            return res.status(400).send({
                message: "User couldn't be found with user id provided in the jwt token",
            });
        }
        if (!user.verified) {
            return res.status(401).send({
                message: "Your account is still unverified, please verify under 'users/verify' with the code provided by email, before accessing routes that require authentication",
            });
        }
        res.locals.user = user;
        next();
    }
    catch (error) {
        return res.status(403).send({
            message: "Your token can't be verified, the time of validity might have passed",
        });
    }
});
exports.default = authentication;
