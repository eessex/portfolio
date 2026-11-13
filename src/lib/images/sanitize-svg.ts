/**
 * Server-only, deliberately not a `'use server'` module: its exports
 * would otherwise be public server actions.
 */
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const URL_PATTERN = /url\(\s*['"]?\s*([^'")\s]*)/gi
// fetch without url(): @import 'x', image-set('x'), src('x')
const BARE_FETCH_PATTERN = /@import|image-set\(|\bsrc\(/i

// only same-document refs; anything else can load or run outside the file
function isLocalRef(value: string) {
  return value.trim().startsWith('#')
}

// a /* inside a string isn't a comment; strings are kept, so a url()
// in one is still checked
function stripCssComments(css: string) {
  let out = ''
  let quote: string | undefined
  for (let i = 0; i < css.length; i++) {
    const char = css[i]!
    if (char === '\\') {
      out += css.slice(i, i + 2)
      i++
    } else if (quote) {
      // an unescaped newline ends a string too
      if (char === quote || char === '\n') quote = undefined
      out += char
    } else if (char === '"' || char === "'") {
      quote = char
      out += char
    } else if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2)
      if (end < 0) break
      i = end + 1
    } else {
      out += char
    }
  }
  return out
}

// so u\72l( and ur\l( read as url(. Newlines normalized first, as
// CSS does, so an escape's one trailing whitespace takes a whole CRLF
function decodeCssEscapes(css: string) {
  return stripCssComments(css.replace(/\r\n?|\f/g, '\n'))
    .replace(/\\([0-9a-f]{1,6})\s?/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16) || 0xfffd)
    )
    .replace(/\\([^\n])/g, '$1')
}

function hasExternalRef(css: string) {
  const decoded = decodeCssEscapes(css)
  return (
    BARE_FETCH_PATTERN.test(decoded) ||
    [...decoded.matchAll(URL_PATTERN)].some(
      ([, ref]) => !isLocalRef(ref ?? '')
    )
  )
}

// opened from the storage host, an SVG is an active document. jsdom
// is loaded on the first SVG, so other uploads never pay its startup
async function createPurifier() {
  const [{ default: DOMPurify }, { JSDOM }] = await Promise.all([
    import('dompurify'),
    import('jsdom')
  ])
  const { window } = new JSDOM('')
  const purify = DOMPurify(window)

  purify.addHook('uponSanitizeAttribute', (_node, data) => {
    const name = data.attrName.toLowerCase()
    if (
      (name === 'href' || name === 'xlink:href') &&
      !isLocalRef(data.attrValue)
    ) {
      data.keepAttr = false
    }
    // presentation attributes are CSS too
    if (hasExternalRef(data.attrValue)) data.keepAttr = false
  })

  purify.addHook('uponSanitizeElement', (node, data) => {
    if (
      data.tagName === 'style' &&
      hasExternalRef(node.textContent ?? '')
    ) {
      node.parentNode?.removeChild(node)
    }
  })
  return { purify, serializer: new window.XMLSerializer() }
}

let purifier: ReturnType<typeof createPurifier> | undefined

function getPurifier() {
  purifier ??= createPurifier().catch((err) => {
    // let the next upload try again
    purifier = undefined
    throw err
  })
  return purifier
}

/**
 * Strips scripts, event handlers, foreignObject and external refs.
 * Throws when nothing of the root <svg> survives.
 */
export async function sanitizeSvg(bytes: Buffer): Promise<Buffer> {
  const { purify, serializer } = await getPurifier()
  // RETURN_DOM gives the <body>, typed as a bare Node
  const body = purify.sanitize(bytes.toString('utf8'), {
    USE_PROFILES: { svg: true, svgFilters: true },
    // design tools export reused shapes as <use>; the hook keeps it local
    ADD_TAGS: ['use'],
    FORBID_TAGS: ['foreignObject', 'script'],
    RETURN_DOM: true
  }) as HTMLElement
  const svg = [...body.children].find(
    (el) =>
      el.localName === 'svg' && el.namespaceURI === SVG_NAMESPACE
  )
  if (!svg) {
    throw new Error('SVG has no content after sanitizing')
  }
  // parsed as HTML; serialized as XML, which an image/svg+xml file must be
  return Buffer.from(serializer.serializeToString(svg), 'utf8')
}
