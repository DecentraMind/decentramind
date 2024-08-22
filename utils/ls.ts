import { skipHydrate } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

/** hydrate skipped value cached in localStorage */
export const lsItemRef = <T>(key: string, defaultVal: T) => skipHydrate(useLocalStorage<T>(key, defaultVal))

export const setLsItem = (key: string | any, val = '') => {
  if (typeof window === 'undefined')
    return false

  if (typeof key === 'object') {
    for (const _key in key)
      setLsItem(_key, key[_key])

    return true
  }

  val = JSON.stringify(val)
  window.localStorage.setItem(key, val)
}

export const getLsItem = (key: string, defaultVal = '') => {
  if (typeof window === 'undefined')
    return defaultVal

  let val = window.localStorage.getItem(key)
  if (val === 'undefined' || val === null)
    return defaultVal

  val = JSON.parse(val)
  // console.log(`getItem ====> ${key}:`, val)

  return val
}

export const removeLsItem = (key: string) => {
  window.localStorage.removeItem(key)
}