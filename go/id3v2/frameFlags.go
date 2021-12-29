package id3v2

const (
	DataLengthIndicator    Flag = 0
	FrameUnsynchronisation Flag = 1
	Encryption             Flag = 2
	Compression            Flag = 3
	GroupingIdentity       Flag = 6
	ReadOnly               Flag = 12
	FileAlterPreservation  Flag = 13
	TagAlterPreservation   Flag = 14
)

func frameFlags(data []byte) (flags [16]bool) {
	flags[DataLengthIndicator] = flag(DataLengthIndicator, data...)
	flags[FrameUnsynchronisation] = flag(FrameUnsynchronisation, data...)
	flags[Encryption] = flag(Encryption, data...)
	flags[Compression] = flag(Compression, data...)
	flags[NotUsed4] = flag(NotUsed4, data...)
	flags[NotUsed5] = flag(NotUsed5, data...)
	flags[GroupingIdentity] = flag(GroupingIdentity, data...)
	flags[NotUsed7] = flag(NotUsed7, data...)
	flags[NotUsed8] = flag(NotUsed8, data...)
	flags[NotUsed9] = flag(NotUsed9, data...)
	flags[NotUsed10] = flag(NotUsed10, data...)
	flags[NotUsed11] = flag(NotUsed11, data...)
	flags[ReadOnly] = flag(ReadOnly, data...)
	flags[FileAlterPreservation] = flag(FileAlterPreservation, data...)
	flags[TagAlterPreservation] = flag(TagAlterPreservation, data...)
	flags[NotUsed15] = flag(NotUsed15, data...)
	return flags
}
