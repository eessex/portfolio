import { type Image } from '@/lib/definitions'
import styles from '@/ui/image-grid/image-grid.module.scss'
import { FigureImage } from './image-figure'

export function ImageGrid ({ images }: { images: Image[] }) {
  return (
    <ul className={styles['image-grid']}>
      {images.map((image, i) => (
        <li key={i}>
          <a href={image.url} target='_blank' rel='noopener noreferrer'>
            <FigureImage image={image} isLazy />
          </a>
        </li>
      ))}
    </ul>
  )
}
