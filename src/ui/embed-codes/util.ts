'use client'

import {
  type CreateEmbedCode,
  type EmbedCodeHost,
  EmbedCodeHosts,
  embedCodeHosts,
  EmbedCodeHostsByType,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'

export function defaultEmbedSizeByHost(
  host?: EmbedCodeHost
): EmbedCodeDimensions {
  switch (host) {
    case EmbedCodeHosts.bandcamp:
    case EmbedCodeHosts.mixcloud:
      return { height: '120px' }
    case EmbedCodeHosts.soundcloud:
      return { height: '166px' }
    case EmbedCodeHosts.spotify:
      return { height: '80px' }
    default:
      return { aspectRatio: 1.777 }
  }
}

export function extractHostnameType(hostname: EmbedCodeHost) {
  const videoType = EmbedCodeHostsByType.video.find((host) =>
    hostname.includes(host)
  )
  if (videoType) return EmbedCodeTypes.video

  return EmbedCodeTypes.audio
}

export function extractHostFromUrl(url: string): EmbedCodeHost {
  const parsed = new URL(url)
  const host = embedCodeHosts.find((h) => parsed.hostname.includes(h))
  return host ?? EmbedCodeHosts.unknown
}

function isSafeIframeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

interface EmbedCodeDimensions {
  height?: string | number
  aspectRatio?: number
}

export function extractIframeFallbackText(
  html: string
): string | undefined {
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
    .map((a) => a.textContent?.trim())
    .filter(Boolean)

  return texts.join(' - ')
}

function decodeHtml(text: string) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

export function extractIframeTitle(
  iframe: string,
  iframeEl: HTMLIFrameElement
): string | undefined {
  const title =
    iframeEl.getAttribute('title') ||
    extractIframeFallbackText(iframe) ||
    undefined

  return title
}

export function extractIframeParams(
  embedCode: Partial<CreateEmbedCode> & { iframe: string },
  isThrowOnError?: boolean
): CreateEmbedCode | null {
  if (typeof window === 'undefined' && !embedCode.src) {
    return null
  }
  let params: CreateEmbedCode
  const host =
    embedCode.host ||
    (embedCode.src
      ? extractHostFromUrl(embedCode.src)
      : EmbedCodeHosts.unknown)
  const type =
    embedCode.type ||
    (embedCode.src ? extractHostnameType(host) : EmbedCodeTypes.audio)

  if (embedCode.src) {
    params = {
      src: embedCode.src,
      host,
      type,
      title: embedCode.caption,
      ...defaultEmbedSizeByHost(host)
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
    const host = extractHostFromUrl(src)
    const type = extractHostnameType(host)
    const title = extractIframeTitle(embedCode.iframe!, iframeEl)

    return {
      host,
      src,
      title,
      type,
      ...defaultEmbedSizeByHost(host)
    }
  }
}
