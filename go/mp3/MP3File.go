package mp3

import (
	"fmt"
	"os"
	"path"
	"regexp"

	"mariogravel.com/unkrapuler/id3Tag"
	"mariogravel.com/unkrapuler/id3v1"
	"mariogravel.com/unkrapuler/id3v2"
)

type MP3File struct {
	file *File
	Tag  *id3Tag.ID3Tag
}

func (m *MP3File) String() (str string) {
	str += fmt.Sprintf("%q\n", m.FullPath())
	tag := *m.Tag
	str += fmt.Sprint(tag.Tag())
	return str
}

func GetFiles(basePath string) (mp3Files []MP3File, err error) {
	dir, err := os.Open(basePath)
	if err != nil {
		return
	}
	entries, err := dir.ReadDir(0)
	if err != nil {
		return
	}

	mp3Regex := regexp.MustCompile(`^.*\.[mM][pP]3$`)
	fmt.Printf("Seeking for mp3 files into %s\n", basePath)

	var filePath string
	var info os.FileInfo
	var mp3File MP3File
	for _, entry := range entries {
		filePath = path.Join(basePath, entry.Name())
		if mp3Regex.Match([]byte(entry.Name())) {
			// This is a MP3 file
			info, _ = entry.Info()
			mp3File = MP3File{file: NewFile(info, filePath)}
			mp3File.fillTagContent()
			mp3Files = append(mp3Files, mp3File)
		} else if entry.IsDir() {
			// This is a subfolder
			subFolderFiles, _ := GetFiles(filePath)
			mp3Files = append(mp3Files, subFolderFiles...)
		}
	}
	return mp3Files, err
}

func (m *MP3File) FullPath() string {
	return m.file.FullPath
}

func (m *MP3File) DirName() string {
	return m.file.DirName()
}

func (m *MP3File) fillTagContent() error {
	fmt.Printf("Searching Tag for %s\n", m.file.FullPath)

	file, _ := os.Open(m.file.FullPath)
	defer file.Close()

	stat, _ := file.Stat()

	data := make([]byte, stat.Size())
	dataLength, err := file.Read(data)
	if err != nil {
		return err
	}

	var tag id3Tag.ID3Tag = nil

	if v1tag := id3v1.ExtractID3v1Tag(data[dataLength-128:]); v1tag != nil {
		// Collect ID3v1 Tag
		tag = v1tag
		m.Tag = &tag
		fmt.Println("Got a V1 Tag")
	}

	if v2tag := id3v2.ExtractID3v2Tag(&data); v2tag != nil {
		// Collect ID3v2 Tag
		tag = v2tag
		m.Tag = &tag
		fmt.Println("Got a V2 Tag")
	}

	// Collect Other Tags

	return nil
}
