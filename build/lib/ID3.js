"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractID3 = void 0;
var fs_1 = __importDefault(require("fs"));
var util_1 = require("util");
var decoder = new util_1.TextDecoder("iso-8859-1");
var decode = function (buffer, encoding) {
    if (encoding) {
        return new util_1.TextDecoder(encoding)
            .decode(buffer)
            .replaceAll("\x00", "")
            .trim();
    }
    return decoder.decode(buffer).replaceAll("\x00", "").trim();
};
var getSize = function (buffer) {
    var buff = [
        buffer.readUInt8(0),
        buffer.readUInt8(1),
        buffer.readUInt8(2),
        buffer.readUInt8(3),
    ];
    if (buff[0] > 0x80 || buff[1] > 0x80 || buff[2] > 0x80 || buff[3] > 0x80) {
        return 0;
    }
    return (((buff[0] & 0x7f) << 24) |
        ((buff[1] & 0x7f) << 16) |
        ((buff[2] & 0x7f) << 8) |
        (buff[3] & 0x7f));
};
var getID3Id = function (buffer) { return decode(buffer); };
var parseID3V1 = function (buffer) {
    var result = {};
    if (getID3Id(buffer.slice(0, 3)) === "TAG") {
        // we have a ID3V1 Tag
        result.title = decoder
            .decode(buffer.slice(3, 33))
            .replaceAll("\x00", "")
            .trim();
        result.artist = decode(buffer.slice(33, 63)).trim();
        result.album = decode(buffer.slice(63, 93)).trim();
        result.year = decode(buffer.slice(93, 97)).trim();
        result.track = buffer
            .slice(126, 127)
            .readUInt8()
            .toString()
            .padStart(2, "0");
    }
    if (result.track === "32") {
        result.track = undefined;
    }
    return result;
};
var getHeaderFlags = function (buffer) {
    var flags = buffer.readUInt8(0);
    return {
        unsynchronization: !!(flags & 0x80),
        extended_header: !!(flags & 0x40),
        experimental: !!(flags & 0x20),
        footer_present: !!(flags & 0x10),
    };
};
var getFrameFlags = function (buffer) {
    var flags = (buffer.readUInt8(0) << 8) | buffer.readUInt8(1);
    return {
        tag_8000_unused: !!(flags & 0x8000),
        tag_alter_preservation: !!(flags & 0x4000),
        file_alter_preservation: !!(flags & 0x2000),
        readonly: !!(flags & 0x1000),
        tag_0800_unused: !!(flags & 0x0800),
        tag_0400_unused: !!(flags & 0x0400),
        tag_0200_unused: !!(flags & 0x0200),
        tag_0100_unused: !!(flags & 0x0100),
        tag_0080_unused: !!(flags & 0x0080),
        grouping_identity: !!(flags & 0x0040),
        tag_0020_unused: !!(flags & 0x0020),
        tag_0010_unused: !!(flags & 0x0010),
        compression: !!(flags & 0x0008),
        encryption: !!(flags & 0x0004),
        unsynchronisation: !!(flags & 0x0002),
        data_length_indicator: !!(flags & 0x0001),
    };
};
var extractID3 = function (file) {
    var buffer = fs_1.default.readFileSync(file.absPath);
    var result = parseID3V1(buffer.slice(-128));
    var header = extractID3Header(buffer);
    if (header.flags.footer_present) {
        console.warn("There might be some info in footer tags for " + file.absPath);
        console.log(extractID3Footer(buffer));
    }
    if (header.content !== undefined) {
        for (var _i = 0, _a = header.content || []; _i < _a.length; _i++) {
            var tag = _a[_i];
            switch (tag.id.trim()) {
                case "TALB": {
                    //console.log(`${tag.id} : ${tag.content}`)
                    result.album = tag.content;
                    break;
                }
                case "TPE2":
                case "TPE1": {
                    //console.log(`${tag.id} : ${tag.content}`)
                    if (!result.artist) {
                        result.artist = tag.content;
                    }
                    break;
                }
                case "TIT1": {
                    //console.log(`${tag.id} : ${tag.content}`)
                    //result.title = tag.content
                    break;
                }
                case "TIT2": {
                    //console.log(`${tag.id} : ${tag.content}`)
                    result.title = tag.content;
                    break;
                }
                case "TRCK": {
                    if (tag.content.trim() !== "") {
                        result.track = parseInt(tag.content).toString().padStart(2, "0");
                    }
                    else {
                        result.track = undefined;
                    }
                    break;
                }
                case "TYER": {
                    result.year = tag.content;
                    break;
                }
                case "":
                case "APIC": // Album Picture
                case "COMM":
                case "TXXX":
                case "PRIV":
                    break;
                default: {
                    //console.log(`${tag.id} : ${tag.content}`)
                    break;
                }
            }
        }
    }
    return result;
};
exports.extractID3 = extractID3;
var extractID3Header = function (buffer) {
    // See https://id3.org/id3v2.4.0-structure
    var result = {
        id: getID3Id(buffer.slice(0, 3)),
    };
    if (result.id === "ID3") {
        var v2Result = {
            id: result.id,
            version: {
                major: buffer.readUInt8(3),
                minor: buffer.readUInt8(4),
            },
            flags: getHeaderFlags(buffer.slice(5, 6)),
            size: getSize(buffer.slice(6, 10)),
        };
        if (!!v2Result.size) {
            v2Result.content = extractID3Frames(buffer.slice(10, 10 + (v2Result.flags.footer_present ? 10 : 0) + v2Result.size));
        }
        result = v2Result;
    }
    return result;
};
var extractID3Footer = function (buffer) {
    // See https://id3.org/id3v2.4.0-structure
    var i;
    var id = "";
    for (i = buffer.length - 4; i > 4; i--) {
        id = getID3Id(buffer.slice(i, i + 3));
        if (id === "3DI") {
            buffer = buffer.slice(i);
            break;
        }
    }
    if (id === "") {
        return { id: id };
    }
    var result = {
        id: getID3Id(buffer.slice(0, 3)),
    };
    if (result.id === "3DI") {
        var v2Result = {
            id: result.id,
            version: {
                major: buffer.readUInt8(3),
                minor: buffer.readUInt8(4),
            },
            flags: getHeaderFlags(buffer.slice(5, 6)),
            size: getSize(buffer.slice(6, 10)),
        };
        if (!!v2Result.size) {
            v2Result.content = extractID3Frames(buffer.slice(10, 10 + (v2Result.flags.footer_present ? 10 : 0) + v2Result.size));
            result = v2Result;
        }
    }
    return result;
};
var extractID3Frames = function (buffer) {
    var frames = [];
    var remainingBuffer = buffer;
    var frame;
    while (remainingBuffer.length > 20) {
        frame = extractID3Frame(remainingBuffer);
        if (!!(frame === null || frame === void 0 ? void 0 : frame.size)) {
            frames.push(frame);
        }
        else {
            break;
        }
        if (remainingBuffer.length <= 10 + frame.size) {
            break;
        }
        remainingBuffer = remainingBuffer.slice(10 + frame.size);
    }
    return frames;
};
var extractID3Frame = function (buffer) {
    var frame = {
        id: getID3Id(buffer.slice(0, 4)),
        size: getSize(buffer.slice(4, 8)),
        flags: getFrameFlags(buffer.slice(8, 10)),
        content: "",
    };
    if (frame.size <= 0) {
        return null;
    }
    var contentBuffer = buffer.slice(10, 10 + frame.size);
    var encoding = "latin1";
    switch (contentBuffer.readUInt8(0)) {
        case 0x01: {
            encoding = "utf16le";
            break;
        }
        case 0x02: {
            encoding = "hex";
            break;
        }
        case 0x03: {
            encoding = "utf-8";
            break;
        }
        case 0x00:
        default: {
            encoding = "latin1";
            break;
        }
    }
    frame.content = contentBuffer
        .slice(1)
        .toString(encoding)
        .replaceAll("\x00", "")
        .trim();
    return frame;
};
//# sourceMappingURL=ID3.js.map