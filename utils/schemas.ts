import { z } from 'zod'
import { ARWEAVE_ID_REGEXP, maxTotalChances, tokenChains, tokenNames, tokensByProcessID, type TokenSupply, isValidNumber, SPACE_URL_REGEXP, TWEET_URL_REGEXP } from '~/utils'
import type { FormError } from '#ui/types'
import type { CommunitySetting, PrivateTask, Task, TaskFormWithLink } from '~/types'

export const communitySettingSchema = z.object({
  // banner: z.enum(['banner6', 'banner7', 'banner8', 'banner9', 'banner10']),
  name: z.string().min(2).max(28),
  desc: z.string().min(3).max(1000), // introduction

  // TODO add message: url must start with http:// or https://
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),

  bountyTokenNames: z
    .enum(tokenNames as [string, ...string[]])
    .array()
    .refine((value) => {
      return value.length <= 4
    }, { message: 'Maximum of 4 bounty tokens.' })
    .refine((value) => {
      return value.length >= 1
    }, { message: 'Minimum of 1 bounty token.' }),

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
        path: 'bountyTokenNames',
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

export const communityAdminSchema = z.object({
  admins: z.array(
    z.object({
      address: z.string().refine((value) => {
        return ARWEAVE_ID_REGEXP.test(value)
      }, { message: 'Must be a valid address' }),
      name: z.string().min(2).max(28),
      avatar: z.string(),
    })
  )
})

export type CommunityAdminSchema = z.infer<typeof communityAdminSchema>

export const validateCommunityAdmin = (state: CommunityAdminSchema): FormError[] => {
  const errors: FormError[] = []
  const filteredAddresses = state.admins.filter(v => v.address).map(v => v.address)
  console.log('valid admins length: ', filteredAddresses.length, new Set(filteredAddresses).size)
  const duplicateAddresseIndexes = filteredAddresses.reduce((acc, address, index) => {
    if (filteredAddresses.indexOf(address) !== index) {
      acc.push(index)
    }
    return acc
  }, [] as number[])

  duplicateAddresseIndexes.forEach(index => {
    errors.push({
      path: `admins[${index}]`,
      message: 'Duplicate admin address.',
    })
  })
  console.log('validate admin: ', state, errors)
  return errors
}

export const taskSchema = z.object({
  name: z.string().min(2).max(30),
  intro: z.string().min(3).max(1000),
  // bounties: z.array(z.object({
  //   amount: z.number().gt(0),
  //   tokenProcessID: z.enum(Object.keys(tokensByProcessID) as [string, ...string[]]),
  //   chain: z.enum(tokenChains as [string, ...string[]]),
  // })).min(1).max(2),
  totalChances: z
    .number()
    .max(maxTotalChances)
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
  startTime: z.number().gt(0),
  endTime: z.number().gt(0)
})

export type TaskSchema = z.infer<typeof taskSchema>

export const spaceUrlSchema = z.object({
  url: z.string()
    .min(1, { message: 'URL is required' })
    .refine((value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }, { message: 'Must be a valid URL like https://x.com/i/spaces/xxxxxxxxx' })
    .refine((value) => {
      return SPACE_URL_REGEXP.test(value)
    }, { message: 'The URL must be a valid space URL like https://x.com/i/spaces/xxxxxxxxx' })
})

export type SpaceUrlSchema = z.infer<typeof spaceUrlSchema>

export const tweetUrlSchema = z.object({
  url: z.string()
  .min(1, { message: 'URL is required' })
  .refine((value) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }, { message: 'Must be a valid URL like https://x.com/x/status/1234567890' })
  .refine((value) => {
    return TWEET_URL_REGEXP.test(value)
  }, { message: 'The URL must be a valid tweet URL like https://x.com/x/status/1234567890' })
})
export type TweetUrlSchema = z.infer<typeof tweetUrlSchema>

