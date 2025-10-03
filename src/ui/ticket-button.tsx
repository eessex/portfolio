import { TicketIcon } from '@heroicons/react/24/outline'

export function TicketButton ({ url }: { url: string }) {
  return (
    <a
      className='button'
      href={url}
      target='_blank'
      rel='noreferrer'
    >
      <TicketIcon />Tickets
    </a>
  )
}
