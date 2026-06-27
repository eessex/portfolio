/** testing-only helper functions */

export function mockFile(
  name = 'test.jpg',
  size = 1024,
  type = 'image/jpeg'
): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

export const formDataFromObject = (v: Record<string, unknown>) => {
  const fd = new FormData()

  Object.entries(v).forEach(([k, val]) => {
    if (val === undefined || val === null) return

    if (val instanceof File) {
      fd.append(k, val)
      return
    }

    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item === undefined || item === null) return
        fd.append(k, String(item))
      })
      return
    }

    fd.append(k, String(val))
  })

  return fd
}
