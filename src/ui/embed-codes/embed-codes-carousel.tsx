import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import { Carousel, CarouselItem } from '@/ui/carousel/carousel'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import styles from '@/ui/embed-codes/embed-codes.module.scss'

/** Embeds in a carousel of columns, each at its host's default height. */
export function EmbedCodesCarousel({
  embedCodes
}: {
  embedCodes: EmbedCode[]
}) {
  return (
    <Carousel
      id='media'
      title='Video & audio'
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
