import { dryrun } from '@permaweb/aoconnect'
import { useI18n, useGet } from '#imports'
import type { Timezone } from './constants'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
export function formatToLocale(isoString: string|number, locale: string = 'en-US') {
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

  return new Intl.DateTimeFormat(locale, options).format(date).replace(/\sat\s/, ' ')
}

export function getLocalTimezone() {
  const offset = Math.min(Math.max((new Date().getTimezoneOffset()) / 60, -11))
  const sign = offset > 0 ? '-' : '+'
  return 'GMT' + sign + Math.abs(offset).toString() + ':00' as Timezone
}

export function extractResult<T>(result: Awaited<ReturnType<typeof dryrun>>) {
  if (result.Error) {
    throw new Error(result.Error)
  }

  const tags = useGet(result, 'Messages[0].Tags') as {name: string, value: string}[]
  if (tags) {
    const errorTag = tags.find(tag => tag.name === 'Error')?.value
    if (errorTag) {
      throw new Error(errorTag)
    }
  }

  if (!result?.Messages?.[0]?.Data) {
    console.error('Failed to extract data from result.Messages', result)
    throw new Error('Failed to extract data from result.Messages.')
  }

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

      if (triedTimes === maxTimes) {
        console.error('Max retries reached. Operation failed.' + error)
        throw error
      }
      triedTimes++

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

export function toBase62(num: number) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  while (num > 0) {
      result = chars[num % 62] + result
      num = Math.floor(num / 62)
  }
  return result
}

export function taskProgress(now: number, startTime: number, endTime: number) {
  const { t } = useI18n()
  const res = {
    isNotStarted: false,
    isIng: false,
    isEnded: false,
    text: ''
  }
  if (now < startTime) {
    res.isNotStarted = true
    res.text = t('Not Start')
  } else if (now > startTime && now < endTime) {
    res.isIng = true
    res.text = t('Ing')
  } else {
    res.isEnded = true
    res.text = t('End')
  }
  return res
}
