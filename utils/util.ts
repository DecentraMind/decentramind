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

  return new Intl.DateTimeFormat(locale, options).format(date)
}
