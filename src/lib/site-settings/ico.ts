/**
 * Packs PNGs into one .ico. sharp can't write ICO, but an ICO entry
 * may be a whole PNG, which every current browser reads.
 */
const HEADER_SIZE = 6
const ENTRY_SIZE = 16

export function packIco(
  images: { size: number; png: Buffer }[]
): Buffer {
  const header = Buffer.alloc(
    HEADER_SIZE + ENTRY_SIZE * images.length
  )
  header.writeUInt16LE(0, 0)
  // type 1: icon
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  let offset = header.length
  for (const [index, { size, png }] of images.entries()) {
    const entry = HEADER_SIZE + ENTRY_SIZE * index
    // 0 means 256
    header.writeUInt8(size >= 256 ? 0 : size, entry)
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    // colour count and reserved stay 0
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += png.length
  }
  return Buffer.concat([header, ...images.map(({ png }) => png)])
}
