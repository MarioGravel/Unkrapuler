package id3v2

type Flag uint8

const (
	NotUsed0 Flag = iota
	NotUsed1
	NotUsed2
	NotUsed3
	NotUsed4
	NotUsed5
	NotUsed6
	NotUsed7
	NotUsed8
	NotUsed9
	NotUsed10
	NotUsed11
	NotUsed12
	NotUsed13
	NotUsed14
	NotUsed15
)

func flag(flag Flag, data ...byte) bool {
	qtyBytes := uint8(len(data) * 8)
	mask := uint8(1 << flag)
	maskPositionIntoArray := mask / 8
	if mask < qtyBytes {
		return uint8(data[maskPositionIntoArray])&mask > 0
	}
	return false
}
