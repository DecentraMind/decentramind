import { z } from 'zod'
import { tokenNames, type TokenSupply } from '~/utils/constants'
import type { FormError } from '#ui/types'
import type { CommunitySetting } from '~/types'

export const communitySettingSchema = z.object({
  // banner: z.enum(['banner6', 'banner7', 'banner8', 'banner9', 'banner10']),
  name: z.string().min(2).max(28),
  desc: z.string().min(3).max(100), // introduction

  // TODO add message: url must start with http:// or https://
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),

  bountyTokenNames: z
    .enum(tokenNames as [string, ...string[]])
    .array()
    .min(1)
    .max(4),

  tradePlatforms: z
    .enum(tradePlatforms as [string, ...string[]])
    .array()
    .min(0)
    .max(tradePlatforms.length),

  allToken: z
    .number()
    .gt(0, { message: 'Must be more than 0' })
    .refine(
      (value: number) => {
        const regex = /^\d+(\.\d{1,3})?$/
        return regex.test(value.toString())
      },
      { message: 'Must be a valid number with up to 3 decimal places' },
    )
    .optional(),

  // tokenSupply: z.array(z.object({
  //   name: z.string().min(1).max(1),
  //   supply: z.number().gt(0).lte(100)
  // })).min(0).optional(),

})

export type CommunitySettingSchema = z.infer<typeof communitySettingSchema>

export const validateCommunitySetting = (
  state: CommunitySetting & { tokenSupply: TokenSupply[] },
): FormError[] => {
  const errors = []

  for (const rewardToken of state.bountyTokenNames) {
    if (!tokenNames.includes(rewardToken)) {
      errors.push({
        path: 'typeReward',
        message: `${rewardToken} is not supported`,
      })
    }
  }

  state.tokenAllocations.forEach((tokenSupply, index) => {
    const { name, supply } = tokenSupply
    console.log({ name, supply })
    if (!name && supply) {
      errors.push({
        path: `tokenSupply[${index}]`,
        message: `Token allocation ${index + 1} name can not be empty.`,
      })
      return
    }

    if (name) {
      if (name.length > 30) {
        errors.push({
          path: `tokenSupply[${index}]`,
          message: `Token allocation ${index + 1} name too long.`,
        })
      }
      if (supply <= 0 || supply > 100) {
        errors.push({
          path: `tokenSupply[${index}]`,
          message: `Token allocation ${
            index + 1
          } must a valid number between 0 and 100.`,
        })
      }
    }
  })

  console.log('validate', state, errors)
  return errors
}

export const taskSchema = z.object({
  taskName: z.string().min(2).max(30),
  taskInfo: z.string().min(3).max(100),
  tokenNumber: z.number().min(0),
  tokenNumber1: z.number().min(0).optional(),
  rewardTotal: z
    .number()
    .min(1, { message: 'Must be more than 0' })
    .refine(
      (value: number) => {
        return !isNaN(value) && value > 0
      },
      { message: 'Must be a valid number more than 0' },
    )
    .refine(
      (value: number) => {
        const regex = /^\d+$/
        return regex.test('' + value)
      },
      { message: 'Must be a valid integer' },
    ),
})

export type TaskSchema = z.infer<typeof taskSchema>

export const userSchema = z.object({
  name: z.string().min(2).max(28),
  avatar: z.string().refine(
    (avatar: string) => {
      return avatar
    },
    { message: 'Avatar is required' },
  ),
})

const maxTotalSupply = 1e20
export const createTokenSchema = z.object({
  name: z.string().min(1).max(30),
  ticker: z.string().max(30).toUpperCase(),
  totalSupply: z.string().refine((value) => {
    if (/\./.test(value)) {
      return false
    }
    // Check if the string can be converted to a valid number
    const num = Number(value)
    if (isNaN(num)) {
      return false
    }

    // Check if the number can be converted to BigInt and falls within the range
    try {
      const bigIntValue = BigInt(num)
      const min = BigInt(0)
      const max = BigInt(maxTotalSupply)
      return bigIntValue > min && bigIntValue <= max
    } catch {
      return false
    }
  }, {
    message: `Total supply must be a valid integer between 1 and ${maxTotalSupply}.`
  })
})

export type CreateTokenSchema = z.infer<typeof createTokenSchema>
