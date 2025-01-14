export function createUuid() {
  const str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return str.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
  })
}

/** transform long string into string like 4cbaab...3111 */
export function shortString(str: string, startLength: number = 6, endLength: number = 4) {
  if (!str || str.length <= startLength + endLength) {
    return str || ''
  }

  return `${str.slice(0, startLength)}...${str.slice(-endLength)}`
}

/**
 * domain part of a url
 * @param url
 * @returns
 */
export function getDomain(url: string) {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

export function getHandle(url: string) {
  if (!url) return ''
  const handle = url.match(/\/([^/?#]+)\/?$/)?.[1]
  return handle ? `${handle}` : url.replace(/https?:\/\//, '')
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

/**
 * Calculate the rendered width of a text string
 * @param text The text to measure
 * @param fontSize The font size in pixels
 * @param fontFamily The font family (optional, defaults to 'Arial')
 * @returns The width of the rendered text in pixels
 */
export function getTextRenderWidth(text: string, fontSize: number, fontFamily: string = 'Arial'): number {
  // Create a temporary span element
  const span = document.createElement('span')
  
  // Set the text and style properties
  span.innerText = text
  span.style.fontSize = `${fontSize}px`
  span.style.fontFamily = fontFamily
  span.style.position = 'absolute'
  span.style.visibility = 'hidden'
  span.style.whiteSpace = 'nowrap'
  
  // Append the span to the body
  document.body.appendChild(span)
  
  // Get the width
  const width = span.offsetWidth
  
  // Remove the span from the DOM
  document.body.removeChild(span)
  
  return width
}

/**
 * Count the number of words in a string, for CJK characters, it counts each character as a word
 * @param text - The string to count the words in
 * @returns The number of words in the string
 */
export function wordCount(text: string) {
  if (!text) return 0

  // First, normalize the text to handle composed characters
  const normalized = text.normalize('NFC')

  // Pre-process crypto addresses before other processing
  const withProcessedAddresses = normalized.replace(
    // Ethereum-like addresses (0x...)
    /\b0x[a-fA-F0-9]{40}\b/g, 'word'
  ).replace(
    // Base58 addresses (Bitcoin, Binance, etc.) and Base64
    /\b[1-9A-HJ-NP-Za-km-z]{26,44}(_[A-Za-z0-9-_]{6,})?\b/g, 'word'
  ).replace(
    // arweave addresses
    /\b[a-zA-Z0-9-_]{43}\b/g, 'word'
  )

  // Pre-process number+suffix combinations
  const withProcessedNumbers = withProcessedAddresses.replace(/\b\d+(st|nd|rd|th)\b/g, 'word')

  // Replace emoji sequences with a single placeholder
  const withProcessedEmoji = withProcessedNumbers
    // Handle emoji with variation selectors (like ❤️)
    .replace(/[\p{Emoji}\u{FE0F}]+/gu, '📍')
    // Handle ZWJ sequences (like 👨‍👩‍👧‍👦)
    .replace(/[\p{Emoji}](\u200D[\p{Emoji}])+/gu, '📍')
    // Handle flag emoji (like 🇺🇸)
    .replace(/\p{Regional_Indicator}{2}/gu, '📍')

  // Add spaces around emoji placeholder when adjacent to text or numbers
  const withSpaces = withProcessedEmoji.replace(/📍([^\s])|([^\s])📍/g, '📍 $1$2')
    // Add spaces around CJK characters when they're adjacent to non-CJK text
    .replace(/([^\s\u4E00-\u9FFF])([\u4E00-\u9FFF])|(?<!\s)([\u4E00-\u9FFF])([^\s\u4E00-\u9FFF])/g, '$1 $2$3 $4')
    .trim()

  // Handle CJK characters separately
  const cjkCount = (withSpaces.match(/[\u4E00-\u9FFF]/g) || []).length

  // Count regular words (including emoji as single units)
  const words = withSpaces
    .replace(/[\u4E00-\u9FFF]/g, '') // Remove CJK characters (already counted)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length

  return cjkCount + words
}
