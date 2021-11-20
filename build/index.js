"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const enum_1 = require("./types/enum");
const recursiveSearchFileExt = (startingPath, fileExt, fileEntries = []) => {
    try {
        const entries = fs_1.default.readdirSync(path_1.default.join(startingPath), { withFileTypes: true });
        for (let entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("$")) {
                console.log(`Going into ${path_1.default.join(startingPath, entry.name)}`);
                recursiveSearchFileExt(path_1.default.join(startingPath, entry.name), fileExt, fileEntries);
            }
            else if (entry.name.match(fileExt) && entry.isFile()) {
                console.log(`${entry} is matching`);
                fileEntries.push({
                    absPath: entry.name,
                    "extension": entry.name.replace(/.*\.([^.])$/i, "$1"),
                    "filename": entry.name
                });
            }
        }
    }
    catch (_error) {
        console.log(`Access denied for ${startingPath}`);
    }
    finally {
        return fileEntries;
    }
};
const fileExt = new RegExp(`\\.${enum_1.FileExt.MP3}$`, "i");
console.log(recursiveSearchFileExt(path_1.default.join("c:", "users", "bob", "music"), fileExt));
