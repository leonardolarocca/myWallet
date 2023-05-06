import { z } from 'zod'

export const payCardSchema = z.object({ amount: z.number().min(0.01) })
export type PayCard = z.infer<typeof payCardSchema>
