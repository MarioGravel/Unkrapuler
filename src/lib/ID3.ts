import fs from "fs"
import { TextDecoder } from "util"

const decoder = new TextDecoder("iso-8859-1")

const decode = (buffer: Buffer, encoding?: string) => {
  if (encoding) {
    return new TextDecoder(encoding)
      .decode(buffer)
      .replaceAll("\x00", "")
      .trim()
  }
  return decoder.decode(buffer).replaceAll("\x00", "").trim()
}

const getSize = (buffer: Buffer) => {
  const buff = [
    buffer.readUInt8(0),
    buffer.readUInt8(1),
    buffer.readUInt8(2),
    buffer.readUInt8(3),
  ]
  if (buff[0] > 0x80 || buff[1] > 0x80 || buff[2] > 0x80 || buff[3] > 0x80) {
    return 0
  }
  return (
    ((buff[0] & 0x7f) << 24) |
    ((buff[1] & 0x7f) << 16) |
    ((buff[2] & 0x7f) << 8) |
    (buff[3] & 0x7f)
  )
}

const getID3Id = (buffer: Buffer) => decode(buffer)

const parseID3V1 = (buffer: Buffer): ID3 => {
  const result = {} as ID3
  if (getID3Id(buffer.slice(0, 3)) === "TAG") {
    // we have a ID3V1 Tag
    result.title = decoder
      .decode(buffer.slice(3, 33))
      .replaceAll("\x00", "")
      .trim()
    result.artist = decode(buffer.slice(33, 63)).trim()
    result.album = decode(buffer.slice(63, 93)).trim()
    result.year = decode(buffer.slice(93, 97)).trim()
    result.track = buffer
      .slice(126, 127)
      .readUInt8()
      .toString()
      .padStart(2, "0")
  }
  if (result.track === "32") {
    result.track = undefined
  }
  return result
}

const getHeaderFlags = (buffer: Buffer) => {
  const flags = buffer.readUInt8(0)
  return {
    unsynchronization: !!(flags & 0x80),
    extended_header: !!(flags & 0x40),
    experimental: !!(flags & 0x20),
    footer_present: !!(flags & 0x10),
  }
}

const getFrameFlags = (buffer: Buffer) => {
  const flags = (buffer.readUInt8(0) << 8) | buffer.readUInt8(1)
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
  }
}

export const extractID3 = (file: FileEntry) => {
  const buffer = fs.readFileSync(file.absPath)
  const result = parseID3V1(buffer.slice(-128))
  const header = extractID3Header(buffer) as ID3V2_Header
  if (header.flags.footer_present) {
    console.warn("There might be some info in footer tags for " + file.absPath)
    console.log(extractID3Footer(buffer))
  }
  if ((header as ID3V2_Header).content !== undefined) {
    for (let tag of (header as ID3V2_Header).content || []) {
      switch (tag.id.trim()) {
        case "TALB": {
          //console.log(`${tag.id} : ${tag.content}`)
          result.album = tag.content
          break
        }
        case "TPE2":
        case "TPE1": {
          //console.log(`${tag.id} : ${tag.content}`)
          if (!result.artist) {
            result.artist = tag.content
          }
          break
        }
        case "TIT1": {
          //console.log(`${tag.id} : ${tag.content}`)
          //result.title = tag.content
          break
        }
        case "TIT2": {
          //console.log(`${tag.id} : ${tag.content}`)
          result.title = tag.content
          break
        }
        case "TRCK": {
          if (tag.content.trim() !== "") {
            result.track = parseInt(tag.content).toString().padStart(2, "0")
          } else {
            result.track = undefined
          }
          break
        }
        case "TYER": {
          result.year = tag.content
          break
        }
        case "":
        case "APIC": // Album Picture
        case "COMM":
        case "TXXX":
        case "PRIV":
          break
        default: {
          //console.log(`${tag.id} : ${tag.content}`)
          break
        }
      }
    }
  }
  return result
}

const extractID3Header = (buffer: Buffer): ID3_Header => {
  // See https://id3.org/id3v2.4.0-structure
  let result: ID3_Header = {
    id: getID3Id(buffer.slice(0, 3)),
  }
  if (result.id === "ID3") {
    const v2Result = {
      id: result.id,
      version: {
        major: buffer.readUInt8(3),
        minor: buffer.readUInt8(4),
      },
      flags: getHeaderFlags(buffer.slice(5, 6)),
      size: getSize(buffer.slice(6, 10)),
    } as ID3V2_Header
    if (!!v2Result.size) {
      v2Result.content = extractID3Frames(
        buffer.slice(
          10,
          10 + (v2Result.flags.footer_present ? 10 : 0) + v2Result.size
        )
      )
    }
    result = v2Result
  }
  return result
}

const extractID3Footer = (buffer: Buffer): ID3_Header => {
  // See https://id3.org/id3v2.4.0-structure
  let i: number
  let id: string = ""
  for (i = buffer.length - 4; i > 4; i--) {
    id = getID3Id(buffer.slice(i, i + 3))
    if (id === "3DI") {
      buffer = buffer.slice(i)
      break
    }
  }
  if (id === "") {
    return { id }
  }

  let result: ID3_Header = {
    id: getID3Id(buffer.slice(0, 3)),
  }
  if (result.id === "3DI") {
    const v2Result = {
      id: result.id,
      version: {
        major: buffer.readUInt8(3),
        minor: buffer.readUInt8(4),
      },
      flags: getHeaderFlags(buffer.slice(5, 6)),
      size: getSize(buffer.slice(6, 10)),
    } as ID3V2_Header
    if (!!v2Result.size) {
      v2Result.content = extractID3Frames(
        buffer.slice(
          10,
          10 + (v2Result.flags.footer_present ? 10 : 0) + v2Result.size
        )
      )
      result = v2Result
    }
  }
  return result
}

const extractID3Frames = (buffer: Buffer) => {
  const frames = [] as ID3V2_Frame[]
  let remainingBuffer = buffer
  let frame
  while (remainingBuffer.length > 20) {
    frame = extractID3Frame(remainingBuffer)
    if (!!frame?.size) {
      frames.push(frame)
    } else {
      break
    }
    if (remainingBuffer.length <= 10 + frame.size) {
      break
    }
    remainingBuffer = remainingBuffer.slice(10 + frame.size)
  }
  return frames
}

const extractID3Frame = (buffer: Buffer) => {
  const frame = {
    id: getID3Id(buffer.slice(0, 4)),
    size: getSize(buffer.slice(4, 8)),
    flags: getFrameFlags(buffer.slice(8, 10)),
    content: "",
  } as ID3V2_Frame
  if (frame.size <= 0) {
    return null
  }
  const contentBuffer = buffer.slice(10, 10 + frame.size)
  let encoding: BufferEncoding = "latin1"
  switch (contentBuffer.readUInt8(0)) {
    case 0x01: {
      encoding = "utf16le"
      break
    }
    case 0x02: {
      encoding = "hex"
      break
    }
    case 0x03: {
      encoding = "utf-8"
      break
    }
    case 0x00:
    default: {
      encoding = "latin1"
      break
    }
  }
  frame.content = contentBuffer
    .slice(1)
    .toString(encoding)
    .replaceAll("\x00", "")
    .trim()
  return frame
}
