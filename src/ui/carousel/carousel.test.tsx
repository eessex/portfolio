import { fireEvent, render, screen } from '@testing-library/react'

import { Carousel, CarouselItem } from '@/ui/carousel/carousel'

function mockTrackWidths(scrollWidth: number, clientWidth: number) {
  jest
    .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
    .mockReturnValue(scrollWidth)
  jest
    .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
    .mockReturnValue(clientWidth)
}

function mockReducedMotion(isReduced: boolean) {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: isReduced
  }) as typeof window.matchMedia
}

function renderCarousel() {
  render(
    <Carousel title='Projects' count={2}>
      <CarouselItem>One</CarouselItem>
      <CarouselItem>Two</CarouselItem>
    </Carousel>
  )
}

describe('Carousel', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('labels the section with its title alone when the track fits', () => {
    mockTrackWidths(500, 500)
    renderCarousel()

    expect(
      screen.getByRole('region', { name: 'Projects' })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('shows the count with the arrows when the track overflows', () => {
    mockTrackWidths(1200, 500)
    renderCarousel()

    expect(
      screen.getByRole('region', { name: /^Projects\s*2$/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Next' })
    ).toBeInTheDocument()
  })

  it('hides the arrows when the track fits', () => {
    mockTrackWidths(500, 500)
    renderCarousel()

    expect(
      screen.queryByRole('button', { name: 'Next' })
    ).not.toBeInTheDocument()
  })

  it('scrolls 80% of the track width per arrow click when it overflows', () => {
    mockTrackWidths(1200, 500)
    mockReducedMotion(false)
    const scrollBy = jest.fn()
    HTMLElement.prototype.scrollBy = scrollBy
    renderCarousel()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))

    expect(scrollBy.mock.calls).toEqual([
      [{ left: 400, behavior: 'smooth' }],
      [{ left: -400, behavior: 'smooth' }]
    ])
  })

  it('scrolls without animation when reduced motion is preferred', () => {
    mockTrackWidths(1200, 500)
    mockReducedMotion(true)
    const scrollBy = jest.fn()
    HTMLElement.prototype.scrollBy = scrollBy
    renderCarousel()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)'
    )
    expect(scrollBy).toHaveBeenCalledWith({
      left: 400,
      behavior: 'instant'
    })
  })
})
