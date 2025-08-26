import { ImageGrid } from '@/ui/image-grid/image-grid'
import { type Image } from '@/lib/definitions'

export const ImagesDashboard = ({ images }: { images: Image[] }) => {
  return (
    <div>
      <h2 className='mb-4'>Images</h2>
      <ImageGrid images={images} />
    </div>
  )
}
