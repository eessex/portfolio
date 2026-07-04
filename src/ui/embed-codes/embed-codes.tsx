import { useId } from 'react'

import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import { EmbedCodeItem } from '@/ui/embed-codes/embed-code'
import styles from '@/ui/embed-codes/embed-codes.module.scss'

export const EmbedCodes = ({
  embedCodes
}: {
  embedCodes: EmbedCode[]
}) => {
  const sectionId = useId()
  return (
    <section
      className={styles['embed-codes']}
      aria-labelledby={sectionId}
    >
      <h2 id={sectionId} className='visually-hidden'>
        Related Media
      </h2>
      {embedCodes.map((embedCode, index) => (
        <EmbedCodeItem key={index} embedCode={embedCode} />
      ))}
    </section>
  )
}
