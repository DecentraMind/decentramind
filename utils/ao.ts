import { connect, createDataItemSigner } from '@permaweb/aoconnect'
import { get } from 'lodash-es'
import { retry } from '~/utils/util'

const { result, results, message, spawn, monitor, unmonitor, dryrun: originalDryrun } = connect({
  // MU_URL: 'https://mu.ao-testnet.xyz',
  // CU_URL: 'https://cu131.ao-testnet.xyz',
  MODE: 'legacy',
  // If GATEWAY_URL is set but GRAPHQL_URL is not set, then the GATEWAY_URL provided MUST have a /graphql endpoint that serves the Arweave Gateway GraphQL Server. ie. https://arweave.net/graphql
  GATEWAY_URL: 'https://g8way.io',
})

export type DryrunInput = Parameters<typeof originalDryrun>[0]
export type DryrunOutput = Awaited<ReturnType<typeof originalDryrun>>
export type ResultInput = Parameters<typeof result>[0]
export type ResultOutput = Awaited<ReturnType<typeof result>>
export type MessageInput = Parameters<typeof message>[0]

/**
 * dryrun wrapper with retry.
 * @param messageParams 
 * @returns 
 */
const dryrun = async (messageParams: DryrunInput): Promise<DryrunOutput> => {
  const res = await retry({
    fn: () => originalDryrun(messageParams),
    maxAttempts: 3,
    interval: 500
  })
  if (!res) {
    throw new Error('Dryrun failed.')
  }
  return res
}

export { result, results, message, spawn, monitor, unmonitor, dryrun, createDataItemSigner }

export function checkResult(res: DryrunOutput | ResultOutput) {
  if (!res) {
    throw new Error('No result')
  }
  if (res.Error) {
    throw new Error(res.Error)
  }

  const tags = get(res, 'Messages[0].Tags') as { name: string, value: string }[]
  if (tags) {
    const errorTag = tags.find(tag => tag.name === 'Error')?.value
    if (errorTag) {
      throw new Error(errorTag)
    }
  }
  return true
}

/**
 * Send message to AO, then get result, check if error exists
 */
export async function messageResultCheck(messageParams: MessageInput) {
  try {
    const messageId = await message(messageParams)
    const res = await result({ process: messageParams.process, message: messageId })
    // console.log('check result', res)
    return checkResult(res)
  } catch (error) {
    console.error('Failed to messageResultCheck', error)
    throw error
  }
}

/**
 * Send message to AO, then get result, check if error exists, then extract data from result
 */
export async function messageResult<T>(messageParams: MessageInput) {
  try {
    const messageId = await message(messageParams)
    const res = await result({ process: messageParams.process, message: messageId })
    return extractResult<T>(res)
  } catch (error) {
    console.error('Failed to messageResult:', error)
    throw error
  }
}

export async function messageResultParsed<T>(messageParams: MessageInput) {
  try {
    return JSON.parse(await messageResult<string>(messageParams)) as T
  } catch (error) {
    console.error('Failed to parse message result:', error)
    throw error
  }
}

export async function dryrunResult<T>(messageParams: DryrunInput) {
  try {
    const result = await dryrun(messageParams)
    return extractResult<T>(result)
  } catch (error) {
    console.error('Failed to dryrun:', error)
    console.log('messageParams', messageParams)
    throw error
  }
}

export async function dryrunResultParsed<T>(messageParams: DryrunInput) {
  try {
    return JSON.parse(await dryrunResult<string>(messageParams)) as T
  } catch (error) {
    console.error('Failed to parse dryrun result:', error)
    throw error
  }
}

/**
 * Get data from dryrun/result() return value
 * @param res dryrun/result() return value
 * @returns
 */
export function extractResult<T>(res: DryrunOutput | ResultOutput) {
  checkResult(res)

  if (!res?.Messages?.[0]?.Data) {
    console.error('Failed to extract data from result.Messages:', res)
    if (res!.Output?.print) {
      console.error(res!.Output.data)
    }
    throw new Error('Failed to extract data from result.Messages.')
  }

  return res.Messages[0].Data as T
}