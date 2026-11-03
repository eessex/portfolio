import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  NavItemsFields,
  type NavItemStatuses
} from '@/ui/nav/nav-items-fields'

const statuses: NavItemStatuses = {
  events: 'published',
  releases: undefined,
  projects: 'empty',
  about: 'drafts'
}

function pathOrder(container: HTMLElement) {
  return [
    ...container.querySelectorAll<HTMLInputElement>(
      'input[name$=".path"]'
    )
  ].map((input) => [input.name, input.value])
}

describe('NavItemsFields', () => {
  it('lists the default menu, then the hidden items', () => {
    const { container } = render(<NavItemsFields />)

    expect(pathOrder(container)).toEqual([
      ['navItems[0].path', 'events'],
      ['navItems[1].path', 'releases'],
      ['navItems[2].path', 'about'],
      ['navItems[3].path', 'projects']
    ])
    expect(
      screen.getByRole('checkbox', { name: 'Projects' })
    ).not.toBeChecked()
    expect(
      screen.getByRole('textbox', { name: 'Projects menu name' })
    ).toBeDisabled()
  })

  it('starts from the saved order and names', () => {
    const { container } = render(
      <NavItemsFields
        navItems={[
          { path: 'releases', label: 'Music' },
          { path: 'events' }
        ]}
      />
    )

    expect(pathOrder(container).map(([, path]) => path)).toEqual([
      'releases',
      'events',
      'projects',
      'about'
    ])
    expect(
      screen.getByRole('textbox', { name: 'Releases menu name' })
    ).toHaveValue('Music')
    expect(
      screen.getByRole('textbox', { name: 'Releases menu name' })
    ).toHaveAttribute('placeholder', 'Releases')
    expect(
      screen.getByRole('checkbox', { name: 'About' })
    ).not.toBeChecked()
  })

  it('renumbers the fields after a move', async () => {
    const user = userEvent.setup()
    const { container } = render(<NavItemsFields />)

    await user.click(
      screen.getAllByRole('button', { name: 'Move down' })[0]
    )

    expect(pathOrder(container)).toEqual([
      ['navItems[0].path', 'releases'],
      ['navItems[1].path', 'events'],
      ['navItems[2].path', 'about'],
      ['navItems[3].path', 'projects']
    ])
  })

  it('enables the name once an item is shown', async () => {
    const user = userEvent.setup()
    render(<NavItemsFields />)

    await user.click(
      screen.getByRole('checkbox', { name: 'Projects' })
    )

    expect(
      screen.getByRole('textbox', { name: 'Projects menu name' })
    ).toBeEnabled()
  })

  it('explains shown items that not everyone sees', () => {
    render(
      <NavItemsFields
        navItems={[
          { path: 'events' },
          { path: 'releases' },
          { path: 'about' }
        ]}
        statuses={statuses}
      />
    )

    expect(
      screen.getByText('Hidden until a project exists.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Drafts only: admins see it.')
    ).toBeInTheDocument()
    // published, and hidden (Projects), get no hint
    expect(screen.queryByText(/admins see a link/)).toBeNull()
  })
})
