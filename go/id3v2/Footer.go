package id3v2

type Footer struct{}

func ExtractFooter(data []byte) *Footer {
	return &Footer{}
}
