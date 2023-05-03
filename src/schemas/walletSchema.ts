import { z } from 'zod'

export const walletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  maxValue: z.number().min(0),
  clientLimit: z.number().min(0),
  avaliable: z.number().min(0),
  cards: z.array(z.string()).optional()
})

export type Wallet = z.infer<typeof walletSchema>

export const limitsSchema = z.object({
  value: z.number().min(0).transform(value => Number((value).toFixed(2)))
})
