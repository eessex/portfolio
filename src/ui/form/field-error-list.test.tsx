import { render, screen } from '@testing-library/react'

import { FieldErrorList } from '@/ui/form/field-error-list'

describe('FieldErrorList', () => {
  it('renders nothing without errors', () => {
    const { container } = render(<FieldErrorList />)
    expect(container).toBeEmptyDOMElement()

    render(<FieldErrorList errors={[]} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders the errors as an alert with the given id', () => {
    render(<FieldErrorList id='title-error' errors={['Required']} />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('id', 'title-error')
    expect(alert).toHaveTextContent('Required.')
  })

  it('ends each message with one period', () => {
    render(
      <FieldErrorList
        errors={['Invalid option', 'Select a project.', 'Too long!']}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      /^Invalid option\. Select a project\. Too long!$/
    )
  })
})
