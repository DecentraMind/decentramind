import { acceptHMRUpdate, defineStore } from 'pinia'
import type { PrivateTask } from '~/types'
import { tokenChains } from '~/utils/constants'

const getDefaultPrivateTask = (): PrivateTask => ({
  title: '',
  uuid: '',
  boardUuid: '',
  status: 'proposal',
  editors: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  startAt: Date.now(),
  endAt: Date.now(),
  description: '',
  executionResult: '',
  budgets: [{
    member: '',
    amount: 0,
    tokenName: '', 
    tokenProcessID: '', 
    chain: tokenChains[0], 
    quantity: BigInt(0) 
  }]
})

export const usePrivateTaskStore = defineStore('privateTask', () => {
  const currentPrivateTask = ref<PrivateTask>(getDefaultPrivateTask())

  function resetCurrentPrivateTask(initialState?: Partial<PrivateTask>) {
    currentPrivateTask.value = {
      ...getDefaultPrivateTask(),
      ...initialState
    }
  }

  function updateCurrentPrivateTask(task: Partial<PrivateTask>) {
    Object.assign(currentPrivateTask.value, {
      ...task,
      updatedAt: Date.now()
    })
    console.log('current private task updated:', currentPrivateTask.value)
  }

  return {
    currentPrivateTask,
    resetCurrentPrivateTask,
    updateCurrentPrivateTask
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePrivateTaskStore, import.meta.hot))