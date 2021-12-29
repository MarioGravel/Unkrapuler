package id3v2

const (
	FooterPresent Flag = iota + 4
	ExperimentalIndicator
	ExtendedHeaderPresent
	HeaderUnsynchronisation
)

func headerFlags(data byte) (flags [8]bool) {
	flags[NotUsed0] = false
	flags[NotUsed1] = false
	flags[NotUsed2] = false
	flags[NotUsed3] = false
	flags[FooterPresent] = flag(FooterPresent, data)
	flags[ExperimentalIndicator] = flag(ExperimentalIndicator, data)
	flags[ExtendedHeaderPresent] = flag(ExtendedHeaderPresent, data)
	flags[HeaderUnsynchronisation] = flag(HeaderUnsynchronisation, data)
	return flags
}
