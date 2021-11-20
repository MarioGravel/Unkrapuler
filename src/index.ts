import fs from "fs"
import path from "path"
import { FileExt } from "./types/enum"

const recursiveSearchFileExt = (startingPath: string, fileExt: RegExp, fileEntries: FileEntry[] = []) => {
  try {

  const entries = fs.readdirSync(path.join(startingPath), { withFileTypes: true })
  for (let entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("$")) {
      console.log(`Going into ${path.join(startingPath, entry.name)}`)
      recursiveSearchFileExt(path.join(startingPath, entry.name), fileExt, fileEntries)
    } else if (entry.name.match(fileExt) && entry.isFile()) {
      console.log(`${entry} is matching`)
      fileEntries.push({
        absPath: entry.name,
        "extension": entry.name.replace(/.*\.([^.])$/i, "$1"),
        "filename": entry.name
      })
    }
  }
  } catch(_error) {
    console.log(`Access denied for ${startingPath}`)
  } finally {
    return fileEntries
  }
}

const fileExt = new RegExp(`\\.${FileExt.MP3}$`, "i")
console.log(recursiveSearchFileExt(path.join("c:", "users", "bob", "music"), fileExt))
