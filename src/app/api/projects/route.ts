import { NextResponse } from 'next/server'

import { isAuthed } from '@/lib/auth/guard'
import { fetchProjects } from '@/lib/projects/cached'
import {
  projectsOrderBys,
  projectTypeSchema
} from '@/lib/projects/schemas'
import { formatAuthedApiResponseJSON } from '@/lib/util'

const typesSchema = projectTypeSchema.array()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined
  const isDefaultExcluded =
    searchParams.get('isDefaultExcluded') === 'true'

  // comma-separated, e.g. `band,solo,collaborative`
  const typesParam = searchParams.get('types')
  const types = typesParam
    ? typesSchema.safeParse(typesParam.split(','))
    : undefined
  if (types && !types.success) {
    return badRequest('Unknown project type.')
  }
  const excludedTypesParam = searchParams.get('excludedTypes')
  const excludedTypes = excludedTypesParam
    ? typesSchema.safeParse(excludedTypesParam.split(','))
    : undefined
  if (excludedTypes && !excludedTypes.success) {
    return badRequest('Unknown project type.')
  }

  const orderByParam = searchParams.get('orderBy') || undefined
  const orderBy = projectsOrderBys.find(
    (value) => value === orderByParam
  )
  if (orderByParam && !orderBy) {
    return badRequest('Unknown orderBy value.')
  }

  try {
    const result = await fetchProjects(
      await isAuthed(),
      cursor,
      query,
      {
        isDefaultExcluded,
        ...(types && { types: types.data }),
        ...(excludedTypes && { excludedTypes: excludedTypes.data }),
        ...(orderBy && { orderBy })
      }
    )
    return formatAuthedApiResponseJSON(result)
  } catch (cause) {
    throw new Error('Failed to fetch projects.', { cause })
  }
}

function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 })
}
