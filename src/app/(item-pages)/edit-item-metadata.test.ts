import { generateEditItemMetadata } from '@/app/(item-pages)/edit-item-metadata'
import { resolveEditItemId } from '@/app/(item-pages)/resolve-page-item'
import { PagePaths } from '@/lib/schemas'

jest.mock('@/app/(item-pages)/resolve-page-item', () => ({
  resolveEditItemId: jest.fn()
}))
const mockResolveEditItemId = jest.mocked(resolveEditItemId)

describe('generateEditItemMetadata', () => {
  const params = Promise.resolve({ slug: 'das-audit' })

  beforeEach(() => {
    mockResolveEditItemId.mockResolvedValue('project-id')
  })

  it("adds the item's title to the tab title", async () => {
    const fetchById = jest
      .fn()
      .mockResolvedValue({ title: 'Das Audit' })

    const meta = await generateEditItemMetadata(
      params,
      PagePaths.projects,
      fetchById,
      'Edit Project'
    )

    expect(mockResolveEditItemId).toHaveBeenCalledWith(
      PagePaths.projects,
      'das-audit'
    )
    expect(fetchById).toHaveBeenCalledWith('project-id', true)
    expect(meta).toEqual({ title: 'Edit Project: Das Audit' })
  })

  it('falls back to the bare title when the item is missing', async () => {
    const meta = await generateEditItemMetadata(
      params,
      PagePaths.releases,
      jest.fn().mockResolvedValue(undefined),
      'Edit Release'
    )

    expect(meta).toEqual({ title: 'Edit Release' })
  })
})
