import { fireEvent, render, screen } from '@testing-library/react'

import { Checkbox } from '@/ui/form/checkbox'

function renderCheckbox(
  props: Partial<React.ComponentProps<typeof Checkbox>> = {}
) {
  return render(
    <form data-testid='form'>
      <Checkbox
        attributes={{ name: 'isPublished' }}
        label='Published'
        {...props}
      />
    </form>
  )
}

function submittedValue() {
  const form = screen.getByTestId('form') as HTMLFormElement
  return new FormData(form).get('isPublished')
}

describe('Checkbox', () => {
  it('starts unchecked by default', () => {
    renderCheckbox()

    expect(screen.getByLabelText('Published')).not.toBeChecked()
    expect(submittedValue()).toBeNull()
  })

  it('starts checked with isDefaultChecked', () => {
    renderCheckbox({ isDefaultChecked: true })

    expect(screen.getByLabelText('Published')).toBeChecked()
    expect(submittedValue()).toBe('on')
  })

  it('toggles without a controlling parent', () => {
    renderCheckbox({ isDefaultChecked: true })

    fireEvent.click(screen.getByLabelText('Published'))

    expect(screen.getByLabelText('Published')).not.toBeChecked()
    expect(submittedValue()).toBeNull()
  })

  it('reports whether the value differs from its default', () => {
    const onChange = jest.fn()
    renderCheckbox({ onChange })
    const checkbox = screen.getByLabelText('Published')

    fireEvent.click(checkbox)
    fireEvent.click(checkbox)

    expect(
      onChange.mock.calls.map(([, isChanged]) => isChanged)
    ).toEqual([true, false])
  })

  it('stays marked dirty once changed', () => {
    renderCheckbox()
    const checkbox = screen.getByLabelText('Published')

    fireEvent.click(checkbox)
    fireEvent.click(checkbox)

    expect(checkbox.closest('label')).toHaveClass('dirty')
  })
})
