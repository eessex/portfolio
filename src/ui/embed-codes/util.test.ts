import { extractHostFromUrl } from '@/ui/embed-codes/util'

describe('extractHostFromUrl', () => {
  it.each([
    ['https://www.youtube.com/embed/abc', 'youtube'],
    ['https://youtu.be/abc', 'youtube'],
    ['https://www.youtube-nocookie.com/embed/abc', 'youtube'],
    ['https://artist.bandcamp.com/album/x', 'bandcamp'],
    ['https://w.soundcloud.com/player/?url=x', 'soundcloud'],
    ['https://open.spotify.com/artist/x', 'spotify'],
    ['https://player.vimeo.com/video/1', 'vimeo'],
    ['https://www.mixcloud.com/artist/', 'mixcloud'],
    ['https://instagram.com/me', 'unknown']
  ])('%s → %s', (url, host) => {
    expect(extractHostFromUrl(url)).toBe(host)
  })
})
