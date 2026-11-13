jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('@/lib/projects/data', () => ({
  fetchDefaultProject: jest.fn()
}))
jest.mock('@/lib/site-settings/data', () => ({
  hasSiteSettings: jest.fn()
}))
jest.mock('@/lib/projects/cached', () => ({
  fetchCachedDefaultProject: jest.fn()
}))
jest.mock('@/ui/projects/edit-project-form', () => ({
  EditProjectForm: jest.fn(() => null)
}))

import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'

import EditAboutPage from '@/app/about/edit/page'
import { fetchCachedDefaultProject } from '@/lib/projects/cached'
import { fetchDefaultProject } from '@/lib/projects/data'
import { projectFixtureBand } from '@/lib/projects/fixtures'
import { hasSiteSettings } from '@/lib/site-settings/data'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const mockFetch = jest.mocked(fetchDefaultProject)
const mockHasSiteSettings = jest.mocked(hasSiteSettings)

/** The async `EditDefaultProject` inside the page's Suspense. */
async function renderEditDefaultProject() {
  const page = EditAboutPage() as ReactElement<{
    children: ReactElement
  }>
  const suspense = page.props.children as ReactElement<{
    children: ReactElement
  }>
  const inner = suspense.props.children
  const Component = inner.type as () => Promise<ReactElement>
  render(await Component())
}

describe('EditAboutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockHasSiteSettings.mockResolvedValue(true)
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
      isDefaultProject: true,
      nextHref: undefined
    })
  })

  it('welcomes first-run setup and goes on to site settings', async () => {
    mockFetch.mockResolvedValue(undefined)
    mockHasSiteSettings.mockResolvedValue(false)

    await renderEditDefaultProject()

    expect(
      screen.getByRole('heading', {
        name: 'Welcome! Let’s start with your About page'
      })
    ).toBeInTheDocument()
    expect(jest.mocked(EditProjectForm).mock.calls[0][0]).toEqual({
      isDefaultProject: true,
      nextHref: '/settings'
    })
  })

  it('introduces the About page when settings already exist', async () => {
    mockFetch.mockResolvedValue(undefined)

    await renderEditDefaultProject()

    expect(
      screen.getByRole('heading', { name: 'Set up your About page' })
    ).toBeInTheDocument()
    expect(jest.mocked(EditProjectForm).mock.calls[0][0]).toEqual({
      isDefaultProject: true,
      nextHref: undefined
    })
  })

  it('goes on to site settings when editing before they exist', async () => {
    mockFetch.mockResolvedValue({
      ...projectFixtureBand,
      isDefaultProject: true
    } as Awaited<ReturnType<typeof fetchDefaultProject>>)
    mockHasSiteSettings.mockResolvedValue(false)

    await renderEditDefaultProject()

    expect(
      jest.mocked(EditProjectForm).mock.calls[0][0].nextHref
    ).toBe('/settings')
  })

  it('has no introduction once it exists', async () => {
    mockFetch.mockResolvedValue({
      ...projectFixtureBand,
      isDefaultProject: true
    } as Awaited<ReturnType<typeof fetchDefaultProject>>)

    await renderEditDefaultProject()

    expect(screen.queryByRole('heading')).toBeNull()
  })
})
