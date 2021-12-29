package synchsafe_test

import (
	"bytes"
	"testing"

	"mariogravel.com/unkrapuler/synchsafe"
)

func TestSynchsafeToInt(t *testing.T) {
	value := []byte{
		0b00000001,
	}
	expect := uint64(1)
	result := synchsafe.SynchsafeToInt(value)
	if result != expect {
		t.Errorf("%08b should return %d but got %d", value[0], expect, result)
	}

	value = []byte{
		0b00000001,
		0b01111111,
	}
	// expecting 14 bits out of 16
	expect = uint64(0b00000011111111)
	result = synchsafe.SynchsafeToInt(value)
	if result != expect {
		t.Errorf("%08b %08b should return %d but got %d", value[0], value[1], expect, result)
	}

	value = []byte{
		0b01000000,
		0b00100000,
		0b00010000,
		0b00001000,
	}
	// expecting 28 bits out of 32
	expect = uint64(0b1000000010000000100000001000)
	result = synchsafe.SynchsafeToInt(value)
	if result != expect {
		t.Errorf("%08b %08b %08b %08b should return %d but got %d", value[0], value[1], value[2], value[3], expect, result)
	}
}

func TestBytesToInt(t *testing.T) {
	value := []byte{
		0b00000001,
	}
	expect := uint64(1)
	result, err := synchsafe.BytesToInt(value)
	if err != nil {
		t.Errorf("Received an error : %q", err)
	}
	if result != expect {
		t.Errorf("%08b should return %d but got %d", value[0], expect, result)
	}

	value = []byte{
		0b00000001,
		0b01111111,
	}
	expect = uint64(0b0000000101111111)
	result, err = synchsafe.BytesToInt(value)
	if err != nil {
		t.Errorf("Received an error : %q", err)
	}
	if result != expect {
		t.Errorf("%08b %08b should return %d but got %d", value[0], value[1], expect, result)
	}

	value = []byte{
		0b01000000,
		0b00100000,
		0b00010000,
		0b00001000,
	}
	expect = uint64(0b01000000001000000001000000001000)
	result, err = synchsafe.BytesToInt(value)
	if err != nil {
		t.Errorf("Received an error : %q", err)
	}
	if result != expect {
		t.Errorf("%08b %08b %08b %08b should return %d but got %d", value[0], value[1], value[2], value[3], expect, result)
	}

	value = []byte{
		0b10000000,
		0b00100000,
		0b00001000,
		0b00000010,
	}
	expect = uint64(0)
	result, err = synchsafe.BytesToInt(value)
	if err == nil {
		t.Error("Should had received an error")
	}
	if result != expect {
		t.Errorf("%08b %08b %08b %08b should return %d but got %d", value[0], value[1], value[2], value[3], expect, result)
	}
}

func TestIntToSynchsafeBytes(t *testing.T) {
	value := uint64(1)
	expect := []byte{
		0b00000001,
	}
	result := synchsafe.IntToSynchsafeByte(uint8(value))
	if len(result) == 0 {
		t.Errorf("synchsafe.IntToSynchsafe(value) returned an empty array")
	} else if !bytes.Equal(result, expect) {
		t.Errorf("%d should return %08b but got %08b", value, expect[0], result[0])
	}

	value = uint64(0b10000000000001)
	expect = []byte{
		0b01000000,
		0b00000001,
	}
	result = synchsafe.IntTo2SynchsafeBytes(uint16(value))
	if len(result) == 0 {
		t.Errorf("synchsafe.IntToSynchsafe(value) returned an empty array")
	} else if !bytes.Equal(result, expect) {
		t.Errorf("%d should return %08b %08b but got %08b %08b", value, expect[0], expect[1], result[0], result[1])
	}

	value = uint64(0b1000000010000000100000000001)
	expect = []byte{
		0b01000000,
		0b00100000,
		0b00010000,
		0b00000001,
	}
	result = synchsafe.IntTo4SynchsafeBytes(uint32(value))
	if len(result) == 0 {
		t.Errorf("synchsafe.IntToSynchsafe(value) returned an empty array")
	} else if !bytes.Equal(result, expect) {
		t.Errorf("%d should return %08b %08b %08b %08b but got %08b %08b %08b %08b",
			value,
			expect[0],
			expect[1],
			expect[2],
			expect[3],
			result[0],
			result[1],
			result[2],
			result[3],
		)
	}

	value = uint64(0b10000001000000100000010000001000000100000010000000000001)
	expect = []byte{
		0b01000000,
		0b01000000,
		0b01000000,
		0b01000000,
		0b01000000,
		0b01000000,
		0b01000000,
		0b00000001,
	}
	result = synchsafe.IntTo8SynchsafeBytes(value)
	if len(result) == 0 {
		t.Errorf("synchsafe.IntToSynchsafe(value) returned an empty array")
	} else if !bytes.Equal(result, expect) {
		t.Errorf("%d should return %08b %08b %08b %08b %08b %08b %08b %08b "+
			"but got %08b %08b %08b %08b %08b %08b %08b %08b",
			value,
			expect[0],
			expect[1],
			expect[2],
			expect[3],
			expect[4],
			expect[5],
			expect[6],
			expect[7],
			result[0],
			result[1],
			result[2],
			result[3],
			result[4],
			result[5],
			result[6],
			result[7],
		)
	}
}
