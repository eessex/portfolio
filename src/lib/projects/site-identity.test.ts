import { cacheTag } from 'next/cache'

import { sql } from '@/lib/db'
import {
  activeHousePublisherId,
  fetchActiveHousePublisher,
  siteIdentity
} from '@/lib/projects/site-identity'
import { publisherFixtureAlpha } from '@/lib/publishers/fixtures'

jest.mock('@/lib/db', () => ({ sql: jest.fn() }))
const mockSql = jest.mocked(sql)

const PUBLISHER_ID = '11111111-1111-4111-8111-111111111111'
const BUILT_IN_ID = '22222222-2222-4222-8222-222222222222'

describe('siteIdentity', () => {
  beforeEach(() => jest.clearAllMocks())

  it('is a label site with its own publisher', async () => {
    mockSql.mockResolvedValueOnce([
      {
        type: 'recordLabel',
        publisher_id: PUBLISHER_ID,
        built_in_publisher_id: BUILT_IN_ID
      }
    ] as never)

    await expect(siteIdentity()).resolves.toEqual({
      kind: 'label',
      housePublisherId: PUBLISHER_ID
    })
    expect(cacheTag).toHaveBeenCalledWith('projects')
  })

  it('falls back to the built-in publisher when none is linked', async () => {
    mockSql.mockResolvedValueOnce([
      {
        type: 'recordLabel',
        publisher_id: null,
        built_in_publisher_id: BUILT_IN_ID
      }
    ] as never)

    await expect(siteIdentity()).resolves.toEqual({
      kind: 'label',
      housePublisherId: BUILT_IN_ID
    })
  })

  it('is a music site for any other default project type', async () => {
    mockSql.mockResolvedValueOnce([
      {
        type: 'band',
        publisher_id: null,
        built_in_publisher_id: BUILT_IN_ID
      }
    ] as never)

    await expect(siteIdentity()).resolves.toEqual({
      kind: 'music',
      housePublisherId: BUILT_IN_ID
    })
  })

  it('is a music site when there is no default project yet', async () => {
    // the LEFT JOIN still returns the built-in publisher
    mockSql.mockResolvedValueOnce([
      {
        type: null,
        publisher_id: null,
        built_in_publisher_id: BUILT_IN_ID
      }
    ] as never)

    await expect(siteIdentity()).resolves.toEqual({
      kind: 'music',
      housePublisherId: BUILT_IN_ID
    })
  })

  it('logs a read error and falls back to a music site', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockSql.mockRejectedValueOnce(new Error('DB error'))

    await expect(siteIdentity()).resolves.toEqual({ kind: 'music' })
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

function identityRow(type: string) {
  return [
    {
      type,
      publisher_id: PUBLISHER_ID,
      built_in_publisher_id: BUILT_IN_ID
    }
  ] as never
}

describe('activeHousePublisherId', () => {
  beforeEach(() => jest.clearAllMocks())

  it('is the house publisher on a label site', async () => {
    mockSql.mockResolvedValueOnce(identityRow('recordLabel'))

    await expect(activeHousePublisherId()).resolves.toBe(PUBLISHER_ID)
  })

  it('is undefined on an artist site, which opts out', async () => {
    mockSql.mockResolvedValueOnce(identityRow('band'))

    await expect(activeHousePublisherId()).resolves.toBeUndefined()
  })
})

describe('fetchActiveHousePublisher', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reads the house publisher on a label site, without its release slugs', async () => {
    mockSql
      .mockResolvedValueOnce(identityRow('recordLabel'))
      .mockResolvedValueOnce([
        { ...publisherFixtureAlpha, release_slugs: ['a'] }
      ] as never)

    const publisher = await fetchActiveHousePublisher()

    expect(publisher?.id).toBe(publisherFixtureAlpha.id)
    expect(publisher).not.toHaveProperty('releaseSlugs')
    expect(mockSql.mock.calls[1]).toContain(PUBLISHER_ID)
  })

  it('reads nothing more on an artist site', async () => {
    mockSql.mockResolvedValueOnce(identityRow('solo'))

    await expect(fetchActiveHousePublisher()).resolves.toBeUndefined()
    expect(mockSql).toHaveBeenCalledTimes(1)
  })

  it('logs a read error and leaves new editions blank', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockSql
      .mockResolvedValueOnce(identityRow('recordLabel'))
      .mockRejectedValueOnce(new Error('DB error'))

    await expect(fetchActiveHousePublisher()).resolves.toBeUndefined()
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
