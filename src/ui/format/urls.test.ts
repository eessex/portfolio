import { formattedLinkUrl } from '@/ui/format/urls'

describe('formattedLinkUrl', () => {
  it('drops www. and the trailing slash from a root URL', () => {
    expect(formattedLinkUrl('https://www.example.com/')).toBe(
      'example.com'
    )
  })

  it('drops the trailing slash from a nested path', () => {
    expect(
      formattedLinkUrl('https://example.com/press/review/?ref=x#top')
    ).toBe('example.com/press/review')
  })

  it('returns the input unchanged when it is not a valid URL', () => {
    expect(formattedLinkUrl('not a url')).toBe('not a url')
  })
})
