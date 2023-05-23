"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["dotenv/config"],
};
exports.default = config;
