"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertOrderQueryToOrderObject = exports.convertQueryToList = void 0;
const convertQueryToList = (query) => {
    let result = [];
    if (!query) {
        result = [];
    }
    else if (!Array.isArray(query)) {
        result = [query];
    }
    else {
        result = query;
    }
    return result;
};
exports.convertQueryToList = convertQueryToList;
const convertOrderQueryToOrderObject = (orderBy) => {
    if (!orderBy) {
        return {};
    }
    else if (orderBy == "bookmarks") {
        return {
            bookmarkedBy: {
                _count: "desc",
            },
        };
    }
    else if (orderBy == "upvotes") {
        return {
            upvotes: {
                _count: "desc",
            },
        };
    }
    else {
        return {};
    }
};
exports.convertOrderQueryToOrderObject = convertOrderQueryToOrderObject;
