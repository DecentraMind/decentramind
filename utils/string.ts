import type { Task } from '~/types'

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
  const handle = url.match(/\/(\w+)\/?$/)?.[1]
  return `${handle}` || url.replace(/https?:\/\//, '')
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

export function calcRewardHtml(bounties: Task['bounties'], showLogo = false, classes = 'font-medium') {
  return bounties.reduce((carry, bounty) => {
    const tokenLogo = tokensByProcessID[bounty.tokenProcessID]?.logo
    carry.push(
      `<span class=${classes}>${bounty.amount} ${bounty.tokenName}</span>${
        showLogo && tokenLogo
        ? '<img src="' + arUrl(tokenLogo, gateways.ario) + '" class="w-6 h-6 rounded-full border border-gray-200 ml-1 mr-2">'
        : ''
      }`
    )
    return carry
  }, [] as string[])
}