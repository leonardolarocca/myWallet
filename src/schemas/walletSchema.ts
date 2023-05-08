import { z } from 'zod'

export const walletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  maxLimit: z.number().min(0),
  clientLimit: z.number().min(0).optional(),
  used: z.number().min(0).optional(),
  cards: z.array(z.string()).optional()
})

export type Wallet = z.infer<typeof walletSchema>
