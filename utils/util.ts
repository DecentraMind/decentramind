import {dryrun} from '@permaweb/aoconnect'

export function createUuid() {
    const str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return str.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

/**
 * Convert an ISO 8601 date string to the user’s local date format.
 * @param {string} isoString - ISO 8601 format string
 * @returns {string}
 */
export function formatToLocale(isoString: string, locale: string = 'en-US') {
  if(!isoString) return ''
  const date = new Date(isoString)

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // timeZoneName: 'short'
  }

  console.log({isoString})
  return new Intl.DateTimeFormat(locale, options).format(date).replace(/\sat\s/, ' ')
}

export function extractResult<T>(result: Awaited<ReturnType<typeof dryrun>>) {
  if(!result.Messages) return

  return result.Messages[0].Data as T
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * This function will attempt to run fn multiple times until fn successfully return
 * or reaches @param args.maxAttempts.
 * */
export async function retry<T>(args: {
  /** the function you need to run */
  fn: () => Promise<T>,
  maxAttempts: number,
  /** interval between two tries */
  interval?: number
}) {
  const {fn, maxAttempts: maxTimes, interval = 3000} = args
  let triedTimes = 1
  while (triedTimes <= maxTimes) {
    try {
      console.info(`Attempt ${triedTimes}, max ${maxTimes}`)
      const res = await fn()
      return res
    } catch (error) {
      console.info(`Attempt ${triedTimes} failed:`, error)
      triedTimes++

      if (triedTimes === maxTimes) {
        console.error('Max retries reached. Operation failed.' + error)
        throw error
      }

      await sleep(interval)
    }
  }
}

export function shortString(str: string, startLength: number = 6, endLength: number = 4) {
  if (!str || str.length <= startLength + endLength) {
    return str || ''
  }

  return `${str.slice(0, startLength)}...${str.slice(-endLength)}`
}
