import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import type { PrivateAreaConfig, PrivateTask } from '~/types'
import { addPrivateTask, getApplications, getLogs, getPrivateAreaConfig, getPrivateUnlockMembers, getQuestions, updatePrivateAreaConfig } from '~/utils/community/community'

function createQueryComposable<TArgs, TResult>(
  queryKey: string[],
  queryFn: (_: TArgs) => Promise<TResult>
) {
  return (args: TArgs, options?: Partial<UseQueryOptions<TResult>> & { additionalKeys?: string[] }) => {
    const serializedArgs = args instanceof Object 
    ? JSON.stringify(args) 
    : String(args)
    return useQuery<TResult>({
      queryKey: [...queryKey, serializedArgs, ...(options?.additionalKeys || [])],
      queryFn: () => queryFn(args),
      enabled: true,
      ...options
    })
  }
}

export const useApplicationsByCommunityQuery = createQueryComposable(['community', 'applications'], getApplications)

export const usePrivateUnlockMembersQuery = createQueryComposable(['community', 'privateUnlockMembers'], getPrivateUnlockMembers)

export const useLogsQuery = createQueryComposable(['community', 'logs'], getLogs)

export const useQuestionsQuery = createQueryComposable(['community', 'questions'], getQuestions)

export const usePrivateAreaConfigQuery = createQueryComposable(['community', 'privateAreaConfig'], getPrivateAreaConfig)

export const usePrivateAreaConfigByCommunityMutation = ({uuid, onErrorCb}: {uuid: string, onErrorCb:()=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: PrivateAreaConfig) => updatePrivateAreaConfig(uuid, config),
    onMutate: async (config: PrivateAreaConfig) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'privateAreaConfig', uuid] })
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', uuid])
      queryClient.setQueryData(['community', 'privateAreaConfig', uuid], config)
      return { previousConfig }
    },
    onError: (_error, _config, context) => {
      onErrorCb?.()
      queryClient.setQueryData(['community', 'privateAreaConfig', uuid], context?.previousConfig)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', uuid] })
    }
  })
}

export const useAddPrivateTaskMutation = ({communityUuid, onErrorCb}: {communityUuid: string, onErrorCb:()=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (task: PrivateTask) => addPrivateTask(communityUuid, task),
    onMutate: async (task: PrivateTask) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      const newPrivateAreaConfig = {
        ...previousConfig,
        boards: previousConfig?.boards.map(board => {
          if (board.uuid === task.boardUuid) {
            return {
              ...board,
              tasks: [...board.tasks, task],
            }
          }
          return board
        }),
      }
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], newPrivateAreaConfig)
      return { previousConfig }
    },
    onError: (_error, _task, context) => {
      onErrorCb?.()
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], context?.previousConfig)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}
