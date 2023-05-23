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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaDataForUrl = void 0;
const cheerio = __importStar(require("cheerio"));
const getMetaDataForUrl = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fetchResult = yield fetch(url);
        const htmlText = yield fetchResult.text();
        const $ = cheerio.load(htmlText);
        const title = $("title").text();
        const description = $('meta[property="og:description"]').attr("content") ||
            $('meta[name="description"]').attr("content");
        let icon = $('url[rel="apple-touch-icon"]').attr("href") ||
            $('url[rel="icon"]').attr("href");
        if (icon && !icon.includes("http")) {
            icon = url.slice(-1) == "/" ? url.slice(0, -1) + icon : url + icon;
        }
        let image = $('meta[property="og:image"]').attr("content");
        if (image && !image.includes("http")) {
            image = url.slice(-1) == "/" ? url.slice(0, -1) + image : url + image;
        }
        return {
            title: title,
            description: description,
            image: image,
            icon: icon,
        };
    }
    catch (error) {
        throw new Error("Can't get metadata");
    }
});
exports.getMetaDataForUrl = getMetaDataForUrl;
