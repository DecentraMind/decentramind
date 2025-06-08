import { useMutation, type UseQueryOptions } from '@tanstack/vue-query'
import type { Community, JoinedCommunity, PrivateAreaConfig, PrivateTask } from '~/types'
import { addBoard, addPage, addPrivateTask, deleteProposal, getApplications, getCommunities, getCommunityUser, getLogs, getPage, getPrivateAreaConfig, getPrivateTask, getPrivateUnlockMembers, getQuestions, join, exit, saveProposal, updateBoardTitle, updatePage, updatePrivateAreaConfig, updatePrivateTaskStatus, updateSettleTx, getPrivateTasksByInitiator, getPrivateTasksByParticipant, deletePage, getJoinedCommunities, getCommunity, getAllUsers } from '~/utils/community/community'
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

export const useJoinedCommunitiesQuery = function<TSelect = JoinedCommunity[]>(options?: Partial<UseQueryOptions<JoinedCommunity[], Error, TSelect>>) {
  const { address } = $(aoStore())
  return useQueuedQuery<JoinedCommunity[], TSelect>(
    ['community', 'joinedCommunities', address],
    () => getJoinedCommunities(address),
    {
      enabled: true,
      ...options
    }
  )
}

export const useJoinedCommunitiesFetcher = createQueuedFetcher(['community', 'joinedCommunities'], getJoinedCommunities)

export const useCommunityQuery = createQueryComposable(
  ['community', 'community'],
  (uuid: string) => {
    const { address } = $(aoStore())
    return getCommunity(uuid, address)
  }
)
export const useCommunityFetcher = createQueuedFetcher(['community', 'community'], getCommunity)

// TODO: remove this
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

export const useJoinMutation = (onErrorCb?:()=>void) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({communityToJoin, address, inviteCode}: {communityToJoin: Community, address: string, inviteCode?: string}) => {
      if (inviteCode) {
        await join(communityToJoin.uuid, inviteCode)
      } else {
        await join(communityToJoin.uuid)
      }
      return {joinedCommunity: {...communityToJoin, joinTime: Date.now()}, address}
    },
    onError: (_error, _variables, _context) => {
      onErrorCb?.()
    },
    onSettled: async (data) => {
      const {joinedCommunity, address} = data || {}
      if (!joinedCommunity || !address) return
      await queryClient.cancelQueries({ queryKey: ['community', 'joinedCommunities', address] })
        
      console.log('update joined communities', joinedCommunity, address)
      
      queryClient.setQueryData<JoinedCommunity[]>(
        ['community', 'joinedCommunities', address],
        (old = []) => [joinedCommunity, ...old.filter(c => c.uuid !== joinedCommunity.uuid)]
      )
      queryClient.invalidateQueries({ queryKey: ['community', 'joinedCommunities', address] })
    },
  })
}

