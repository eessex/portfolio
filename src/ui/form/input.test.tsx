import { fireEvent, render, screen } from '@testing-library/react'

import { Input } from '@/ui/form/input'

describe('Input', () => {
  describe('dirty state', () => {
    it('is not dirty on initial render', () => {
      render(<Input label='URL' attributes={{ name: 'url' }} />)

      expect(screen.getByLabelText(/url/i)).not.toHaveClass('dirty')
    })

    it('does not mark dirty while typing, before any blur', () => {
      render(<Input label='URL' attributes={{ name: 'url' }} />)
      const input = screen.getByLabelText(/url/i)

      fireEvent.change(input, { target: { value: 'h' } })

      expect(input).not.toHaveClass('dirty')
    })

    it('marks dirty once the changed field is blurred', () => {
      render(<Input label='URL' attributes={{ name: 'url' }} />)
      const input = screen.getByLabelText(/url/i)

      fireEvent.change(input, { target: { value: 'h' } })
      fireEvent.blur(input)

      expect(input).toHaveClass('dirty')
    })

    it('does not mark dirty on blur when the value is unchanged', () => {
      render(
        <Input
          label='URL'
          attributes={{ name: 'url' }}
          defaultValue='https://example.com'
        />
      )
      const input = screen.getByLabelText(/url/i)

      fireEvent.blur(input)

      expect(input).not.toHaveClass('dirty')
    })
  })

  describe('onBlur prop', () => {
    it('calls the passed onBlur handler', () => {
      const onBlur = jest.fn()
      render(
        <Input
          label='URL'
          attributes={{ name: 'url' }}
          onBlur={onBlur}
        />
      )

      fireEvent.blur(screen.getByLabelText(/url/i))

      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })
})
