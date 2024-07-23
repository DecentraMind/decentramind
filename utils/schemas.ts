import { z } from 'zod'

export const communitySettingSchema = z.object({
  allToken: z.string()
    .min(0, { message: 'Must be more than 0' })
    .refine((value: string) => {
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    }, { message: 'Must be a valid number more than 0' })
    .refine((value: string) => {
      const regex = /^\d+(\.\d{1,3})?$/
      return regex.test(value)
    }, { message: 'Must be a valid number with up to 3 decimal places' }),
  name: z.string().min(2).max(20),
  inbro: z.string().min(3).max(100),

  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),

  tradePlatform: z.string(),

  /*
  allReward: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
    const num = parseInt(value)
    return !isNaN(num) && num <= 100
  }, { message: 'Must be a valid number less than or equal to 20' }),
  */
})

export type CommunitySettingSchema = z.infer<typeof communitySettingSchema>

// 定义新的 schema
export const createTokenSchema = z.object({
  name: z.string().min(3).max(30),
  ticker: z.string().email(),
})

// 导出新的 schema
export type CreateTokenSchema = z.infer<typeof createTokenSchema>