export const useExitMutation = (onErrorCb?:()=>void) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({communityUuid, address}: {communityUuid: string, address: string}) => {
      await exit(communityUuid)
      return {address, communityUuid}
    },
    onError: (_error, _variables, _context) => {
      onErrorCb?.()
    },
    onSettled: async (data) => {
      const {address, communityUuid} = data || {}
      if (!address || !communityUuid) return
      await queryClient.cancelQueries({ queryKey: ['community', 'joinedCommunities', address] })
      queryClient.setQueryData<JoinedCommunity[]>(
        ['community', 'joinedCommunities', address],
        (old = []) => old.filter(c => c.uuid !== communityUuid)
      )
      queryClient.invalidateQueries({ queryKey: ['community', 'joinedCommunities', address] })
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

export const useGetPrivateTaskQuery = createQueryComposable(['community', 'privateTask'], getPrivateTask)

export const useGetPrivateTasksByInitiatorQuery = createQueryComposable(
  ['community', 'privateTasksByInitiator'], 
  getPrivateTasksByInitiator
)

export const useGetPrivateTasksByParticipantQuery = createQueryComposable(
  ['community', 'privateTasksByParticipant'], 
  getPrivateTasksByParticipant
)

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

export const useSaveProposalMutation = ({communityUuid}: {communityUuid: string}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (task: PrivateTask) => saveProposal(task),
    onSettled: (updatedTask) => {
      if (!updatedTask) return
      // update board tasks
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        boards: previousConfig?.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task => task.uuid === updatedTask.uuid ? updatedTask : task)
        }))
      })
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useDeleteProposalMutation = ({communityUuid}: {communityUuid: string}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskUuid: string) => deleteProposal(taskUuid),
    onSettled: (deletedTask) => {
      if (!deletedTask) return
      // update board tasks
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        boards: previousConfig?.boards.map(board => ({
          ...board,
          tasks: board.tasks.filter(task => task.uuid !== deletedTask.uuid)
        }))
      })
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useUpdatePrivateTaskStatusMutation = ({communityUuid}: {communityUuid: string}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({taskUuid, operation}: {taskUuid: string, operation: 'approve' | 'reject'}) => updatePrivateTaskStatus(taskUuid, operation),
    onSettled: (updatedTask) => {
      if (!updatedTask) return
      // update board tasks
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        boards: previousConfig?.boards.map(board => ({
          ...board,
          tasks: board.tasks.map(task => task.uuid === updatedTask.uuid ? updatedTask : task)
        }))
      })
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useUpdateSettleTxMutation = ({ communityUuid }: { communityUuid: string }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskUuid, budgetIndex, settleTx }: { taskUuid: string, budgetIndex: number, settleTx: string }) => await updateSettleTx(taskUuid, budgetIndex, settleTx),
    onSuccess: (data, variables) => {
      // Update the task data in the cache
      queryClient.setQueryData(['community', 'privateTask', variables.taskUuid], data)
      
      // Invalidate the private area config query since task status might have changed
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useGetAllUsersQuery = createQueryComposable(['community', 'allUsers'], () => getAllUsers())

export const useGetCommunityUserQuery = createQueryComposable(['community', 'communityUser'], getCommunityUser)
export const useGetCommunityUserFetcher = createQueuedFetcher(['community', 'communityUser'], getCommunityUser)

export const useGetPageQuery = createQueryComposable(['community', 'page'], getPage)

export const useAddPageMutation = ({communityUuid, onErrorCb}: {communityUuid: string, onErrorCb?:()=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (page: {title: string, content: string}) => addPage(communityUuid, page),
    onMutate: async (page: {title: string, content: string}) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      
      if (!previousConfig) {
        return
      }
      
      const tempPageUuid = createUuid()
      const tempPage = {
        uuid: tempPageUuid,
        communityUuid,
        ...page
      }
      
      queryClient.setQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        pages: [
          ...(previousConfig?.pages || []),
          tempPage
        ]
      })
      
      return { previousConfig }
    },
    onError: (_error, _page, context) => {
      onErrorCb?.()
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], context?.previousConfig)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useUpdatePageMutation = ({communityUuid, onErrorCb}: {communityUuid: string, onErrorCb?:()=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({pageUuid, page}: {pageUuid: string, page: {title: string, content: string}}) => updatePage(pageUuid, page),
    onMutate: async ({pageUuid, page}: {pageUuid: string, page: {title: string, content: string}}) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      
      if (!previousConfig) {
        return
      }
      
      queryClient.setQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        pages: previousConfig.pages.map(p => 
          p.uuid === pageUuid 
            ? { ...p, ...page }
            : p
        )
      })
      
      return { previousConfig }
    },
    onError: (_error, _variables, context) => {
      onErrorCb?.()
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], context?.previousConfig)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}

export const useDeletePageMutation = ({communityUuid, onErrorCb}: {communityUuid: string, onErrorCb?:()=>void}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pageUuid: string) => deletePage(pageUuid),
    onMutate: async (pageUuid: string) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
      const previousConfig = queryClient.getQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid])
      
      if (!previousConfig) {
        return
      }
      
      queryClient.setQueryData<PrivateAreaConfig>(['community', 'privateAreaConfig', communityUuid], {
        ...previousConfig,
        pages: previousConfig.pages.filter(p => p.uuid !== pageUuid)
      })
      
      return { previousConfig }
    },
    onError: (_error, _pageUuid, context) => {
      onErrorCb?.()
      queryClient.setQueryData(['community', 'privateAreaConfig', communityUuid], context?.previousConfig)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'privateAreaConfig', communityUuid] })
    }
  })
}