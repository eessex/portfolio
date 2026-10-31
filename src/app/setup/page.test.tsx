jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn()
}))
jest.mock('@/lib/auth/guard', () => ({ isAuthed: jest.fn() }))
jest.mock('@/lib/users/data', () => ({ hasUsers: jest.fn() }))
jest.mock('@/app/setup/setup-form/setup-form', () => ({
  SetupForm: jest.fn(() => null)
}))

import { render } from '@testing-library/react'
import { notFound, redirect } from 'next/navigation'
import type { ReactElement } from 'react'

import SetupPage from '@/app/setup/page'
import { SetupForm } from '@/app/setup/setup-form/setup-form'
import { isAuthed } from '@/lib/auth/guard'
import { hasUsers } from '@/lib/users/data'

const mockHasUsers = jest.mocked(hasUsers)
const mockIsAuthed = jest.mocked(isAuthed)

describe('SetupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAuthed.mockResolvedValue(false)
    jest.mocked(notFound).mockImplementation(() => {
      throw new Error('notFound')
    })
    jest.mocked(redirect).mockImplementation(() => {
      throw new Error('redirect')
    })
  })

  it('renders the setup form while no user exists', async () => {
    mockHasUsers.mockResolvedValue(false)

    const el = (await SetupPage()) as ReactElement
    render(el)

    expect(SetupForm).toHaveBeenCalled()
  })

  it('404s once a user exists for a logged-out visitor', async () => {
    mockHasUsers.mockResolvedValue(true)

    await expect(SetupPage()).rejects.toThrow('notFound')
    expect(SetupForm).not.toHaveBeenCalled()
  })

  it('sends a signed-in visitor to /dashboard instead of 404ing', async () => {
    mockHasUsers.mockResolvedValue(true)
    mockIsAuthed.mockResolvedValue(true)

    await expect(SetupPage()).rejects.toThrow('redirect')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
    expect(notFound).not.toHaveBeenCalled()
    expect(SetupForm).not.toHaveBeenCalled()
  })
})
