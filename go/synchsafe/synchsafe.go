package synchsafe

import (
	"fmt"
)

/*
   Synchsafe integers

   In some parts of the tag it is inconvenient to use the
   unsychronisation scheme because the size of unsynchronised data is
   not known in advance, which is particularly problematic with size
   descriptors. The solution in ID3v2 is to use synchsafe integers, in
   which there can never be any false synchs. Synchsafe integers are
   integers that keep its highest bit (bit 7) zeroed, making seven bits
   out of eight available. Thus a 32 bit synchsafe integer can store 28
   bits of information.

   Example:

     255 (%11111111) encoded as a 16 bit synchsafe integer is 383
     (%00000001 01111111).
*/

func SynchsafeToInt(value []byte) (sum uint64) {
	l := len(value) - 1
	sum = 0
	for i := 0; i <= l; i++ {
		sum += uint64(value[i]) << ((l - i) * 7)
	}
	return sum
}

func IntToSynchsafeByte(value uint8) []byte {
	return intToSynchsafe(uint64(value), 1)
}

func IntTo2SynchsafeBytes(value uint16) []byte {
	return intToSynchsafe(uint64(value), 2)
}

func IntTo4SynchsafeBytes(value uint32) []byte {
	return intToSynchsafe(uint64(value), 4)
}

func IntTo8SynchsafeBytes(value uint64) []byte {
	return intToSynchsafe(value, 8)
}

func intToSynchsafe(value uint64, numberOfBytes int) (ss []byte) {
	ss = make([]byte, numberOfBytes)
	for i := numberOfBytes - 1; i >= 0; i-- {
		ss[i] = byte(value & 127)
		value = value >> 7
	}
	return ss
}

func BytesToInt(value []byte) (sum uint64, err error) {
	l := len(value) - 1
	sum = 0
	for i := 0; i <= l; i++ {
		if value[i] > 0b01111111 {
			return 0, fmt.Errorf("invalid synchsafe integer, 0x%02x should be less than 0x80", value[i])
		}
		sum += uint64(value[i]) << ((l - i) * 8)
	}
	return sum, err
}
