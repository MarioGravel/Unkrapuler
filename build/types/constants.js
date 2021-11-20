"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_EXT_REGEXP = void 0;
const FILE_EXT_REGEXP = (fileExt) => new RegExp(`\\.${fileExt}$`, "i");
exports.FILE_EXT_REGEXP = FILE_EXT_REGEXP;
