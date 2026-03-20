'use client'

import {
  audioEmbedCodeHosts,
  type EmbedCodeHost,
  type EmbedCodeType,
  videoEmbedCodeHosts
} from '@/lib/embed-codes/schemas'
import type { EmbedCode } from '@/lib/embed-codes/types'

export interface IFrameProps {
  src: string
  width: number
  height: number
  prettySrc?: string
  host: EmbedCodeHost | string
  type?: EmbedCodeType
  title?: string
}

export function defaultEmbedSizeByHost (host?: EmbedCodeHost): EmbedCodeDimensions {
  switch (host) {
    case 'bandcamp':
    case 'mixcloud':
      return {
        width: '100%', height: '120px'
      }
    case 'soundcloud':
      return {
        width: '100%', height: '166px'
      }
    case 'spotify':
      return {
        width: '100%', height: '80px'
      }
    default:
      return { aspectRatio: 16 / 9 }
  }
}

export function extractHostnameType (hostname: string) {
  const audioType = audioEmbedCodeHosts.find(host => hostname.includes(host))
  if (audioType) return 'audio'

  const videoType = videoEmbedCodeHosts.find(host => hostname.includes(host))
  if (videoType) return 'video'
}

export function extractHostFromUrl (url: string): EmbedCodeHost {
  const parsed = new URL(url)
  const hosts = [...audioEmbedCodeHosts, ...videoEmbedCodeHosts]
  const host = hosts.find(h => parsed.hostname.includes(h))
  return host as EmbedCodeHost // FIXME
}

function isSafeIframeUrl (url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

interface EmbedCodeDimensions {
  width?: '100%' | number
  height?: string | number
  aspectRatio?: number
}

interface EmbedCodeParams extends EmbedCodeDimensions {
  host?: EmbedCodeHost | string
  src: string
  title?: string
  type?: EmbedCodeType
}

function parseDimension (value?: string | null) {
  if (!value) return undefined
  const num = parseInt(value)
  return Number.isNaN(num) ? undefined : num
}

function extractIframeDimensions (
  iframeEl: HTMLIFrameElement,
  host: EmbedCodeHost | string
): EmbedCodeDimensions {
  let width: EmbedCodeDimensions['width']
  let height: EmbedCodeDimensions['height']
  let aspectRatio: EmbedCodeDimensions['aspectRatio']

  const widthAttr = iframeEl.getAttribute('width')
  const heightAttr = iframeEl.getAttribute('height')

  const rawWidth = widthAttr || iframeEl.style.width
  const rawHeight = heightAttr || iframeEl.style.height

  const parsedWidth = parseDimension(rawWidth)
  const parsedHeight = parseDimension(rawHeight)

  if (host === 'youtube' || host === 'vimeo') {
    return { aspectRatio: 16 / 9 }
  }

  // 100% width embeds (audio players etc)
  if (rawWidth === '100%' && parsedHeight) {
    width = '100%'
    height = parsedHeight
    return {
      width,
      height
    }
  }

  // Standard ratio calculation
  if (parsedWidth && parsedHeight) {
    aspectRatio = parsedWidth / parsedHeight
    return { aspectRatio }
  }

  return { aspectRatio: 16 / 9 }
}

export function extractIframeFallbackText (html: string): string | undefined {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // First try iframe fallback (Bandcamp case)
  const iframeMatch = html.match(/<iframe[^>]*>([\s\S]*?)<\/iframe>/i)
  if (iframeMatch && iframeMatch[1].trim()) {
    const inner = iframeMatch[1]
    const text = inner.replace(/<[^>]+>/g, '').trim()
    if (text) return decodeHtml(text)
  }

  // Otherwise collect anchor text outside iframe (SoundCloud case)
  const anchors = Array.from(doc.querySelectorAll('a'))
  if (!anchors.length) return undefined

  const texts = anchors
    .map(a => a.textContent?.trim())
    .filter(Boolean)

  return texts.join(' - ')
}

function decodeHtml (text: string) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

export function extractIframeTitle (iframe: string, iframeEl: HTMLIFrameElement): string | undefined {
  const title = iframeEl.getAttribute('title') ||
    extractIframeFallbackText(iframe) ||
    undefined

  return title
}

export function extractIframeParams (
  embedCode: Partial<EmbedCode>,
  isThrowOnError?: boolean
): EmbedCodeParams | null {
  if (typeof window === 'undefined' && !embedCode.src) {
    return null
  }
  let params: EmbedCodeParams

  if (embedCode.src) {
    params = {
      src: embedCode.src,
      host: embedCode.host || extractHostFromUrl(embedCode.src),
      type: embedCode.type || extractHostnameType(embedCode.src),
      title: embedCode.caption,
      ...defaultEmbedSizeByHost(embedCode.host || extractHostFromUrl(embedCode.src))
    }
    return params
  } else {
    const parser = new DOMParser()
    const doc = parser.parseFromString(embedCode.iframe!, 'text/html')
    const iframeEl = doc.querySelector('iframe')

    const src = iframeEl?.getAttribute('src')
    if (!src || !isSafeIframeUrl(src) || !iframeEl) {
      if (isThrowOnError) {
        throw new Error('Invalid iframe code.')
      }
      return null
    }
    const url = new URL(src || '')
    const host = extractHostFromUrl(src)
    const type = extractHostnameType(url.hostname)
    const title = extractIframeTitle(embedCode.iframe!, iframeEl)

    const {
      width,
      height,
      aspectRatio
    } = extractIframeDimensions(iframeEl, host)

    return {
      aspectRatio,
      height,
      host,
      src,
      title,
      type,
      width
    }
  }
}
