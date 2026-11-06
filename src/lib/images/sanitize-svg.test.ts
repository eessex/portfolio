/** @jest-environment node */
import { sanitizeSvg } from '@/lib/images/sanitize-svg'

async function sanitize(svg: string) {
  return (await sanitizeSvg(Buffer.from(svg))).toString()
}

const open =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 10 10">'

describe('sanitizeSvg', () => {
  it('loads jsdom only when an SVG is sanitized', async () => {
    const onLoad = jest.fn()
    await jest.isolateModulesAsync(async () => {
      jest.doMock('jsdom', () => {
        onLoad()
        return jest.requireActual('jsdom')
      })
      const { sanitizeSvg } =
        await import('@/lib/images/sanitize-svg')
      expect(onLoad).not.toHaveBeenCalled()
      await sanitizeSvg(Buffer.from(`${open}</svg>`))
      expect(onLoad).toHaveBeenCalledTimes(1)
    })
  })

  it('strips scripts, event handlers and foreignObject', async () => {
    const clean = await sanitize(
      `${open.replace('>', ' onload="alert(1)">')}<script>alert(1)</script><foreignObject><div>hi</div></foreignObject><path d="M0 0h10v10z" onclick="alert(1)"/></svg>`
    )
    expect(clean).toBe(`${open}<path d="M0 0h10v10z"/></svg>`)
  })

  it('strips javascript: and external refs', async () => {
    const clean = await sanitize(
      `${open}<a href="javascript:alert(1)"><path d="M0 0h1v1z"/></a><use href="https://evil.example/x.svg#a"/><image xlink:href="https://evil.example/p.png"/><rect style="fill:url('https://evil.example/')"/><style>.b{background:url(https://evil.example/z.png)}</style></svg>`
    )
    expect(clean).not.toMatch(/javascript|evil/)
  })

  it('strips @import, image-set() and CSS-escaped url()', async () => {
    const clean = await sanitize(
      `${open}<style>@import 'https://evil.example/a.css';</style><style>.b{background:image-set('https://evil.example/b.png' 1x)}</style><rect style="fill:u\\72l(https://evil.example/c)"/><rect fill="ur\\l(https://evil.example/d)"/></svg>`
    )
    expect(clean).not.toMatch(/evil/)
  })

  it('strips an escape ended by CRLF, CR or form feed', async () => {
    const clean = await sanitize(
      `${open}<rect style="fill:u\\72&#13;&#10;l(https://evil.example/a)"/><rect style="fill:u\\72&#13;l(https://evil.example/b)"/><rect style="fill:u\\72&#12;l(https://evil.example/c)"/></svg>`
    )
    expect(clean).not.toMatch(/evil/)
  })

  it('serializes as XML, without HTML-only entities', async () => {
    expect(
      await sanitize(
        `${open}<text>Eve&nbsp;Essex &amp; co</text></svg>`
      )
    ).toBe(`${open}<text>Eve\u00a0Essex &amp; co</text></svg>`)
  })

  it('keeps same-document refs, gradients and styles', async () => {
    const svg = `${open}<defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><style>.a{fill:url(#g)}</style><use xlink:href="#g"/><path d="M0 0h10v10z" fill="url(#g)"/></svg>`
    expect(await sanitize(svg)).toBe(svg)
  })

  it('drops the XML prolog and doctype', async () => {
    expect(
      await sanitize(
        `<?xml version="1.0"?><!DOCTYPE svg>${open}<path d="M0 0h1v1z"/></svg>`
      )
    ).toBe(`${open}<path d="M0 0h1v1z"/></svg>`)
  })

  it('throws when no <svg> survives', async () => {
    await expect(
      sanitize('<script>alert(1)</script>')
    ).rejects.toThrow('SVG has no content after sanitizing')
  })
})
