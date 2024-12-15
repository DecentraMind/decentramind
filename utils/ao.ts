import { connect, createDataItemSigner } from '@permaweb/aoconnect'
import { get } from 'lodash-es'

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect({
  MU_URL: 'https://mu.ao-testnet.xyz',
  CU_URL: 'https://cu.ao-testnet.xyz',
  // If GATEWAY_URL is set but GRAPHQL_URL is not set, then the GATEWAY_URL provided MUST have a /graphql endpoint that serves the Arweave Gateway GraphQL Server. ie. https://arweave.net/graphql
  GATEWAY_URL: 'https://g8way.io',
})

export { result, results, message, spawn, monitor, unmonitor, dryrun, createDataItemSigner }

export type MessageInput = {
  process: string;
  data?: any;
  tags?: {
    name: string;
    value: string;
  }[];
  anchor?: string;
  Id?: string;
  Owner?: string;
}
export type DryrunInput = MessageInput & {
  [x: string]: any;
}

export type SendMessageArgs = Parameters<typeof message>[0]
// export type SendMessageArgs = {
//   process: string;
//   data?: string;
//   tags?: {
//       name: string;
//       value: string;
//   }[];
//   anchor?: string;
//   signer: Types['signer'];
// }

export function checkResult(res: Awaited<ReturnType<typeof result>>) {
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
export async function messageResultCheck(messageParams: SendMessageArgs) {
  const messageId = await message(messageParams)
  const res = await result({ process: messageParams.process, message: messageId })
  console.log('check result', res)
  return checkResult(res)
}

/**
 * Send message to AO, then get result, check if error exists, then extract data from result
 */
export async function messageResult<T>(messageParams: SendMessageArgs) {
  const messageId = await message(messageParams)
  const res = await result({ process: messageParams.process, message: messageId })
  return extractResult<T>(res)
}

export async function messageResultParsed(messageParams: SendMessageArgs) {
  return JSON.parse(await messageResult<string>(messageParams))
}

export async function dryrunResult<T>(messageParams: DryrunInput) {
  const result = await dryrun(messageParams)
  return extractResult<T>(result)
}

export async function dryrunResultParsed<T>(messageParams: DryrunInput) {
  return JSON.parse(await dryrunResult<string>(messageParams)) as T
}

/**
 * Get data from dryrun/result() return value
 * @param result dryrun result
 * @returns
 */
export function extractResult<T>(result: Awaited<ReturnType<typeof dryrun>>) {
  checkResult(result)

  if (!result?.Messages?.[0]?.Data) {
    console.error('Failed to extract data from result.Messages', result)
    if (result.Output?.print) {
      console.error(result.Output.data)
    }
    throw new Error('Failed to extract data from result.Messages.')
  }

  return result.Messages[0].Data as T
}