import { z } from 'zod'
export const purchaseSchema = z.object({
  amount: z.number().min(0.01)
})

export type Purchase = z.infer<typeof purchaseSchema>
