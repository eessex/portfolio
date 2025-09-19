import { userSchema } from '@/lib/users/schemas'
import type { z } from 'zod'

export type User = z.infer<typeof userSchema>