export function validateTaskForm(state: Task): FormError[] {
  const errors = []
  const { bounties, startTime, endTime } = state

  const tokenProcessIDs = new Set()

  for (const [index, bounty] of bounties.entries()) {
    if (index === 0 && !bounty.tokenProcessID) {
      errors.push({
        path: `bounties[${index}]`,
        message: 'Bounty not be empty.',
      })
    }

    if (tokenProcessIDs.has(bounty.tokenProcessID)) {
      errors.push({
        path: `bounties[${index}]`,
        message: 'Duplicate bounty token.',
      })
    } else {
      tokenProcessIDs.add(bounty.tokenProcessID)
    }

    if (bounty.tokenProcessID) {
      try {
        !z.number().gt(0).parse(bounty.amount)
      } catch (_) {
        errors.push({
          path: `bounties[${index}]`,
          message: `Amount ${bounty.amount} is not valid`,
        })
      }
      if (!bounty.chain) {
        errors.push({
          path: `bounties[${index}]`,
          message: 'Please select a chain.',
        })
      }
      if (!tokenChains.includes(bounty.chain)) {
        errors.push({
          path: `bounties[${index}]`,
          message: `Chain ${bounty.chain} is not supported`,
        })
      }
      if (!Object.keys(tokensByProcessID).includes(bounty.tokenProcessID)) {
        errors.push({
          path: `bounties[${index}]`,
          message: `Token ${bounty.tokenProcessID} is not supported`,
        })
      }
    }
  }

  const currentDate = new Date().getTime()
  if (!startTime || !endTime) {
    errors.push({
      path: 'time',
      message: 'Quest start/end time cannot be empty.'
    })
  }
  if (startTime <= currentDate) {
    errors.push({
      path: 'time',
      message: 'Quest start time cannot be earlier than current time.'
    })
  }
  if (endTime <= currentDate) {
    errors.push({
      path: 'time',
      message: 'Quest end time cannot be earlier than current time.'
    })
  }
  if (startTime >= endTime) {
    errors.push({
      path: 'time',
      message: 'Quest end time cannot be earlier than start time.'
    })
  }

  if (state.type === 'promotion') {
    if (!(state as unknown as TaskFormWithLink).link) {
      errors.push({
        path: 'link',
        message: 'Link cannot be empty.'
      })
    }
    if (!TWEET_URL_REGEXP.test((state as unknown as TaskFormWithLink).link)) {
      errors.push({
        path: 'link',
        message: 'Link must be a valid tweet URL.'
      })
    }
  }

  console.log('validate task form:', errors, state)
  return errors
}

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
    if (!isValidNumber(num)) {
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

export const createProposalSchema = z.object({
  title: z.string().min(1).max(30),
  status: z.enum(['draft', 'auditing', 'executing']),
  startAt: z.number().gt(0),
  endAt: z.number().gt(0),
  description: z.string().min(1).max(7000)
})

export type CreateProposalSchema = z.infer<typeof createProposalSchema>

export function validateCreateProposalForm(state: PrivateTask): FormError[] {
  const errors = []
  const { startAt, endAt, budgets, status, executionResult } = state
  
  if (startAt >= endAt) {
    errors.push({
      path: 'time',
      message: 'Start time must be earlier than end time.',
    })
  }

  if (!budgets || budgets.length === 0) {
    errors.push({
      path: 'budgets',
      message: 'Budgets are required.',
    })
  }

  if (status === 'executing' && !executionResult) {
    errors.push({
      path: 'executionResult',
      message: 'Execution result is required.',
    })
  }

  for (const [index, budget] of budgets.entries()) {
    if (index === 0 && !budget.member) {
      errors.push({
        path: `budgets[${index}]`,
        message: 'Participant is required.',
      })
    }
    if (budget.member) {
      try {
        !z.number().gt(0).parse(budget.amount)
      } catch (_) {
        errors.push({
          path: `budgets[${index}]`,
          message: `Amount ${budget.amount} is not valid`,
        })
      }
      if (!budget.tokenProcessID) {
        errors.push({
          path: `budgets[${index}]`,
          message: 'Please select a token.',
        })
      }
    }
  }
  console.log('validate task form:', errors, state)
  return errors
}