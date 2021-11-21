"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var ID3_1 = require("./lib/ID3");
var enum_1 = require("./types/enum");
var BASE_PATH = path_1.default.join("c:", "users", "bob", "music");
var recursiveSearchFileExt = function (startingPath, fileExt, fileEntries) {
    if (fileEntries === void 0) { fileEntries = []; }
    try {
        var entries = fs_1.default.readdirSync(path_1.default.join(startingPath), {
            withFileTypes: true,
        });
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.name.startsWith(".")) {
                continue;
            }
            else if (entry.isDirectory() && !entry.name.startsWith("$")) {
                recursiveSearchFileExt(path_1.default.join(startingPath, entry.name), fileExt, fileEntries);
            }
            else if (entry.name.match(fileExt) && entry.isFile()) {
                fileEntries.push({
                    absPath: path_1.default.join(startingPath, entry.name),
                    extension: entry.name.replace(/.*\.([^.]*)$/i, "$1"),
                    filename: entry.name,
                });
            }
        }
    }
    catch (_error) {
        console.log("Access denied for ".concat(startingPath));
    }
    finally {
        return fileEntries;
    }
};
var fileExt = new RegExp("\\.".concat(enum_1.FileExt.MP3, "$"), "i");
var fileEntries = recursiveSearchFileExt(BASE_PATH, fileExt);
var filterForPath = function (filename) {
    return filename.replace(/\\|\/|\?|\*|\||\<|\>|\:|\"|\x00/gi, "").trim();
};
var newPath, artistDir, albumDir, originalDir, originalDirParent;
for (var _i = 0, fileEntries_1 = fileEntries; _i < fileEntries_1.length; _i++) {
    var fileEntry = fileEntries_1[_i];
    fileEntry.tags = (0, ID3_1.extractID3)(fileEntry);
    newPath = BASE_PATH;
    artistDir = undefined;
    albumDir = undefined;
    if ((_a = fileEntry.tags) === null || _a === void 0 ? void 0 : _a.artist) {
        newPath = path_1.default.join(newPath, filterForPath(fileEntry.tags.artist));
        artistDir = newPath;
    }
    if ((_b = fileEntry.tags) === null || _b === void 0 ? void 0 : _b.album) {
        newPath = path_1.default.join(newPath, filterForPath("".concat(fileEntry.tags.year ? "".concat(fileEntry.tags.year, " - ") : "").concat(fileEntry.tags.album)));
        albumDir = newPath;
    }
    if ((_c = fileEntry.tags) === null || _c === void 0 ? void 0 : _c.title) {
        newPath = path_1.default.join(newPath, filterForPath("".concat(fileEntry.tags.track ? "".concat(fileEntry.tags.track, " - ") : "").concat(fileEntry.tags.title, ".mp3")));
    }
    if (newPath !== BASE_PATH && fileEntry.absPath !== newPath) {
        console.log(fileEntry.absPath);
        console.log(newPath + "\n\n");
        if (((_d = fileEntry.tags) === null || _d === void 0 ? void 0 : _d.artist) &&
            ((_e = fileEntry.tags) === null || _e === void 0 ? void 0 : _e.album) &&
            ((_f = fileEntry.tags) === null || _f === void 0 ? void 0 : _f.title)) {
            if (artistDir && !fs_1.default.existsSync(artistDir)) {
                fs_1.default.mkdirSync(artistDir);
            }
            if (albumDir && !fs_1.default.existsSync(albumDir)) {
                fs_1.default.mkdirSync(albumDir);
            }
            fs_1.default.renameSync(fileEntry.absPath, newPath);
            originalDir = fileEntry.absPath.replace(/^(.*)[/\\][^/\\]+$/i, "$1");
            originalDirParent = originalDir.replace(/^(.*)[/\\][^/\\]+[/\\]?$/i, "$1");
            console.info("Checking for empty dir ".concat(originalDir));
            if (fs_1.default.readdirSync(originalDir).length === 0) {
                console.info("Deleting empty dir ".concat(originalDir));
                fs_1.default.rmdirSync(originalDir);
                console.info("Checking for parent empty dir ".concat(originalDirParent));
                if (fs_1.default.readdirSync(originalDirParent).length === 0) {
                    console.info("Deleting parent empty dir ".concat(originalDirParent));
                    fs_1.default.rmdirSync(originalDirParent);
                }
            }
        }
        else {
            console.log(fileEntry);
        }
    }
    else if (newPath === BASE_PATH) {
        console.log(fileEntry.absPath);
        console.log(newPath + "\n\n");
        console.log(fileEntry);
    }
}
//# sourceMappingURL=index.js.map