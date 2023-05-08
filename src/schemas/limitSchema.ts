import { z } from 'zod'
export const limitsSchema = z.object({
  limitAmount: z.number().min(0).transform(value => Number((value).toFixed(2)))
})

export type LimitConfig = z.infer<typeof limitsSchema>
