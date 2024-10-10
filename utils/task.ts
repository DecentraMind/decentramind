import type { Community, InviteCodeInfo, SpaceSubmission, TwitterSpaceInfo } from '~/types'
import { useFetch } from '@vueuse/core'
import { unref } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import { compareImages } from '~/utils/image'
import { gateways, arUrl } from '~/utils/arAssets'

export async function saveSpaceTaskSubmitInfo({submitterAddress, spaceUrl, taskPid, communityInfo, invites, mode, submissionId}: {submitterAddress: string, spaceUrl: string, taskPid: string, communityInfo: Community, invites: InviteCodeInfo[], mode: 'add' | 'update', submissionId?: number}) {
  const runtimeConfig = useRuntimeConfig()
  const { twitterVouchedIDs } = $(communityStore())
  const { submitSpaceTask, updateSubmission } = useTaskStore()

  const matched = spaceUrl.trim().match(/(x|twitter)\.com\/i\/spaces\/([^/]+)\/?/)

  if (!matched || !matched[2]) {
    throw new Error('Invalid space URL.')
  }
  const spaceId = matched[2]

  const { data, error } = await useFetch(
    '/api/getTwitterSpace?' + new URLSearchParams({ spaceId }),
  ).json<TwitterSpaceInfo>()
  const spaceInfo = unref(data)

  if (error.value || !spaceInfo) {
    console.error('Error fetching data:', error)
    throw new Error('Failed to validate space URL.')
  }

  console.log('data from twitter = ', spaceInfo)
  type SpaceInfoError = {
    detail: string
    type: string
  }
  if ((spaceInfo as unknown as {errors: SpaceInfoError[]} ).errors?.length) {
    const error = (spaceInfo as unknown as {errors: SpaceInfoError[]}).errors[0]
    throw new Error('Failed to validate space URL: ' + error.detail)
  }

  const {
    started_at,
    ended_at,
    participant_count: participantCount,
  } = spaceInfo.data
  const spaceStartAt = new Date(started_at).getTime()
  const spaceEndedAt = new Date(ended_at).getTime()
  const validJoinStartAt = new Date(
    spaceEndedAt - 24 * 60 * 60 * 1000,
  ).getTime()

  const minuteDifference = (spaceEndedAt - spaceStartAt) / (1000 * 60)
  
  if (minuteDifference < 15 && !runtimeConfig.public.debug) {
    throw Error('Space lasts less than 15 minutes')
  }

  const hostID = spaceInfo.data.creator_id
  const host = spaceInfo.includes.users.find(user => user.id === hostID)
  const hostHandle = host?.username
  
  if (!runtimeConfig.public.debug && (!host || !twitterVouchedIDs.find(id => id === hostHandle))) {
    throw new Error('You are not the space host.')
  }

  // space参与人数
  // space创办人的头像 用于和社区头像做比较，如果base64编码不同，不计算品牌效应成绩
  // const la = host.profile_image_url
  // const resp = la.split('_')
  // let url = ''
  // for (let i = 0;i < resp.length - 1;++i) {
  //   url = url + resp[i]
  //   if (i != resp.length - 2) {
  //     url += '_'
  //   }
  // }
  // url = url + '.png'
  const userAvatar = host?.profile_image_url.replace(/_(normal|bigger|mini).jpg$/, '.jpg')
  // space创办人账号的创建时间 如果距离提交任务不足一个月不计算score
  // const userCreatedAt = data._rawValue.includes.users[0].created_at

  // const userAvatarBase64 = await url2Base64(userAvatar)
  // TODO use https://dms.4everland.store/... as communityLogo
  const ssim = userAvatar
    ? await compareImages(arUrl(communityInfo.logo, gateways.ario), userAvatar)
    : 0
  // console.log({ ssim, communityLogo: arUrl(communityInfo.logo, gateways.ario), twitterUserAvatar: userAvatar})
  
  // TODO brandEffect, inviteCount, audience should be calculated again under task owner's login session
  // 品牌效应
  const brandEffect = ssim && ssim >= 0.8 ? 10 : 0
  // 听众
  const audience = participantCount
  // 邀请人数
  const inviteCount = invites.filter(inviteInfo => {
    return (
      inviteInfo.inviterAddress === submitterAddress &&
      inviteInfo.communityUuid === communityInfo.uuid
    )
  }).reduce((total, inviteInfo) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validInvitees = Object.entries<{ joinTime: number }>(inviteInfo.invitees).filter(([_, invitee]) => {
      const { joinTime } = invitee
      return joinTime < spaceEndedAt && joinTime > validJoinStartAt
    })
    total += validInvitees.length
    return total
  }, 0)


  if (mode === 'add') {
    const spaceSubmission:Omit<SpaceSubmission, 'id'|'createTime'> = {
      taskPid,
      address: submitterAddress,
      inviteCount,
      audience,
      brandEffect,
      url: spaceUrl,
      // TODO calculate score at server side or at AO
      score: 0
    }
    await submitSpaceTask(spaceSubmission)
  } else if (mode === 'update') {
    if (!submissionId) {
      throw new Error('Submission ID is required')
    }
    const spaceSubmission:Omit<SpaceSubmission, 'createTime'|'brandEffect'|'score'|'taskPid'|'address'> = {
      id: submissionId!,
      inviteCount,
      audience,
      url: spaceUrl
    }
    await updateSubmission(spaceSubmission, taskPid)
  } else {
    throw new Error('Invalid mode')
  }
}
