import { ErrorMessage } from '@/ui/error-message/error-message'

export default function NotFound() {
  return (
    <ErrorMessage
      title='Page not found'
      message="Sorry, we couldn't find the page you're looking for."
    />
  )
}
