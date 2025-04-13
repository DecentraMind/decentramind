import { createDataItemSigner, results, message, dryrun } from '~/utils/ao'
import type { InboxState, MailCache } from '~/types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { get, keyBy, without, max, range, difference, chunk } from 'lodash-es'

export const inboxStore = defineStore('inboxStore', () => {
  const mailCache = $ref<Record<
    string, // processId
    Record<
      string, // index
      MailCache
    >
  >>({})
  let isInboxLoading = $ref(false)

  /** Map of inbox states, indexed by processId */
  const state = $(lsItemRef<Record<string, InboxState>>('inboxStore',
    {
      // 'CvgIA17jnhmuh3VtYozqlFy4sLKPVJV1c4eVZOY97to': {
      //   name: 'HelloRWA',
      //   latestMsgTime: new Date(),
      //   createdAt: new Date()
      // },
      // 'Fv5lQPftoQ4VGhLGc-ZV0EteHaYSjsvaQQJoYxxwE40': {
      //   name: 'AO Arena DAO Chat',
      //   latestMsgTime: new Date(),
      //   createdAt: new Date()
      // },
      // 'U1HFLMW0ZykPip03efMNpUpWcDlzkdxXwtoKZrOzhEA': {
      //   name: 'HelloRWA',
      //   latestMsgTime: new Date(),
      //   createdAt: new Date()
      // },
    }
  ))

  /** Array form of inbox states */
  const stateArr = $computed(() => {
    return Object.keys(state).map(id => {
      return {
        ...state[id],
        id,
      }
    })
  })

  const add = async (name: string, id: string) => {
    if (state[id]) {
      return {
        err: 'alreadyExist',
        msg: 'Already Exist'
      }
    }

    state[id] = {
      name,
      latestMsgTime: new Date().getTime(),
      createdAt: new Date().getTime()
    }
    return true
  }

  const remove = async (id: string) => {
    delete state[id]
  }

  const loadList = async (id: string) => {
    if (!mailCache) return
    if (mailCache[id]) {
      return mailCache[id]
    }
    let items = []
    const rz = await results({
      process: id,
      sort: 'DESC',
      limit: 25,
    })

    items = rz.edges.reverse()
    mailCache[id] = items

    return items
  }

  const sendMessage = async (process: string, data: string) => {
    const rz = await message({
      process,
      //signer: createDataItemSigner(globalThis.arweaveWallet),
      signer: createDataItemSigner(window.arweaveWallet),
      data,
    })
    return rz
  }

  const getDryrunData = (result: Awaited<ReturnType<typeof dryrun>>, key: string) => {
    return get(
      keyBy(
        get(result, 'Messages[0].Tags'), 'name'
      ),
      key
    )
  }

  /**
   * Get the inbox count for a chat room.
   * @param process The process ID of the chat room to get the inbox count for.
   * @param refetch Whether to force a re-fetch of the inbox count.
   * @returns The inbox count for the chat room.
   */
  const getInboxCount = async (process: string, refetch = false) => {
    if (state[process].inboxCount && !refetch) {
      return state[process].inboxCount
    }

    const res = await dryrun({
      process, // Use the processId from the context
      tags: [
        { name: 'Action', value: '#Inbox' },
      ],
      data: '#Inbox',
    })
    const data = getDryrunData(res, 'InboxCount.value')
    state[process].inboxCount = data
    return data
  }

  /**
   * Load the inbox list for a chat room.
   * @param process The process ID of the chat room to load.
   * @param limit The maximum number of messages to load.
   * @param isNewer 
   * @returns 
   */
  const loadInboxList = async (process: string, limit = 10, isNewer = true) => {
    if (!mailCache) return
    if (!mailCache[process]) {
      mailCache[process] = {}
    }

    const inboxCount = await getInboxCount(process, true)
    const cachedIndex = without(
      Object.keys(mailCache[process])
        .map(item => parseInt(item)),
      999999
    )
    
    const start = isNewer ? (max(cachedIndex) || 1) : 1
    const allIndex = range(start, parseInt(inboxCount) + 1)
    const waitForReadIndex = difference(allIndex, cachedIndex).reverse()
    if (waitForReadIndex.length === 0) {
      return
    }

    isInboxLoading = true
    const waitForReadIndexChunk = chunk(waitForReadIndex, limit)

    for (const index of waitForReadIndexChunk[0]) {
      if (mailCache[process][index]) {
        continue
      }

      const rz = await dryrun({
        process,
        tags: [
          { name: 'Action', value: 'CheckInbox' },
          { name: 'Index', value: String(index) },
        ],
      })
      const message = getDryrunData(rz, 'MessageDetails.value')
      if (message['App-Process'] && message['Authority']) {
        // ignore spawn message that create the chat room process
        continue
      }
      mailCache[process][index] = {
        ...message,
        index,
      }

      // Add 100ms delay between each request
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (mailCache[process][999999]) {
      delete mailCache[process][999999]
    }
    isInboxLoading = false
  }


  return $$({ state, stateArr, mailCache, isInboxLoading, add, remove, loadList, sendMessage, getInboxCount, loadInboxList })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(inboxStore, import.meta.hot))
