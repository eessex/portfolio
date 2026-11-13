import { fireEvent, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { AdminMenuDisclosure } from '@/ui/nav/admin-menu-disclosure'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))
jest.mock('@/ui/nav/scroll-position', () => ({
  useWindowScrollPosition: jest.fn()
}))
const mockUsePathname = jest.mocked(usePathname)
const mockScrollPosition = jest.mocked(useWindowScrollPosition)

// a fresh element each time, or rerender bails out
const menu = () => (
  <>
    <AdminMenuDisclosure>
      <a href='/dashboard'>Site settings</a>
    </AdminMenuDisclosure>
    <a href='/elsewhere'>Elsewhere</a>
  </>
)

function renderMenu() {
  return render(menu())
}

function toggle() {
  return screen.getByRole('button', { name: 'Admin menu' })
}

function openMenu() {
  fireEvent.click(toggle())
  expect(toggle()).toHaveAttribute('aria-expanded', 'true')
}

// CSS hides a closed panel, but never on phones, so no hidden attr
function isPanelShown() {
  const id = toggle().getAttribute('aria-controls')
  return !!document
    .getElementById(id ?? '')
    ?.classList.contains('open')
}

describe('AdminMenuDisclosure', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/events')
    mockScrollPosition.mockReturnValue({
      isAtContentTop: true,
      isScrollingDown: false
    })
  })

  it('never marks the panel hidden, since phones show it inline', () => {
    renderMenu()

    expect(isPanelShown()).toBe(false)
    expect(
      screen.getByRole('link', { name: 'Site settings' })
    ).toBeVisible()
  })

  it('starts closed and toggles on click', () => {
    renderMenu()

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(isPanelShown()).toBe(false)

    openMenu()
    expect(isPanelShown()).toBe(true)

    fireEvent.click(toggle())
    expect(isPanelShown()).toBe(false)
  })

  it('fills the gear while open', () => {
    renderMenu()
    // heroicons: outline icons have no fill, solid ones do
    const gearFill = () =>
      toggle().querySelector('svg')?.getAttribute('fill')

    expect(gearFill()).toBe('none')
    openMenu()
    expect(gearFill()).toBe('currentColor')
  })

  it('closes on Escape and returns focus to the button', () => {
    renderMenu()
    openMenu()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(isPanelShown()).toBe(false)
    expect(toggle()).toHaveFocus()
  })

  it('closes on a click outside', () => {
    renderMenu()
    openMenu()

    fireEvent.pointerDown(
      screen.getByRole('link', { name: 'Elsewhere' })
    )

    expect(isPanelShown()).toBe(false)
  })

  it('stays open on a click inside', () => {
    renderMenu()
    openMenu()

    fireEvent.pointerDown(
      screen.getByRole('link', { name: 'Site settings' })
    )

    expect(isPanelShown()).toBe(true)
  })

  it('closes when focus leaves it', () => {
    renderMenu()
    openMenu()

    fireEvent.blur(toggle(), {
      relatedTarget: screen.getByRole('link', { name: 'Elsewhere' })
    })

    expect(isPanelShown()).toBe(false)
  })

  it('closes on navigation', () => {
    const { rerender } = renderMenu()
    openMenu()

    mockUsePathname.mockReturnValue('/releases')
    rerender(menu())

    expect(isPanelShown()).toBe(false)
  })

  it('stays closed on returning to the path it was opened on', () => {
    const { rerender } = renderMenu()
    openMenu()

    mockUsePathname.mockReturnValue('/releases')
    rerender(menu())
    mockUsePathname.mockReturnValue('/events')
    rerender(menu())

    expect(isPanelShown()).toBe(false)
  })

  it('closes on clicking a link inside, even to the current page', () => {
    renderMenu()
    openMenu()

    fireEvent.click(
      screen.getByRole('link', { name: 'Site settings' })
    )

    expect(isPanelShown()).toBe(false)
  })

  it('closes when the menubar slides away', () => {
    const { rerender } = renderMenu()
    openMenu()

    mockScrollPosition.mockReturnValue({
      isAtContentTop: false,
      isScrollingDown: true
    })
    rerender(menu())

    expect(isPanelShown()).toBe(false)
  })

  it('leaves a handled Escape alone', () => {
    renderMenu()
    openMenu()

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true
    })
    event.preventDefault()
    fireEvent(document, event)

    expect(isPanelShown()).toBe(true)
  })

  it('leaves Escape alone while focus is elsewhere', () => {
    renderMenu()
    openMenu()

    const elsewhere = screen.getByRole('link', { name: 'Elsewhere' })
    elsewhere.focus()
    fireEvent.keyDown(elsewhere, { key: 'Escape' })

    expect(isPanelShown()).toBe(true)
    expect(elsewhere).toHaveFocus()
  })
})
