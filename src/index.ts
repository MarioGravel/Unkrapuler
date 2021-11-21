import fs from "fs"
import path from "path"
import { extractID3 } from "./lib/ID3"
import { FileExt } from "./types/enum"

const BASE_PATH = path.join("c:", "users", "bob", "music")

const recursiveSearchFileExt = (
  startingPath: string,
  fileExt: RegExp,
  fileEntries: FileEntry[] = []
) => {
  try {
    const entries = fs.readdirSync(path.join(startingPath), {
      withFileTypes: true,
    })
    for (let entry of entries) {
      if (entry.name.startsWith(".")) {
        continue
      } else if (entry.isDirectory() && !entry.name.startsWith("$")) {
        recursiveSearchFileExt(
          path.join(startingPath, entry.name),
          fileExt,
          fileEntries
        )
      } else if (entry.name.match(fileExt) && entry.isFile()) {
        fileEntries.push({
          absPath: path.join(startingPath, entry.name),
          extension: entry.name.replace(/.*\.([^.]*)$/i, "$1"),
          filename: entry.name,
        })
      }
    }
  } catch (_error) {
    console.log(`Access denied for ${startingPath}`)
  } finally {
    return fileEntries
  }
}

const fileExt = new RegExp(`\\.${FileExt.MP3}$`, "i")

const fileEntries = recursiveSearchFileExt(BASE_PATH, fileExt)

const filterForPath = (filename: string) => {
  return filename.replace(/\\|\/|\?|\*|\||\<|\>|\:|\"|\x00/gi, "").trim()
}

let newPath: string,
  artistDir: string | undefined,
  albumDir: string | undefined,
  originalDir: string,
  originalDirParent: string
for (let fileEntry of fileEntries) {
  fileEntry.tags = extractID3(fileEntry)
  newPath = BASE_PATH
  artistDir = undefined
  albumDir = undefined
  if (fileEntry.tags?.artist) {
    newPath = path.join(newPath, filterForPath(fileEntry.tags.artist))
    artistDir = newPath
  }
  if (fileEntry.tags?.album) {
    newPath = path.join(
      newPath,
      filterForPath(
        `${fileEntry.tags.year ? `${fileEntry.tags.year} - ` : ""}${
          fileEntry.tags.album
        }`
      )
    )
    albumDir = newPath
  }
  if (fileEntry.tags?.title) {
    newPath = path.join(
      newPath,
      filterForPath(
        `${fileEntry.tags.track ? `${fileEntry.tags.track} - ` : ""}${
          fileEntry.tags.title
        }.mp3`
      )
    )
  }
  if (newPath !== BASE_PATH && fileEntry.absPath !== newPath) {
    console.log(fileEntry.absPath)
    console.log(newPath + "\n\n")
    if (
      fileEntry.tags?.artist &&
      fileEntry.tags?.album &&
      fileEntry.tags?.title
    ) {
      if (artistDir && !fs.existsSync(artistDir)) {
        fs.mkdirSync(artistDir)
      }
      if (albumDir && !fs.existsSync(albumDir)) {
        fs.mkdirSync(albumDir)
      }
      fs.renameSync(fileEntry.absPath, newPath)
      originalDir = fileEntry.absPath.replace(/^(.*)[/\\][^/\\]+$/i, "$1")
      originalDirParent = originalDir.replace(/^(.*)[/\\][^/\\]+[/\\]?$/i, "$1")

      console.info(`Checking for empty dir ${originalDir}`)
      if (fs.readdirSync(originalDir).length === 0) {
        console.info(`Deleting empty dir ${originalDir}`)
        fs.rmdirSync(originalDir)
        console.info(`Checking for parent empty dir ${originalDirParent}`)
        if (fs.readdirSync(originalDirParent).length === 0) {
          console.info(`Deleting parent empty dir ${originalDirParent}`)
          fs.rmdirSync(originalDirParent)
        }
      }
    } else {
      console.log(fileEntry)
    }
  } else if (newPath === BASE_PATH) {
    console.log(fileEntry.absPath)
    console.log(newPath + "\n\n")
    console.log(fileEntry)
  }
}
