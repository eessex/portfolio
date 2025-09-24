import type { EmbedCode } from '@/lib/embed-codes/types'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import styles from '@/ui/embed-codes/embed-codes.module.scss'

export const EmbedCodes = ({
  embedCodes
}: {
  embedCodes: EmbedCode[]
}) => {
  return (
    <div className={styles['embed-codes']}>
      {embedCodes.map((embedCode, index) => (
        <EmbedCodeItem
          key={index}
          embedCode={embedCode}
          isLazy={index === 0 && true}
        />
      ))}
    </div>
  )
}
