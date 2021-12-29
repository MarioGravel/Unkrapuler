package id3v2

//FrameID is a 4 Char String of the "Frame Identifier"
type FrameID string

const (
	AlbumTitle FrameID = "TABL"
	Artist1    FrameID = "TPE1"
	Artist2    FrameID = "TPE2"
	Title1     FrameID = "TIT1"
	Title2     FrameID = "TIT2"
	Track      FrameID = "TRCK"
	Year       FrameID = "TYER"
	Unknown    FrameID = ""
)

func (f FrameID) Label() string {
	switch f {
	case AlbumTitle:
		return "Album"
	case Artist1:
		fallthrough
	case Artist2:
		return "Artiste"
	case Title1:
		fallthrough
	case Title2:
		return "Titre"
	case Track:
		return "Piste"
	case Year:
		return "Année"
	default:
		return ""
	}
}
