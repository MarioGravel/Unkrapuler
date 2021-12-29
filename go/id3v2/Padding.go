package id3v2

type Padding struct{}

func ExtractPadding(data []byte) *Padding {
	return &Padding{}
}
