import { createDataItemSigner, message } from '~/utils/ao'
import type { InboxState, MailCache } from '~/types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { without, max, range, difference, chunk } from 'lodash-es'
import { useCheckInboxQuery, useInboxCountQuery } from '~/composables/community/chatroomQuery'

export const inboxStore = defineStore('inboxStore', () => {
  const mailCache = $ref<Record<
    string, // processId
    Record<
      string, // index
      MailCache
    >
  >>({})
  let isInboxLoading = $ref(false)

  const fetchInboxMessage = useCheckInboxQuery()
  /** Map of inbox states, indexed by processId */
  const state = $(lsItemRef<Record<string, InboxState|undefined>>('inboxStore', {}))

  /** Array form of inbox states */
  const stateArr = $computed(() => {
    return Object.keys(state).map(id => {
      return {
        ...state[id],
        id,
      }
    })
  })

  const initProcessState = (name: string, processId: string) => {
    if (state[processId]) {
      return state[processId]
    }

    state[processId] = {
      name,
      latestMsgTime: new Date().getTime(),
      createdAt: new Date().getTime()
    }
    return state[processId]
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

  const fetchInboxCount = useInboxCountQuery({
    retry: false,
  })

  const updateInboxCount = async (process: string) => {
    const data = Number(await fetchInboxCount(process))

    if (!state[process]) {
      initProcessState(process, process)
    }
    console.log('fetchInboxCount', data)
    state[process]!.inboxCount = data
    return data
  }

  async function getLatestIndexCount(process: string) {
    if (!state[process]) {
      return await updateInboxCount(process)
    }
    return state[process]?.inboxCount || 0
  }

  /**
   * Load the inbox list for a chat room.
   * @param process The process ID of the chat room to load.
   * @param limit The maximum number of messages to load.
   * @param isNewer 
   * @returns 
   */
  const loadInboxList = async (process: string, limit = 10, isNewer = true) => {
    isInboxLoading = true
    if (!mailCache[process]) {
      mailCache[process] = {}
    }

    const inboxCount = await getLatestIndexCount(process)
    const cachedIndex = without(
      Object.keys(mailCache[process])
        .map(item => parseInt(item)),
      999999
    )
    
    const start = isNewer ? (max(cachedIndex) || 1) : 1
    const allIndex = range(start, (inboxCount || 0) + 1)
    const waitForReadIndex = difference(allIndex, cachedIndex).reverse()
    if (waitForReadIndex.length === 0) {
      isInboxLoading = false
      return
    }

    const waitForReadIndexChunk = chunk(waitForReadIndex, limit)

    // TODO get messages in batch instead of one by one
    for (const index of waitForReadIndexChunk[0]) {
      if (mailCache[process][index]) {
        continue
      }

      const message = await fetchInboxMessage({ process, index })
      if (message['App-Process'] && message['Authority']) {
        // ignore spawn message that create the chat room process
        continue
      }
      mailCache[process][index] = {
        ...message,
        index,
      }
    }
    if (mailCache[process][999999]) {
      delete mailCache[process][999999]
    }
    isInboxLoading = false
  }


  return $$({ state, stateArr, mailCache, isInboxLoading, sendMessage, updateInboxCount, getLatestIndexCount, loadInboxList })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(inboxStore, import.meta.hot))
