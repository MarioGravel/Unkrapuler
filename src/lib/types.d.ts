type ID3 = {
  title?: string
  artist?: string
  album?: string
  year?: string
  comments?: string
  track?: string
}

type ID3_Header = ID3V2_Header | ID3V1_Header

type ID3V1_Header = {
  id: string
}

type ID3V2_Header = {
  id: string
  version: {
    major: number
    minor: number
  }
  flags: {
    unsynchronization: boolean
    extended_header: boolean
    experimental: boolean
    footer_present: boolean
  }
  size: number
  content?: ID3V2_Frame[]
}

type ID3V2_Frame = {
  id: string
  size: number
  flags: {
    tag_8000_unused: boolean
    tag_alter_preservation: boolean
    file_alter_preservation: boolean
    readonly: boolean
    tag_0800_unused: boolean
    tag_0400_unused: boolean
    tag_0200_unused: boolean
    tag_0100_unused: boolean
    tag_0080_unused: boolean
    grouping_identity: boolean
    tag_0020_unused: boolean
    tag_0010_unused: boolean
    compression: boolean
    encryption: boolean
    unsynchronisation: boolean
    data_length_indicator: boolean
  }
  content: string
}
