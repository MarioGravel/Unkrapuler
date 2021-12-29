package id3v2

import "mariogravel.com/unkrapuler/synchsafe"

type ExtendedHeader struct {
	data []byte
}

func ExtractExtendedHeader(data []byte) *ExtendedHeader {
	return &ExtendedHeader{}
}

func (eh *ExtendedHeader) Size() uint32 {
	size, err := synchsafe.BytesToInt(eh.data[0:4])
	if err != nil {
		return 0
	}
	return uint32(size)
}
