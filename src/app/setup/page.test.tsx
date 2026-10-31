jest.mock('next/server', () => ({ connection: jest.fn() }))
jest.mock('next/navigation', () => ({ notFound: jest.fn() }))
jest.mock('@/lib/users/data', () => ({ hasUsers: jest.fn() }))
jest.mock('@/app/setup/setup-form/setup-form', () => ({
  SetupForm: jest.fn(() => null)
}))

import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'

import SetupPage from '@/app/setup/page'
import { SetupForm } from '@/app/setup/setup-form/setup-form'
import { hasUsers } from '@/lib/users/data'

const mockHasUsers = jest.mocked(hasUsers)

describe('SetupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(notFound).mockImplementation(() => {
      throw new Error('notFound')
    })
  })

  it('renders the setup form while no user exists', async () => {
    mockHasUsers.mockResolvedValue(false)

    const el = (await SetupPage()) as ReactElement
    render(el)

    expect(SetupForm).toHaveBeenCalled()
  })

  it('404s immediately once a user exists, without rendering the form', async () => {
    mockHasUsers.mockResolvedValue(true)

    await expect(SetupPage()).rejects.toThrow('notFound')
    expect(SetupForm).not.toHaveBeenCalled()
  })
})
