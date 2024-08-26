import type { Task } from '~/types'
import { tokensByProcessID, bigInt2Float } from '~/utils'

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

export function calcRewardHtml(bounties: Task['bounties'], showLogo = false, precisions?: Map<string, number>, classes = 'font-medium') {
  return bounties.reduce((carry, bounty) => {
    if (!bounty.tokenName || !bounty.amount) return carry

    const token = tokensByProcessID[bounty.tokenProcessID]
    if (!token) {
      throw Error('Token info not found.')
    }
    const { logo, denomination } = token

    // TODO add zod type validation on ao reply data, and don't need do validatio here
    // TODO this is only for old data format which have no quantity, remove this if old data removed
    if (bounty.quantity === undefined) {
      bounty.quantity = float2BigInt(bounty.amount, denomination)
      console.error('quantity undefiend. try fix or delete task')
    }

    
    const p = precisions?.get(bounty.tokenProcessID) || 2
    const precision = bounty.amount < 1 ? p + 2 : 2

    carry.push(
      `<span class=${classes} title="${bigInt2Float(BigInt(bounty.quantity), denomination)}">${precisions ? bounty.amount.toFixed(precision) : bounty.amount} ${bounty.tokenName}</span>${
        showLogo && logo
        ? '<img src="' + arUrl(logo, gateways.ario) + '" class="w-6 h-6 rounded-full border border-gray-200 ml-1 mr-2">'
        : ''
      }`
    )
    return carry
  }, [] as string[])
}