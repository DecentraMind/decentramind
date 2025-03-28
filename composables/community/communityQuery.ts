import { useMutation, type UseQueryOptions } from '@tanstack/vue-query'
import type { Community, PrivateAreaConfig, PrivateTask } from '~/types'
import { addBoard, addPrivateTask, getApplications, getCommunities, getLogs, getPrivateAreaConfig, getPrivateUnlockMembers, getQuestions, join, updateBoardTitle, updatePrivateAreaConfig } from '~/utils/community/community'
import { createQueryComposable } from '~/utils/query.client'
import { createUuid } from '~/utils/string'
import { useQueryClient } from '@tanstack/vue-query'

export function useCommunitiesQuery<TSelect = Community[]>(
  address?: string,
  options?: Partial<UseQueryOptions<Community[], Error, TSelect>>
) {
  return createQueryComposable<string | undefined, Community[]>(
    ['community', 'communities'],
    getCommunities
  )<TSelect>(address, options)
}

export const useJoinedCommunitiesQuery = (address?: string, options?: Partial<UseQueryOptions<Community[]>>) => {
  return useCommunitiesQuery(address, {
    ...options,
    // select option to filter joined communities
    select: (communities) => communities.filter((community) => community.isJoined).sort((a, b) => {
      if (a.joinTime && b.joinTime) {
        return b.joinTime - a.joinTime
      }
      return 0
    })
  })
}

export const useCommunityFromCommunitiesQuery = (
  uuid: string, 
  address?: string, 
  options?: Partial<UseQueryOptions<Community[], Error, Community | undefined>>
) => {
  return useCommunitiesQuery<Community | undefined>(address, {
    ...options,
    select: (communities) => communities.find((community) => community.uuid === uuid)
  })
}

export const useJoinMutation = ({communityUuid, inviteCode, onErrorCb}: {communityUuid: string, inviteCode?: string, onErrorCb?:()=>void}) => {
  return useMutation({
    mutationFn: () => inviteCode ? join(communityUuid, inviteCode) : join(communityUuid),
    onError: () => {
      onErrorCb?.()
    }
  })
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

export const useAddBoardMutation = ({communityUuid, onErrorCb}: {communityUuid: string, onErrorCb?:(_: Error)=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => addBoard(communityUuid, title),
    onMutate: async (title: string) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])

      if (!previousConfig) {
        return
      }

      const tempBoardUuid = createUuid()
      queryClient.setQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        boards: [
          ...(previousConfig?.boards || []),
          {
            uuid: tempBoardUuid,
            communityUuid,
            title,
            taskUuids: [],
            tasks: []
          }
        ]
      })
      return { previousConfig }
    },
    onError: (error, _title, context) => {
      onErrorCb?.(error)
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], context?.previousConfig)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useUpdateBoardTitleMutation = ({communityUuid, onErrorCb}: {communityUuid: string, onErrorCb:()=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({boardUuid, title}: {boardUuid: string, title: string}) => updateBoardTitle(boardUuid, title),
    onMutate: async ({boardUuid, title}: {boardUuid: string, title: string}) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        boards: previousConfig?.boards.map(board => board.uuid === boardUuid ? { ...board, title } : board)
      })
      return { previousConfig }
    },
    onError: (_error, _boardUuid, context) => {
      onErrorCb?.()
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], context?.previousConfig)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useAddPrivateTaskMutation = ({communityUuid, onErrorCb}: {communityUuid: string, onErrorCb?:()=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (task: PrivateTask) => addPrivateTask(task),
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
