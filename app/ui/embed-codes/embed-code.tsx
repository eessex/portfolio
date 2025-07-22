import { EmbedCode } from '@/lib/definitions'

export function EmbedCodeItem ({
  embedCode,
}: {
  embedCode: EmbedCode
}) {
  return (
    <figure>
      <div dangerouslySetInnerHTML={{ __html: embedCode.iframe }} />
      {embedCode.caption && <figcaption>{embedCode.caption}</figcaption>}
    </figure>
  )
}
