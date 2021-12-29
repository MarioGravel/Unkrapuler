package id3v1

import (
	"bytes"
	"fmt"
)

type ID3v1 struct {
	tag *map[string]string
}

func (t *ID3v1) Tag() (out string) {
	tag := *t.tag
	out += fmt.Sprintf("Artiste: %s\n"+
		"Year: %s\n"+
		"Album: %s\n",
		tag["Artist"],
		tag["Year"],
		tag["Album"])
	if track := tag["Track"]; track != "00" {
		out += fmt.Sprintf("Piste: %s\n", track)
	}
	out += fmt.Sprintf("Titre: %s\n"+
		"Commentaires: %s",
		tag["Title"],
		tag["Comments"])
	return out
}

func ExtractID3v1Tag(data []byte) *ID3v1 {
	if length := len(data); length > 128 {
		data = data[length-128:]
	}
	if len(data) == 128 && bytes.Equal(data[:3], []byte("TAG")) {
		out := make(map[string]string)
		out["Title"] = string(data[3:33])
		out["Artist"] = string(data[33:63])
		out["Album"] = string(data[63:93])
		out["Year"] = string(data[93:97])
		if data[125] == 0x00 {
			out["Comments"] = string(data[97:125])
			out["Track"] = fmt.Sprintf("%02d", data[126])
		} else {
			out["Comments"] = string(data[97:127])
		}
		return &ID3v1{tag: &out}
	}
	return nil
}
