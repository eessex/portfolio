import type { z } from 'zod'

import type { userSchema } from '@/lib/users/schemas'

export type User = z.infer<typeof userSchema>
