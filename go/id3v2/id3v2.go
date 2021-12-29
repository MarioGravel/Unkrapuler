package id3v2

import (
	"bytes"
	"fmt"
	"regexp"

	"mariogravel.com/unkrapuler/synchsafe"
)

type ID3v2 struct {
	data           *[]byte
	Header         *Header
	ExtendedHeader *ExtendedHeader
	Frames         map[FrameID]*Frame
	Padding        *Padding
	Footer         *Footer
}

func (t *ID3v2) Tag() string {
	out := "ID3v2 Tag :\n"
	var frameContent *Frame
	for _, f := range []FrameID{
		Artist1,
		Artist2,
		AlbumTitle,
		Year,
		Track,
		Title1,
		Title2,
	} {
		frameContent = t.Frames[f]
		if frameContent != nil {
			if str := frameContent.String(); len(str) > 0 {
				out += fmt.Sprintf("%s\n", frameContent.String())
			}
		}
	}
	return out
}

func ExtractID3v2Tag(data *[]byte) *ID3v2 {
	out := new(ID3v2)
	out.data = data
	dataSlice := *data
	out.Header = NewHeader(dataSlice[:10])
	if out.Header == nil {
		// Invalid Tag
		return nil
	}
	tagSize := out.Header.Size()
	if out.Header.Flag(ExtendedHeaderPresent) {
		out.ExtendedHeader = ExtractExtendedHeader(dataSlice[10:])
	}
	out.Frames = ExtractFrames(dataSlice[10 : 10+tagSize+1024])
	if out.Header.Flag(FooterPresent) {
		// If there is a Footer, Padding is not allowed
		out.Footer = ExtractFooter(dataSlice[10+tagSize:])
	} else {
		// Padding is only allowed when no Footer is present
		out.Padding = ExtractPadding(dataSlice[10 : 10+tagSize])
	}
	return out
}

//SeekForID3 will return the position of the first "ID3" string found.
func SeekForID3(data []byte) int {
	pos := int(-1)
	for i := int(0); i < len(data)-2; i++ {
		if bytes.Equal(data[i:i+3], []byte("ID3")) {
			pos = i
			break
		}
	}
	return pos
}

//SeekForFrameIDs will seek the data dans return the position and the FrameID of the first found
func SeekForFrameIDs(data []byte, frameIDs ...FrameID) (int, int) {
	pos := -1
	size := uint64(0)
	var err error = nil
	regex := regexp.MustCompile("^[A-Z0-9]{4}$")
mainLoop:
	// A frame must have a 10 bytes header and be at least 1 byte long. 11 bytes minimum
	for i := 0; i < len(data)-10; i++ {
		if subject := data[i : i+4]; regex.Match(subject) {
			// Compare the subject only if it complies to the rules of a Frame Identifier
			for _, fID := range frameIDs {
				if bytes.Equal(subject, []byte(fID)) {
					size, err = synchsafe.BytesToInt(data[i+4 : i+8])
					if err != nil {
						err = nil
						continue mainLoop
					}
					pos = i
					break mainLoop
				}
			}
		}
	}
	return pos, int(size)
}

//version return a string of the extracted version from the data
func version(data []byte) (string, error) {
	if len(data) != 2 {
		return "", fmt.Errorf("invalid []byte length, must be [2]byte")
	}

	if data[0] == 0xFF || data[1] == 0xFF {
		return "", fmt.Errorf("invalid version, must never contains 0xFF")
	}

	return fmt.Sprintf("2.%d.%d", data[0], data[1]), nil
}
