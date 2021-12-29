package id3v2

import (
	"bytes"
	"fmt"

	"mariogravel.com/unkrapuler/synchsafe"
)

type Header struct {
	data []byte
}

//NewHeader is a constructor. Will return a pointer to nil of the data is an invalid header
func NewHeader(data []byte) *Header {
	headerData, err := ExtractHeaderData(data)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	return &Header{
		data: headerData,
	}
}

//ExtractHeaderData validate the content for a ID3v2 header and return the content
func ExtractHeaderData(data []byte) ([]byte, error) {
	// Validate the "File Identifier"
	if !bytes.Equal(data[:3], []byte("ID3")) {
		return nil, fmt.Errorf("invalid file identifier in ID3v2 header")
	}

	// Validate the Version
	if data[3] == 0xFF || data[4] == 0xFF {
		return nil, fmt.Errorf("invalid version of ID3v2 header")
	}

	// Validate the flags
	if data[5]&0b00001111 > 0 {
		return nil, fmt.Errorf("invalid flags in ID3v2 header")
	}

	// Validate the size
	_, err := synchsafe.BytesToInt(data[6:10])
	if err != nil {
		return nil, err
	}

	// Everything looks ledgit
	return data[:10], nil
}

//Version of this ID3v2 Header
func (h *Header) Version() string {
	version, err := version(h.data[3:5])
	if err != nil {
		return "invalid version"
	}
	return version
}

//Flags included into the Header
func (h *Header) Flags() [8]bool {
	return headerFlags(h.data[5])
}

//Flags included into the Header
func (h *Header) Flag(headerFlag Flag) bool {
	return flag(headerFlag, h.data[5])
}

func (h *Header) Size() uint32 {
	if h == nil || h.data == nil {
		fmt.Printf("nil here %v\n", h)
		return 0
	}
	if length := len(h.data); length != 10 {
		fmt.Printf("wrong data length. Expected 10 but got %d\n", length)
		return 0
	}
	size, _ := synchsafe.BytesToInt(h.data[6:10])
	return uint32(size)
}
