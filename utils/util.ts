import type { Timezone } from './constants'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert an ISO 8601 date string to the user’s local date format.
 */
export function formatToLocale(isoString: string|number, locale: string = 'en-US'): string {
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

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * This function will attempt to run fn multiple times until fn successfully return
 * or reaches args.maxAttempts.
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
      console.info(`Attempt ${triedTimes} success, return value: `, res)
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

export function taskProgress(now: number, startTime: number, endTime: number) {
  const { $i18n } = useNuxtApp()
  const t = $i18n.t
  const res = {
    isNotStarted: false,
    isIng: false,
    isEnded: false,
    text: ''
  }
  if (now < startTime) {
    res.isNotStarted = true
    res.text = t('Not Start')
  } else if (now >= startTime && now <= endTime) {
    res.isIng = true
    res.text = t('Ing')
  } else {
    res.isEnded = true
    res.text = t('End')
  }
  return res
}

export interface UpdateItemParams<T, K extends keyof T> {
  array: T[];
  identifierKey: keyof T;
  identifierValue: T[keyof T];
  fieldOrNewItem: K | T;
  value?: T[K];
}
export function updateItemInArray<
  T extends Record<string, any>,
  K extends Extract<keyof T, string>
  >(params: UpdateItemParams<T, K>): boolean {
  const {
    array,
    identifierKey,
    identifierValue,
    fieldOrNewItem,
    value
  } = params

  const index = array.findIndex(item => item[identifierKey] === identifierValue)

  if (index === -1) return false

  if (typeof fieldOrNewItem === 'string') {
    /**
     * If the fieldOrNewItem is a string (i.e., a field name),
     * ensure that value is explicitly provided. If not, throw an error.
     */
    if (value === undefined && !('value' in params)) {
      throw new Error(`${ fieldOrNewItem }' value is not provided.`)
    }

    array[index][fieldOrNewItem] = value!
  } else {
    array[index] = fieldOrNewItem
  }
  return true
}
