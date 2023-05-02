import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(3, { message: 'name must have at least 3 digits' })
    .max(64, { message: 'name must have at least 64 digits' })
})

export type User = z.infer<typeof userSchema>
