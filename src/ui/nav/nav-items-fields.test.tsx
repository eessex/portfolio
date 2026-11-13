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
  })

  it('offers no menu names', () => {
    const { container } = render(<NavItemsFields />)

    expect(screen.queryByRole('textbox')).toBeNull()
    expect(container.querySelector('[name$=".label"]')).toBeNull()
  })

  it('starts from the saved order', () => {
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
      screen.getByRole('checkbox', { name: 'Releases' })
    ).toBeChecked()
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

  it('badges shown items visitors do not see', () => {
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

    // releases (not creatable) and about (drafts); events is
    // published and projects is hidden
    expect(screen.getAllByText('Unpublished')).toHaveLength(2)
    expect(screen.queryByText(/admins see/)).toBeNull()
  })

  it('shows no badges without statuses', () => {
    render(<NavItemsFields />)

    expect(screen.queryByText('Unpublished')).toBeNull()
  })
})
