package id3v2

import (
	"fmt"

	"mariogravel.com/unkrapuler/synchsafe"
)

type Frame struct {
	data []byte
}

func (f *Frame) String() string {
	value := f.Value()
	if f.FrameID() == Year && len(value) == 1 {
		year := int(value[0])
		if year == 0 {
			return ""
		}
		return fmt.Sprintf("%s: %v", Year.Label(), string(year))
	}

	return fmt.Sprintf("%s: %v", f.FrameID().Label(), string(value[1:]))
}

func (f *Frame) Value() []byte {
	return f.data[10 : 10+f.Size()]
}

func (f *Frame) FrameID() FrameID {
	fID := FrameID(string(f.data[:4]))
	if fID.Label() != "" {
		return fID
	}
	return Unknown
}

func (f *Frame) Size() uint32 {
	size, _ := synchsafe.BytesToInt(f.data[4:8])
	return uint32(size)
}

//Flags included into the Frame's Header
func (f *Frame) Flag(frameFlag Flag) bool {
	return flag(frameFlag, f.data[8:10]...)
}

func (f *Frame) Flags() [16]bool {
	return frameFlags(f.data[8:10])
}

func NewFrame(data []byte) *Frame {
	frameData, err := ExtractFrameData(data)
	if err != nil {
		return nil
	}
	return &Frame{
		data: frameData,
	}
}

func ExtractFrameData(data []byte) ([]byte, error) {
	frameSize, err := synchsafe.BytesToInt(data[4:8])
	if err != nil || frameSize <= 0 {
		return []byte{}, err
	}
	return data[:frameSize+10], nil
}

func ExtractFrames(data []byte) map[FrameID]*Frame {
	frames := make(map[FrameID]*Frame)
	wantedFrames := []FrameID{
		AlbumTitle,
		Artist1,
		Artist2,
		Title1,
		Title2,
		Track,
		Year,
	}
	slicedData := data[:]
	var foundAt, frameSize int
	var foundFrame *Frame
	for len(slicedData) > 10 {
		foundAt, frameSize = SeekForFrameIDs(slicedData, wantedFrames...)
		if frameSize <= 0 {
			break
		}
		foundFrame = NewFrame(slicedData[foundAt : foundAt+frameSize+10])
		frames[foundFrame.FrameID()] = foundFrame
		slicedData = slicedData[foundAt+frameSize+10:]
	}

	return frames
}
