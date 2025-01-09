import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Task } from '~/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  const { fn, maxAttempts: maxTimes, interval = 3000 } = args
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

export function getTaskTableColumns(taskType: Task['type'], showSelectStatus: boolean = false) {
  const { $i18n } = useNuxtApp()
  const t = $i18n.t

  const idField = {
    key: 'id',
    label: 'ID',
  }
  const addressField = {
    key: 'address',
    label: t('task.submission.fields.Wallet'),
    class: 'text-left',
    rowClass: 'font-mono',
  }
  const urlField = {
    key: 'url',
    class: 'text-left',
    rowClass: 'font-mono text-left',
    label: t('task.submission.fields.URL'),
  }
  const scoreField = {
    key: 'score',
    label: t('task.submission.fields.Total Score'),
    class: 'text-left',
    rowClass: 'font-mono text-left',
  }
  const rewardHtmlField = {
    key: 'rewardHtml',
    label: t('task.submission.fields.Bounty'),
    class: 'text-left',
    rowClass: 'font-mono pr-0',
  }

  const validateStatusField = {
    key: 'validateStatus',
    label: t('Validation Status'),
    class: 'text-left',
    rowClass: 'font-mono text-left',
  }

  const tweetTableColumns = [
    idField,
    validateStatusField,
    rewardHtmlField,
    addressField,
    urlField,
    {
      key: 'buzz',
      label: t('task.submission.fields.Buzz'),
      class: 'text-left',
      rowClass: 'font-mono text-left',
    },
    {
      key: 'discuss',
      label: t('task.submission.fields.Discuss'),
      class: 'text-left',
      rowClass: 'font-mono text-left',
    },
    {
      key: 'identify',
      label: t('task.submission.fields.Identify'),
    },
    {
      key: 'popularity',
      label: t('task.submission.fields.Popularity'),
      class: 'text-left',
      rowClass: 'font-mono text-left',
    },
    {
      key: 'spread',
      label: t('task.submission.fields.Spread'),
    },
    {
      key: 'friends',
      label: t('task.submission.fields.Friends'),
    },
    scoreField
  ]

  const taskTableColumns = {
    space: [
      idField,
      validateStatusField,
      rewardHtmlField,
      addressField,
      {
        key: 'brandEffect',
        label: t('task.submission.fields.Brand'),
        class: 'text-left',
        rowClass: 'font-mono text-left',
      },
      {
        key: 'inviteCount',
        label: t('task.submission.fields.Friends'),
        class: 'text-left',
        rowClass: 'font-mono text-left',
      },
      {
        key: 'audience',
        label: t('task.submission.fields.Popularity'),
        class: 'text-left',
        rowClass: 'font-mono text-left',
      },
      urlField,
      scoreField
    ],
    promotion: tweetTableColumns,
    bird: tweetTableColumns,
    article: tweetTableColumns,
    invite: [
      idField,
      validateStatusField,
      rewardHtmlField,
      addressField,
      {
        key: 'inviteCount',
        label: t('task.submission.fields.Total Amout'),
        class: 'text-left',
        rowClass: 'font-mono text-left',
      },
      scoreField,
    ],
  }

  const selectStatusField = {
    key: 'selectStatus',
    label: '',
    class: 'text-left',
    rowClass: 'font-mono text-left',
  }
  return showSelectStatus ? [selectStatusField, ...taskTableColumns[taskType]] : taskTableColumns[taskType]
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
      throw new Error(`${fieldOrNewItem}' value is not provided.`)
    }

    array[index][fieldOrNewItem] = value!
  } else {
    array[index] = fieldOrNewItem
  }
  return true
}