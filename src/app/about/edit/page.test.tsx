jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('@/lib/projects/data', () => ({
  fetchDefaultProject: jest.fn()
}))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedDefaultProject: jest.fn()
}))
jest.mock('@/ui/projects/edit-project-form', () => ({
  EditProjectForm: jest.fn(() => null)
}))

import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

import EditAboutPage from '@/app/about/edit/page'
import { fetchCachedDefaultProject } from '@/lib/projects/cached'
import { fetchDefaultProject } from '@/lib/projects/data'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const mockFetch = jest.mocked(fetchDefaultProject)

/** The async `EditDefaultProject` inside the page's Suspense. */
async function renderEditDefaultProject() {
  const page = EditAboutPage() as ReactElement<{
    children: ReactElement[]
  }>
  const suspense = page.props.children[1] as ReactElement<{
    children: ReactElement
  }>
  const inner = suspense.props.children
  const Component = inner.type as () => Promise<ReactElement>
  render(await Component())
}

describe('EditAboutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('edits the default project read fresh, not from the cache', async () => {
    const project = {
      ...projectFixtureBand,
      isDefaultProject: true
    } as Awaited<ReturnType<typeof fetchDefaultProject>>
    mockFetch.mockResolvedValue(project)

    await renderEditDefaultProject()

    expect(mockFetch).toHaveBeenCalledWith(true)
    expect(fetchCachedDefaultProject).not.toHaveBeenCalled()
    expect(jest.mocked(EditProjectForm).mock.calls[0][0]).toEqual({
      project,
      isDefaultProject: true
    })
  })
})
