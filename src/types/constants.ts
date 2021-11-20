import { FileExt } from "./enum"

export const FILE_EXT_REGEXP = (fileExt: FileExt) => new RegExp(`\\.${fileExt}$`, "i")