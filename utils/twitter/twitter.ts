import { SPACE_URL_REGEXP, TWEET_URL_REGEXP } from '~/utils/constants'

export function getSpaceIds(urls: string[]): string[] {
  const ids: string[] = []
  for (const url of urls) {
    const matched = url.trim().match(SPACE_URL_REGEXP)
    if (!matched || !matched[1]) {
      throw new Error('Invalid space URL: ' + url)
    }
    ids.push(matched[1])
  }
  return ids
}

export function getTweetIds(urls: string[]): string[] {
  const ids: string[] = []
  for (const url of urls) {
    const matched = url.trim().match(TWEET_URL_REGEXP)
    if (!matched || !matched[1]) {
      throw new Error('Invalid tweet URL: ' + url)
    }
    ids.push(matched[1])
  }
  return ids
}