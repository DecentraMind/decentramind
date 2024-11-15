import {
  createDataItemSigner,
  message,
  spawn,
  dryrun,
  result
} from '~/utils/ao'
import type { Community, CommunitySetting, CreateToken, UserInfo, UserInfoWithMuted, VouchData } from '~/types'
import type { CommunityToken } from '~/utils/constants'
import { defaultTokenLogo, messageResultCheck, sleep, retry, checkResult, updateItemInArray, type UpdateItemParams, MU } from '~/utils'
import { moduleID, schedulerID, extractResult, DM_PROCESS_ID, VOUCH_PROCESS_ID } from '~/utils'
import tokenProcessCode from '~/AO/Token.tpl.lua?raw'
import { getCommunity as getCommunityAO } from '~/utils/community/community'

export const communityStore = defineStore('communityStore', () => {
  const aoCommunityProcessID = DM_PROCESS_ID

  const { address } = $(aoStore())
  let twitterVouched = $ref(false)
  let twitterVouchedIDs = $ref<string[]>([])
  let communityList = $ref<Community[]>([])
  let mutedUsers = $ref<string[]>([])
  let currentUuid = $ref<string>()

  /** joined communities of current user */
  const joinedCommunities = $computed<Community[]>(() => {
    if (!address) return []

    return (communityList as Community[]).filter((item) => item.isJoined)
      .sort((a, b) => {
        if (a.joinTime && b.joinTime) {
          return b.joinTime - a.joinTime
        }
        return 0
      })
  })

  //Set the uuid of the currently selected community
  const setCurrentCommunityUuid = (uuid: any) => {
    console.log('set current community:', uuid)
    currentUuid = uuid
  }

  const clearCommunityData = () => {
    communityList.map((item) => {
     item.isJoined = false
     item.joinTime = undefined
     return item
    })
    twitterVouched = false
    twitterVouchedIDs = []
    mutedUsers = []
    currentUuid = undefined
  }

  /** move this function to aoStore */
  const vouch = async () => {
    if (!address) {
      throw new Error('No address specified.')
    }
    const res = await dryrun({
      process: VOUCH_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'Get-Vouches' },
        { name: 'ID', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })

    let data: string
    try {
      data = extractResult<string>(res)
    } catch (e) {
      console.error('Failed to get vouch data', e)
      return []
    }
    console.log('vouch data:', data)
    // Parse the JSON string
    const vouchData = JSON.parse(data) as VouchData

    // Check if Vouchers exist in the data
    if (!vouchData.Vouchers || Object.keys(vouchData.Vouchers).length === 0) {
      twitterVouched = false
      console.log('No Vouchers found in the data.')
      return []
    }

    // Get the Vouchers object
    const vouchers = vouchData.Vouchers

    // Get all Identifiers
    twitterVouchedIDs = Object.values(vouchers)
      .map(voucher => voucher.Identifier)
      .filter(identifier => identifier) // Remove any undefined or null values

    if (twitterVouchedIDs.length === 0) {
      console.log('No valid Identifiers found in Vouchers.')
      twitterVouched = false
      return []
    }
    console.log('twitterVouchedIDs:', twitterVouchedIDs)

    twitterVouched = true
    return twitterVouchedIDs
  }

  const mute = async (communityUuid: string, userAddress: string) => {
    const messageId = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'Mute' },
        { name: 'CommunityUuid', value: communityUuid },
        { name: 'User', value: userAddress }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })
    const res = await result({ process: aoCommunityProcessID, message: messageId})
    checkResult(res)
  }

  const unmute = async (communityUuid: string, userAddress: string) => {
    const messageId = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'Unmute' },
        { name: 'CommunityUuid', value: communityUuid },
        { name: 'User', value: userAddress }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })
    const res = await result({ process: aoCommunityProcessID, message: messageId})
    checkResult(res)
  }

  const getMutedUsers = async (communityUuid: string) => {
    if (!communityUuid) {
      throw new Error('No communityUuid specified.')
    }
    const result = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'GetMutedUsers' },
        { name: 'CommunityUuid', value: communityUuid }
      ]
    })

    const data = extractResult<string>(result)
    mutedUsers = JSON.parse(data) as string[]
    return mutedUsers
  }

  //Creating a community approach
  const addCommunity = async (
    setting: CommunitySetting,
    communityToken: CommunityToken[],
    chatroomID: string
  ) => {
    const { logo, banner, name, desc, website, twitter, github, isPublished, isTradable, tradePlatforms, allTokenSupply, tokenAllocations, bountyTokenNames } = setting
    const community: Omit<Community, 'uuid' | 'timestamp' | 'buildnum' | 'isJoined'> = {
      logo,
      banner,
      name,
      desc,
      creator: address,
      owner: address,
      website,
      twitter,
      github,
      bounty: bountyTokenNames,
      ispublished: isPublished,
      communitytoken: communityToken.filter(token => token.tokenName),
      istradable: isTradable,
      support: tradePlatforms,
      alltoken: allTokenSupply,
      tokensupply: tokenAllocations,
      communitychatid: chatroomID,
    }
    const jsonString = JSON.stringify(community)

    const createdCommunity = await messageResultParsed({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'CreateCommunity' }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })

    updateLocalCommunity(createdCommunity.uuid, createdCommunity)

    return createdCommunity.uuid
  }

  /**
   * Modifying the community.
   */
  const updateCommunity = async (
    uuid: string,
    setting: CommunitySetting,
    communityToken: CommunityToken[],
    owner: string
  ) => {
    const { logo, banner, name, desc, website, twitter, github, isPublished, isTradable, tradePlatforms, allTokenSupply, tokenAllocations, bountyTokenNames } = setting
    const communitySetting = {
      logo,
      banner,
      name,
      desc,
      owner,
      website,
      twitter,
      github,
      bounty: bountyTokenNames,
      ispublished: isPublished,
      communitytoken: communityToken.filter(token => token.tokenName),
      istradable: isTradable,
      support: tradePlatforms,
      alltoken: allTokenSupply,
      tokensupply: tokenAllocations,
      uuid
    }
    const jsonString = JSON.stringify(communitySetting)
    const res = await messageResultParsed({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'UpdateCommunity' },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })
    console.log({ communityUpdateRes: res })

    updateLocalCommunity(uuid, res)
  }

  const updateCommunityAdmins = async (uuid: string, admins: string[]) => {
    const jsonString = JSON.stringify(admins)
    const res = await messageResultParsed({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'UpdateCommunityAdmins' },
        { name: 'Uuid', value: uuid }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })
    console.log({ communityUpdateRes: res })

    updateLocalCommunity(uuid, 'admins', admins)

    return res
  }

  let isCommunityListLoading = $ref(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let communityListError = $ref<string>()
  /**
   * Get community list method. This function will update communityList and joinedCommunityList cache.
   * */
  const loadCommunityList = async (address?: string) => {
    isCommunityListLoading = true
    communityListError = undefined

    const tags = [
      { name: 'Action', value: 'GetCommunities' }
    ]
    if (address) {
      tags.push({ name: 'userAddress', value: address })
    }
    try {
      const data = await dryrunResult<string>({
        process: aoCommunityProcessID,
        tags
      })
      communityList = JSON.parse(data) as Community[]
      console.log('communityList refreshed', {communityList, address})
    } catch (error) {
      console.error('Failed to fetching community list:', error)
      communityListError = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error')
    } finally {
      isCommunityListLoading = false
    }

    return communityList
  }

  // Getting information about a specific community
  const getCommunity = async (uuid: string, address?: string) => {
    const res = await getCommunityAO(uuid, address)

    updateLocalCommunity(uuid, res)
    console.log('community refreshed', { res, uuid, address })

    return res
  }

  /**
   * Getting information about a specific community from a cached community list.
   * @param uuid
   * @param reFetch should refetch from AO
   * @returns
   */
  const getLocalCommunity = async (uuid: string, reFetch = false) => {
    if (reFetch) {
      return await getCommunity(uuid, address)
    }

    const community = communityList.find(community => community.uuid === uuid)
    if (!community) {
      return await getCommunity(uuid, address)
    }
    return community
  }

  /**
   * Update local communityList cache
   * */
  function updateLocalCommunity<K extends keyof Community>(
    uuid: string,
    fieldOrNewCommunity: K|Community,
    value?: Community[K]
  ) {
    const params: UpdateItemParams<Community, K> = {
      array: communityList,
      identifierKey: 'uuid',
      identifierValue: uuid,
      fieldOrNewItem: fieldOrNewCommunity
    }
    if (arguments.length >= 3) {
      params.value = value
    }
    return updateItemInArray(params)
  }

  /**
   * Get joined users of a community.
   * */
  const getCommunityUser = async (communityUuid: string) => {
    const result = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'GetUsersByCommunityUUID' },
        { name: 'CommunityUuid', value: communityUuid }
      ],
    })

    const dataStr = extractResult<string>(result)

    const communityUserMap = JSON.parse(dataStr) as Record<string, UserInfoWithMuted>

    return communityUserMap
  }

  const createCommunityInviteCode  = async (communityUuid: string) => {
    const code = await messageResult<string>({
      process: aoCommunityProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [
        { name: 'Action', value: 'CreateInviteCode' },
        { name: 'CommunityUuid', value: communityUuid }
      ],
    })
    return code
  }

  const joinCommunity = async (communityUuid: string, inviteCode?: string) => {
    const tags = [
      { name: 'Action', value: 'Join' },
      { name: 'CommunityUuid', value: communityUuid },
    ]
    if (inviteCode) {
      tags.push({ name: 'InviteCode', value: inviteCode })
    }
    const join = await messageResultCheck({
      process: aoCommunityProcessID,
      tags,
      signer: createDataItemSigner(window.arweaveWallet)
    })
    updateLocalCommunity(communityUuid, 'isJoined', true)
    return join
  }

  //Methods of withdrawing from the community
  const exitCommunity = async (uuid: string) => {
    const messageId = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'Exit' },
        { name: 'Uuid', value: uuid }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: uuid,
    })
    const { Error: error } = await result({ message: messageId, process: aoCommunityProcessID })
    if (error) {
      console.error(error)
      throw new Error('Exit error. ' + error)
    }

    updateLocalCommunity(uuid, 'isJoined', false)
  }

  //Modification of personal information
  const updateUser = async (userData: UserInfo) => {
    const jsonString = JSON.stringify(userData)
    const messageId = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'UpdateUser' },
        { name: 'userAddress', value: address }
      ],
      data: jsonString,
      signer: createDataItemSigner(window.arweaveWallet),
    })

    return messageId
  }

  const getUserByAddress = async (address: string) => {
    const user = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'GetUserByAddress' },
        { name: 'Address', value: address }
      ]
    })

    if (!user.Messages || !user.Messages.length) {
      console.error('get user error:', user.Error, address)
      throw new Error('Get user info failed.')
    }

    if (!user.Messages[0].Data) {
      return {
        name: '',
        avatar: ''
      }
    }

    const userInfo = JSON.parse(user.Messages[0].Data) as UserInfo
    return userInfo
  }

  //Create a community chat room
  const makeCommunityChat = async () => {
    const processId2 = await spawn({
      module: moduleID,
      scheduler: schedulerID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{
        name: 'Name', value: 'DecentraMind Chatroom'
      }, {
        name: 'App-Name', value: 'DecentraMind'
      }, {
        name: 'App-Process', value: aoCommunityProcessID,
      }, {
        name: 'Authority', value: MU
      }]
    })

    await sleep(1000)

    const luaCode = 'Handlers.add(    "inboxCount",    Handlers.utils.hasMatchingTag("Action", "#Inbox"),    function (msg)      local inboxCount = #Inbox      ao.send({      Target = msg.From,      Tags = {      InboxCount = tostring(inboxCount)      }      })      Handlers.utils.reply("Echo back")(msg)    end  )      Handlers.add(    "inboxMessage",    Handlers.utils.hasMatchingTag("Action", "CheckInbox"),    function (msg)      local index = tonumber(msg.Tags.Index)      if index and index > 0 and index <= #Inbox then      local message = Inbox[index]      ao.send({      Target = msg.From,      Tags = {      Action = "Inbox",      Index = tostring(index),      MessageDetails = message      }      }) else      ao.send({      Target = msg.From,      Tags = {      Error = "Invalid inbox message index"      }      })      end      Handlers.utils.reply("Echo back")(msg)    end  )'

    const resultMessageID = await retry({
      fn: async () => {
        return await message({
          process: processId2,
          tags: [
            { name: 'Action', value: 'Eval' }
          ],
          data: luaCode,
          signer: createDataItemSigner(window.arweaveWallet),
        })
      },
      maxAttempts: 7,
      interval: 2000
    })

    console.log('make chat result', resultMessageID)

    if (resultMessageID) {
      return processId2
    }
  }

  const createToken = async (token: CreateToken) => {
    const { name, ticker, totalSupply } = token
    const logo = token.logo || defaultTokenLogo
    console.log('creating token:', { name, ticker, totalSupply, logo })

    const denomination = 12
    const totalSupplyStr = float2BigInt(Number(totalSupply), denomination).toString()

    const processID = await spawn({
      module: moduleID,
      scheduler: schedulerID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{
        name: 'Name', value: name
      }, {
        name: 'App-Name', value: 'DecentraMind'
      }, {
        name: 'App-Process', value: aoCommunityProcessID,
      }, {
        name: 'Authority', value: MU
      }]
    })
    await sleep(1000)

    const luaCode = tokenProcessCode.replaceAll('${name}', name).replaceAll('${ticker}', ticker).replaceAll('${denomination}', denomination.toString()).replaceAll('${logo}', logo).replaceAll('${totalSupplyStr}', totalSupplyStr)

    await retry({
      fn: async () => {
        return await messageResultCheck({
          process: processID,
          tags: [
            { name: 'Action', value: 'Eval' }
          ],
          data: luaCode,
          signer: createDataItemSigner(window.arweaveWallet),
        })
      },
      maxAttempts: 3,
      interval: 2000
    })

    return processID
  }

  let currentCommunityUserMap = $ref<Record<string, UserInfo>>()
  const setCurrentCommunityUserMap = async(users: Record<string, UserInfo>) => {
    currentCommunityUserMap = users
  }


  return $$({
    communityList,
    joinedCommunities,
    currentUuid,
    mutedUsers,
    twitterVouched,
    twitterVouchedIDs,
    vouch,
    mute,
    unmute,
    createToken,
    getMutedUsers,
    setCurrentCommunityUuid,
    makeCommunityChat,
    getLocalCommunity,
    loadCommunityList,
    isCommunityListLoading,
    communityListError,
    addCommunity,
    updateCommunity,
    updateCommunityAdmins,
    createCommunityInviteCode,
    joinCommunity,
    exitCommunity,
    updateUser,
    getUserByAddress,
    getCommunityUser,
    setCurrentCommunityUserMap,
    currentCommunityUserMap,
    getCommunity,
    clearCommunityData,
  })
})



if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(communityStore, import.meta.hot))
