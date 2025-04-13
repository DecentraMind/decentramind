import { useMutation } from '@tanstack/vue-query'
import { transferBounty } from '~/utils/token'
import type { Task } from '~/types'

export function useTransferTokenMutation() {
  return useMutation({
    mutationFn: async ({ receiver, token }: { receiver: string; token: Task['bounties'][number] }) => {
      return await transferBounty(receiver, token)
    },
    onSuccess: (data) => {
      console.log('Transfer token success:', data)
    },
    onError: (error) => {
      console.error('Transfer token error:', error)
    }
  })
}