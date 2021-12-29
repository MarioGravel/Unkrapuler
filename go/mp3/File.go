package mp3

import (
	"io/fs"
	"path"
)

type File struct {
	Info     fs.FileInfo
	FullPath string
}

func (m *File) DirName() string {
	dir, _ := path.Split(m.FullPath)
	return dir
}

func (m *File) FileName() string {
	_, file := path.Split(m.FullPath)
	return file
}

func NewFile(Info fs.FileInfo, FullPath string) *File {
	return &File{
		Info,
		FullPath,
	}
}
