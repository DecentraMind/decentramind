import { z } from 'zod'
import { tokenNames, type TokenSupply } from '~/utils/constants'
import type { FormError } from '#ui/types'
import type { CommunitySetting } from '~/types'

export const communitySettingSchema = z.object({
  // banner: z.enum(['banner6', 'banner7', 'banner8', 'banner9', 'banner10']),
  name: z.string().min(2).max(28),
  inbro: z.string().min(3).max(100), // introduction

  // TODO add message: url must start with http:// or https://
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),

  typeReward: z.enum(tokenNames as [string, ...string[]]).array().min(1).max(4),

  tradePlatform: z.enum(tradePlatforms as [string, ...string[]]).array().min(0).max(tradePlatforms.length),

  allToken: z.number()
    .gt(0, { message: 'Must be more than 0' })
    .refine((value: number) => {
      const regex = /^\d+(\.\d{1,3})?$/
      return regex.test(value.toString())
    }, { message: 'Must be a valid number with up to 3 decimal places' })
    .optional(),

  // tokenSupply: z.array(z.object({
  //   name: z.string().min(1).max(1),
  //   supply: z.number().gt(0).lte(100)
  // })).min(0).optional(),

  /*
  allReward: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
    const num = parseInt(value)
    return !isNaN(num) && num <= 100
  }, { message: 'Must be a valid number less than or equal to 20' }),
  */
})

export type CommunitySettingSchema = z.infer<typeof communitySettingSchema>

export const validateCommunitySetting = (state: CommunitySetting & {tokenSupply: TokenSupply[]}): FormError[] => {
  const errors = []

  for (const rewardToken of state.typeReward) {
    if (!tokenNames.includes(rewardToken)) {
      errors.push({ path: 'typeReward', message: `${rewardToken} is not supported` })
    }
  }

  state.tokenSupply.forEach((tokenSupply, index) => {
    const {name, supply} = tokenSupply
    console.log({name, supply})
    if (!name && supply) {
      errors.push({ path: `tokenSupply[${index}]`, message: `Token allocation ${index + 1} name can not be empty.`})
      return
    }

    if (name) {
      if (name.length > 30) {
        errors.push({ path: `tokenSupply[${index}]`, message: `Token allocation ${index + 1} name too long.`})
      }
      if (supply <= 0 || supply > 100) {
        errors.push({ path: `tokenSupply[${index}]`, message: `Token allocation ${index + 1} must a valid number between 0 and 100.`})
      }
    }
  })

  console.log('validate', state, errors)
  return errors
}

// 定义新的 schema
export const createTokenSchema = z.object({
  name: z.string().min(3).max(30),
  ticker: z.string().email(),
})

// 导出新的 schema
export type CreateTokenSchema = z.infer<typeof createTokenSchema>
