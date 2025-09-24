import type { Image } from '@/lib/images/types'
import { FigureImage } from '@/ui/images/image-figure'
import styles from '@/ui/images/images-grid.module.scss'

export function ImageGrid ({ images }: { images: Image[] }) {
  return (
    <ul className={styles['images-grid']}>
      {images.map((image, i) => (
        <li key={i}>
          <a
            href={image.url}
            target='_blank'
            rel='noopener noreferrer'
          >
            <FigureImage
              image={image}
              isLazy
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
