package id3v2

import (
	"testing"
)

func TestSeekForID3(t *testing.T) {
	t.Parallel()
	payload := []byte("Id3id3i3DID3jdifhrjfn")
	expected := 9
	result := SeekForID3(payload)
	if expected != result {
		t.Errorf("%q should return %d but we got %d\n", payload, expected, result)
	}

	payload = []byte("Id3id3i3DI3jdifhrjfnID3")
	expected = 20
	result = SeekForID3(payload)
	if expected != result {
		t.Errorf("%q should return %d but we got %d\n", payload, expected, result)
	}

	payload = []byte("ID3id3i3DI3jdifhrjfn")
	expected = 0
	result = SeekForID3(payload)
	if expected != result {
		t.Errorf("%q should return %d but we got %d\n", payload, expected, result)
	}

	payload = []byte("Id3id3i3DI3jdifhrjfn")
	expected = -1
	result = SeekForID3(payload)
	if expected != result {
		t.Errorf("%q should return %d but we got %d\n", payload, expected, result)
	}
}

func TestSeekForFrameIDs(t *testing.T) {
	t.Parallel()
	payload := []byte("Id3id3i3DID3jdifhrjfn")
	frameIds := []FrameID{
		AlbumTitle,
		Artist1,
		Artist2,
		Title1,
		Title2,
		Track,
		Unknown,
		Year,
	}
	expectedPosition := -1
	expectedSize := 0
	position, size := SeekForFrameIDs(payload, frameIds...)
	if expectedPosition != position {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedPosition, position)
	} else if expectedSize != size {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedSize, size)
	}

	payload = append([]byte("Id3id3TABL"), 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 'b', 'l', 'a', '!')
	expectedPosition = 6
	expectedSize = 4
	position, size = SeekForFrameIDs(payload, frameIds...)
	if expectedPosition != position {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedPosition, position)
	} else if expectedSize != size {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedSize, size)
	}

	payload = append([]byte("TRCK"), 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, '!')
	expectedPosition = 0
	expectedSize = 1
	position, size = SeekForFrameIDs(payload, frameIds...)
	if expectedPosition != position {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedPosition, position)
	} else if expectedSize != size {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedSize, size)
	}

	// Invalid length, should return nothing
	payload = append([]byte("gdTYER"), 0x00, 0x00, 0x99, 0x01, 0x00, 0x00, '!')
	expectedPosition = -1
	expectedSize = 0
	position, size = SeekForFrameIDs(payload, frameIds...)
	if expectedPosition != position {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedPosition, position)
	} else if expectedSize != size {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedSize, size)
	}

	// Invalid all, should return nothing
	payload = []byte{0, 0, 66, 97, 115, 115, 32, 83, 111, 108, 111}
	expectedPosition = -1
	expectedSize = 0
	position, size = SeekForFrameIDs(payload, frameIds...)
	if expectedPosition != position {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedPosition, position)
	} else if expectedSize != size {
		t.Errorf("%q should return %d but we got %d\n", payload, expectedSize, size)
	}

}

func TestVersion(t *testing.T) {
	t.Parallel()
	data := []byte{0x10, 0x20}
	expected := "2.16.32"
	result, err := version(data)
	if err != nil {
		t.Error("should not had received an error")
	}
	if result != expected {
		t.Errorf("expecting %q but received %q", expected, result)
	}

	data = []byte{0x04, 0xFF}
	expected = ""
	result, err = version(data)
	if err == nil {
		t.Error("should had received an error but we didn't")
	}
	if result != expected {
		t.Errorf("expecting %q but received %q", expected, result)
	}

	data = []byte{0xFF, 0x08}
	expected = ""
	result, err = version(data)
	if err == nil {
		t.Error("should had received an error but we didn't")
	}
	if result != expected {
		t.Errorf("expecting %q but received %q", expected, result)
	}
}
