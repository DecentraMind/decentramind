import type { Timezone } from './constants'

/**
 * Convert an ISO 8601 date string to the user’s local date format.
 */
export function formatToLocale(isoString: string | number, locale: string = 'en-US'): string {
  if (!isoString) return ''
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

export function formatDate(
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }

  return date.toLocaleString('sv-SE', { ...defaultOptions, ...options })
}

export function getLocalTimezone() {
  const offset = Math.min(Math.max((new Date().getTimezoneOffset()) / 60, -11))
  const sign = offset > 0 ? '-' : '+'
  return 'GMT' + sign + Math.abs(offset).toString() + ':00' as Timezone
}