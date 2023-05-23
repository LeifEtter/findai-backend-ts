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
exports.updateProfile = exports.deleteSelf = exports.deleteUserById = exports.verify = exports.register = exports.login = exports.getProfile = exports.getProfileById = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const email_1 = require("../helpers/email");
const logger_1 = __importDefault(require("../logger"));
const saltRounds = 10;
const getProfileById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield db_1.default.user.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!profile) {
            return res.status(400).send({
                message: `Couldn't find a profile for user with id: ${req.params.id}`,
            });
        }
        profile["password"] = "-- redacted --";
        return res.status(200).send({
            message: `Successfully queried profile for user with id: ${req.params.id}`,
            profile,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({ message: "Something went wrong" });
    }
});
exports.getProfileById = getProfileById;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.locals.user["password"] = "-- redacted --";
        return res.status(200).send({ profile: res.locals.user });
    }
    catch (error) {
        logger_1.default.error(error);
        return res
            .status(500)
            .send({ message: "Something went wrong while getting your profile" });
    }
});
exports.getProfile = getProfile;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, saltRounds);
        const verificationCode = Math.floor(Math.random() * 100000);
        (0, email_1.sendEmail)({ res: res, email: req.body.email, code: verificationCode });
        const user = yield db_1.default.user.create({
            data: {
                name: req.body.name,
                password: hashedPassword,
                email: req.body.email,
                profileImage: req.body.profileImage,
                biography: req.body.biography,
                role: client_1.Role.USER,
                verificationCode,
            },
        });
        return res.status(201).send({
            userId: user.id,
            message: "An Email with your verification code has been sent, please use the user/verify route and provide you're user id and code",
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code == "P2002") {
            return res.status(400).send({ message: "Email is already in use" });
        }
        logger_1.default.error(error);
        if (error)
            return res
                .status(500)
                .send({ message: "Something went wrong during registration" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.default.user.findUnique({
            where: { email: req.body.email },
        });
        if (!user || user.verified == false) {
            return res
                .status(400)
                .send({ message: "No verified user found with this email address" });
        }
        const pwIsMatch = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (pwIsMatch) {
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
            }, process.env.JWT_SECRET, {
                algorithm: "HS256",
                expiresIn: "2h",
            });
            return res.status(200).send({ token });
        }
        else {
            return res
                .status(401)
                .send({ message: "Email and Password don't match" });
        }
    }
    catch (error) {
        logger_1.default.error(error);
        return res.status(500).send({ message: "Couldn't log in" });
    }
});
exports.login = login;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.default.user.findUnique({ where: { id: req.body.id } });
        if (!user || user.verified) {
            return res
                .status(400)
                .send({ message: "No unverified user found for this user id" });
        }
        if (user.verificationCode == req.body.verificationCode) {
            yield db_1.default.user.update({
                where: { id: req.body.id },
                data: { verified: true },
            });
        }
        return res.status(200).send({ message: "Verified user successfully" });
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong during verification" });
    }
});
exports.verify = verify;
const deleteSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.user.delete({ where: { id: res.locals.user.id } });
        return res.status(200).send({ message: "Account deleted successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(200);
    }
});
exports.deleteSelf = deleteSelf;
const deleteUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.user.delete({ where: { id: parseInt(req.params.id) } });
        return res
            .status(200)
            .send({ message: `User with id ${req.params.id} deleted successfully` });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code == "P2025") {
                return res.status(400).send({ message: "User couldn't be found" });
            }
        }
        logger_1.default.error(error);
        return res.status(500).send({
            message: "Something went wrong while trying to delete the account",
        });
    }
});
exports.deleteUserById = deleteUserById;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.email && req.body.email != res.locals.email) {
            return res.status(400).send({
                message: "Please use the 'users/update/email' route to change your email ",
            });
        }
        const user = yield db_1.default.user.update({
            where: {
                id: res.locals.user.id,
            },
            data: Object.assign(Object.assign(Object.assign({}, (req.body.biography && { biography: req.body.biography })), (req.body.profileImage && { profileImage: req.body.profileImage })), (req.body.password && {
                password: yield bcrypt_1.default.hash(req.body.password, saltRounds),
            })),
        });
        if (!user) {
            throw new Error();
        }
        user.password = "-- redacted --";
        return res.status(200).send({ message: "Updated successfully", user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Something went wrong while trying to update your profile",
        });
    }
});
exports.updateProfile = updateProfile;
