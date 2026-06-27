'use client'

import {
  audioEmbedCodeHosts,
  type EmbedCodeHost,
  embedCodeHosts,
  videoEmbedCodeHosts
} from '@/lib/embed-codes/schemas'
import type { CreateEmbedCode } from '@/lib/embed-codes/types'

export function defaultEmbedSizeByHost(
  host?: EmbedCodeHost
): EmbedCodeDimensions {
  switch (host) {
    case 'bandcamp':
    case 'mixcloud':
      return { height: '120px' }
    case 'soundcloud':
      return { height: '166px' }
    case 'spotify':
      return { height: '80px' }
    default:
      return { aspectRatio: 1.777 }
  }
}

export function extractHostnameType(hostname: EmbedCodeHost) {
  const audioType = audioEmbedCodeHosts.find((host) =>
    hostname.includes(host)
  )
  if (audioType) return 'audio'

  const videoType = videoEmbedCodeHosts.find((host) =>
    hostname.includes(host)
  )
  if (videoType) return 'video'

  return 'audio' // default to audio if unknown
}

export function extractHostFromUrl(url: string): EmbedCodeHost {
  const parsed = new URL(url)
  const host = embedCodeHosts.find((h) => parsed.hostname.includes(h))
  return host ?? 'unknown'
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
    (embedCode.src ? extractHostFromUrl(embedCode.src) : 'unknown')
  const type =
    embedCode.type ||
    (embedCode.src ? extractHostnameType(host) : 'audio')

  if (embedCode.src) {
    params = {
      src: embedCode.src,
      host,
      type,
      title: embedCode.caption,
      iframe: embedCode.iframe,
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
      iframe: embedCode.iframe,
      ...defaultEmbedSizeByHost(host)
    }
  }
}
