import { render, screen } from '@testing-library/react'

import { AccordionDropdown } from '@/ui/accordion-dropdown/accordion-dropdown'

describe('AccordionDropdown', () => {
  it('titles the panel with an h2 by default', () => {
    render(
      <AccordionDropdown title='Settings'>Panel</AccordionDropdown>
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Settings' })
    ).toBeInTheDocument()
  })

  it('uses the given heading level', () => {
    render(
      <AccordionDropdown title='Change email' headingLevel={3}>
        Panel
      </AccordionDropdown>
    )

    expect(
      screen.getByRole('heading', { level: 3, name: 'Change email' })
    ).toBeInTheDocument()
  })
})
