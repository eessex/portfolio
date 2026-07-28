import { render, screen } from '@testing-library/react'

import { projectFixtureBand } from '@/lib/projects/fixtures'
import type { ProjectClient } from '@/lib/projects/types'
import { FormattedItemDate } from '@/ui/items/item-date'

const projectWithEndDate: ProjectClient = {
  ...projectFixtureBand,
  endDate: new Date('2026-06-01')
}

describe('FormattedItemDate', () => {
  it('renders a project end date', () => {
    const { container } = render(
      <FormattedItemDate item={projectWithEndDate} />
    )

    const times = container.querySelectorAll('time')
    expect(times).toHaveLength(2)
    expect(times[1]).toHaveAttribute(
      'dateTime',
      projectWithEndDate.endDate!.toISOString()
    )
  })

  it('handles string dates from API-fetched rows', () => {
    const apiProject = JSON.parse(
      JSON.stringify(projectWithEndDate)
    ) as ProjectClient

    const { container } = render(
      <FormattedItemDate item={apiProject} />
    )

    const times = container.querySelectorAll('time')
    expect(times).toHaveLength(2)
    expect(times[1]).toHaveAttribute(
      'dateTime',
      new Date('2026-06-01').toISOString()
    )
  })

  it('renders –present for a project without an end date', () => {
    render(<FormattedItemDate item={projectFixtureBand} />)

    expect(screen.getByText(/present/)).toBeInTheDocument()
  })
})
