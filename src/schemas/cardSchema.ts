import { z } from 'zod'

export const cardSchema = z.object({
  number: z.string().regex(/^\d{16}$/g, { message: 'Should be 16 digit' }),
  cardholder: z.string().min(3).transform(cardholder => cardholder.toUpperCase()),
  dueDate: z.number().min(0).max(31),
  expirationMonth: z.number().min(1).max(12),
  expirationYear: z.number().min(new Date().getFullYear()).max(new Date().getFullYear() + 10),
  cvv: z.string().regex(/\d{3}/g, { message: 'Should be 3 digit string' }),
  limit: z.number().min(0).transform(value => Number((value).toFixed(2))),
  avaliableLimit: z.number().min(0).default(0).transform(value => Number((value).toFixed(2))).optional(),
  purchases: z.array(z.number()).default([]).optional(),
  totalAmount: z.number().min(0).optional()
})

export type Card = z.infer<typeof cardSchema>
