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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_sendgrid_1 = __importDefault(require("nodemailer-sendgrid"));
const sendEmail = ({ res, email, code }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport((0, nodemailer_sendgrid_1.default)({
            apiKey: process.env.SENDGRID_API_KEY,
        }));
        yield transporter.sendMail({
            from: '"Fact Checker App" <app.fact.checker@gmail.com>',
            to: email,
            subject: "Welcome to the Fact Checker App",
            text: "Its great to have you join!",
            html: `<h1>Here is the Verification Link</h1><h2>${code}</h2>`,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Something went wrong trying to deliver you the confirmation",
        });
    }
});
exports.sendEmail = sendEmail;
