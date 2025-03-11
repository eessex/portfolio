import { type Image } from '@/lib/definitions'
import styles from '@/ui/image-grid/image-grid.module.scss'

export default function ImageGrid ({ images }: { images: Image[] }) {
  return (
    <ul className={styles['image-grid']}>
      {images.map((image, i) => (
        <li key={i}>
          <figure>
            <a href={image.url} target='_blank' rel='noopener noreferrer'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption}
                style={{ aspectRatio: image.aspect }}
                title={image.caption}
                loading='lazy'
              />
              <figcaption>{image.caption}</figcaption>
            </a>
          </figure>
        </li>
      ))}
    </ul>
  )
}
