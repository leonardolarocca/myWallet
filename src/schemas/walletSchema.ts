import { z } from 'zod'

export const walletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  maxLimit: z.number().min(0),
  clientLimit: z.number().min(0).optional(),
  avaliableAmount: z.number().min(0),
  usedAmount: z.number().min(0),
  cards: z.array(z.string()).optional()
})

export type Wallet = z.infer<typeof walletSchema>
