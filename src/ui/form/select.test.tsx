import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Select } from '@/ui/form/select'

const options = ['album', 'single']

describe('Select', () => {
  it('renders without an onChange (uncontrolled)', () => {
    render(
      <Select
        label='Type'
        options={options}
        value='single'
        attributes={{ name: 'type' }}
      />
    )

    const select = screen.getByRole('combobox', { name: /type/i })
    expect(select).toHaveValue('single')
    expect(select).toHaveAttribute('name', 'type')
  })

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(
      <Select label='Type' options={options} onChange={onChange} />
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: /type/i }),
      'album'
    )

    expect(onChange).toHaveBeenCalledWith('album')
  })

  it('renders nothing without options', () => {
    const { container } = render(<Select label='Type' options={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows field errors and links them to the select', () => {
    render(
      <Select
        label='Type'
        options={options}
        errors={['Invalid option', 'Required']}
      />
    )

    const select = screen.getByRole('combobox', { name: /type/i })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Invalid option. Required.')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAttribute('aria-describedby', alert.id)
  })

  it('has no error state without errors', () => {
    render(<Select label='Type' options={options} errors={[]} />)

    const select = screen.getByRole('combobox', { name: /type/i })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(select).not.toHaveAttribute('aria-invalid')
    expect(select).not.toHaveAttribute('aria-describedby')
  })
})
