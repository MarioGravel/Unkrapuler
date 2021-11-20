import fs from "fs"
import path from "path"


const recursiveSearchFileExt = (startingPath: string, fileExt:string) => {
  const entries = fs.readdirSync(path.join("/"))
  return entries
}

console.log(recursiveSearchFileExt(path.join("/"), "mp3"))
