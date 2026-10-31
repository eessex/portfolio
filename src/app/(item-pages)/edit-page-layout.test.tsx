import { render, screen } from '@testing-library/react'

import { EditPageLayout } from '@/app/(item-pages)/edit-page-layout'

describe('EditPageLayout', () => {
  it('heads the page with its title, above the form', () => {
    render(
      <EditPageLayout title='Edit Event'>
        <form aria-label='Event' />
      </EditPageLayout>
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
      <EditPageLayout title='New Release'>
        <form />
      </EditPageLayout>
    )

    expect(screen.getByRole('article')).toHaveClass('edit-page')
  })
})
