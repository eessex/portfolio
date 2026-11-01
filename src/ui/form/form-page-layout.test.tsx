import { render, screen } from '@testing-library/react'

import { FormPageLayout } from '@/ui/form/form-page-layout'

describe('FormPageLayout', () => {
  it('heads the page with its title, above the form', () => {
    render(
      <FormPageLayout title='Edit Event'>
        <form aria-label='Event' />
      </FormPageLayout>
    )

    const article = screen.getByRole('article')
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Edit Event')
    expect(article.firstElementChild).toContainElement(heading)
    expect(article.lastElementChild).toBe(
      screen.getByRole('form', { name: 'Event' })
    )
  })

  it('uses the minimal, gutter header layout', () => {
    render(
      <FormPageLayout title='New Release'>
        <form />
      </FormPageLayout>
    )

    expect(screen.getByRole('article')).toHaveClass('form-page')
  })

  it('renders a note after the form', () => {
    render(
      <FormPageLayout title='Log in' note='Forgot password?'>
        <form aria-label='Log in' />
      </FormPageLayout>
    )

    const note = screen.getByText('Forgot password?')
    expect(note).toHaveClass('note')
    expect(screen.getByRole('article').lastElementChild).toBe(note)
  })
})
