import {
  type EmbedCode,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { Carousel, CarouselItem } from '@/ui/carousel/carousel'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import styles from '@/ui/embed-codes/embed-codes.module.scss'

/** Names only the media types present. */
function embedCodesTitle(embedCodes: EmbedCode[]) {
  const hasVideo = embedCodes.some(
    ({ type }) => type === EmbedCodeTypes.video
  )
  const hasAudio = embedCodes.some(
    ({ type }) => type === EmbedCodeTypes.audio
  )
  if (hasVideo && hasAudio) return 'Video & audio'
  return hasVideo ? 'Video' : 'Audio'
}

/** Embeds in a carousel of columns, each at its host's default height. */
export function EmbedCodesCarousel({
  embedCodes
}: {
  embedCodes: EmbedCode[]
}) {
  return (
    <Carousel
      id='media'
      title={embedCodesTitle(embedCodes)}
      count={embedCodes.length}
      trackClassName={styles['carousel-track']}
    >
      {embedCodes.map((embedCode) => (
        <CarouselItem
          key={embedCode.id}
          className={styles['carousel-item']}
        >
          <EmbedCodeItem embedCode={embedCode} />
        </CarouselItem>
      ))}
    </Carousel>
  )
}
