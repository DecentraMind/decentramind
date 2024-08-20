import {
  createDataItemSigner,
  message,
  spawn,
  dryrun,
  result
} from '@permaweb/aoconnect'
import type { Community, CommunitySetting, CreateToken, UserInfo, UserInfoWithMuted, VouchData } from '~/types'
import type { CommunityToken } from '~/utils/constants'
import { defaultTokenLogo } from '~/utils/arAssets'
import { createUuid, sleep, retry, checkResult, updateItemInArray, type UpdateItemParams } from '~/utils/util'
import { aoCommunityProcessID, moduleID, schedulerID } from '~/utils/processID'

// Read the Lua file
//const luaCode = fs.readFileSync('./AO/chat.lua', 'utf8')

export const communityStore = defineStore('communityStore', () => {
  const { address } = $(aoStore())
  let twitterVouched = $ref(true)
  let twitterVouchedIDs = $ref<string[]>([])
  let communityList = $ref<Community[]>([])
  let userInfo = $ref<UserInfo>()
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
  let mutedUsers = $ref<string[]>([])

  let currentUuid = $ref<string>()

  //Set the uuid of the currently selected community
  const setCurrentCommunityUuid = (uuid: any) => {
    console.log('set current community:', uuid)
    currentUuid = uuid
  }

  const clearJoinedCommunities = () => {
    communityList.map((item) => {
     item.isJoined = false
     item.joinTime = undefined
     return item
    })
  }

  /** move this function to aoStore */
  const vouch = async () => {
    if (!address) {
      throw new Error('No address specified.')
    }
    const result2 = await message({
      process: 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo',
      tags: [
        { name: 'Action', value: 'Get-Vouches' },
        { name: 'ID', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })

    console.log(result2)
    const res = await result({
      message: result2,
      process: 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo'
    })
    if (!res.Messages || res.Messages.length === 0) {
      twitterVouched = false
      console.log('No Messages found in the response.')
      return []
    }
    if (!res.Messages[0].Data) {
      twitterVouched = false
      console.log('No Data found in the first Message.')
      return []
    }
    console.log('vouch data:', res.Messages[0].Data)
    // Parse the JSON string
    const data = JSON.parse(res.Messages[0].Data) as VouchData

    // Check if Vouchers exist in the data
    if (!data.Vouchers || Object.keys(data.Vouchers).length === 0) {
      twitterVouched = false
      console.log('No Vouchers found in the data.')
      return []
    }

    // Get the Vouchers object
    const vouchers = data.Vouchers

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
    logo,
    banner,
    name,
    desc,
    website,
    twitter,
    github,
    bounty,
    isPublished,
    communityToken,
    isTradable,
    support,
    allToken,
    tokenSupply,
    chatroomID
  ) => {
    const uuid = createUuid()

    const community: Omit<Community, 'timestamp' | 'buildnum'> = {
      logo,
      banner,
      name,
      desc,
      creator: address,
      owner: address,
      website,
      twitter,
      github,
      bounty,
      ispublished: isPublished,
      communitytoken: communityToken,
      istradable: isTradable,
      support: support,
      alltoken: allToken,
      tokensupply: tokenSupply,
      uuid,
      communitychatid: chatroomID,
    }
    const jsonString = JSON.stringify(community)

    await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'createCommunity' }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })

    return uuid
  }

  /**
   * Modifying the community.
   * @param {CommunitySetting} setting - The community settings object.
   * @param {string} bounty - The token type.
   * @param {string} communityToken - The community token distribution ratio.
   * @param {string} support - The trading platform.
   * @param {any} tokenSupply - The details of the community token distribution ratio.
   */
  const updateCommunity = async (
    uuid: string,
    setting: CommunitySetting,
    communityToken: CommunityToken[], // 社区 token 分配比例
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
    const messageID = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'updateCommunity' },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })
    const res = await result({
      message: messageID,
      process: aoCommunityProcessID
    })
    console.log({ communityUpdateRes: res })
    checkResult(res)
  }

  /**
   * Get community list method. This function will update communityList and joinedCommunityList cache.
   * */
  const loadCommunityList = async (address?: string) => {
    const tags = [
      { name: 'Action', value: 'GetCommunities' }
    ]
    if (address) {
      tags.push({ name: 'userAddress', value: address })
    }
    const result = await dryrun({
      process: aoCommunityProcessID,
      tags
    })
    const data = extractResult<string>(result)
    communityList = JSON.parse(data) as Community[]
    console.log('communityList refreshed', {communityList, address})

    return communityList
  }

  // Getting information about a specific community
  const getCommunity = async (uuid: string, address?: string) => {
    const tags = [
      { name: 'Action', value: 'GetCommunity' },
      { name: 'Uuid', value: uuid }
    ]
    if (address) {
      tags.push({ name: 'userAddress', value: address })
    }
    const result = await dryrun({
      process: aoCommunityProcessID,
      tags
    })

    const json = extractResult<string>(result)
    const res = JSON.parse(json) as Community

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
      return await getCommunity(uuid)
    }

    const community = communityList.find(community => community.uuid === uuid)
    if (!community) {
      return await getCommunity(uuid)
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

  const joinCommunity = async (communityUuid: string, inviterAddress: string) => {
    const join = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'join' },
        { name: 'invite', value: inviterAddress },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: communityUuid,
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
        { name: 'Action', value: 'updateUser' },
        { name: 'userAddress', value: address }
      ],
      data: jsonString,
      signer: createDataItemSigner(window.arweaveWallet),
    })

    if (messageId) {
      userInfo = userData
    }
    return messageId
  }

  //Obtaining Personal Information
  const getUser = async () => {
    userInfo = await getUserByAddress(address) || []

    return userInfo
  }

  const getUserByAddress = async (address: string) => {
    const user = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'getUser' },
        { name: 'userAddress', value: address }
      ]
    })

    if (!user.Messages || !user.Messages.length) {
      console.error('get user error:', user.Error, address)
      throw new Error('Get user info failed.')
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
    const totalSupplyStr = (BigInt(Number(totalSupply)) * BigInt(Math.pow(10, denomination))).toString()

    const processID = await spawn({
      module: moduleID,
      scheduler: schedulerID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{
        name: 'App-Name', value: 'DecentraMind'
      }, {
        name: 'App-Process', value: aoCommunityProcessID,
      }]
    })
    await sleep(1000)

    const luaCode = `Name = "${name}"
Ticker = "${ticker}"
local bint = require(".bint")(256)
local ao = require("ao")
local json = require("json")

if not Balances then
  Balances = { [ao.id] = tostring(bint("${totalSupplyStr}")) }
end
if Denomination ~= ${denomination} then
  Denomination = ${denomination}
end
if not Logo then Logo = "${logo}" end

Handlers.add(
  "info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function(msg)
    ao.send({ Target = msg.From, Name = Name, Ticker = Ticker, Logo = Logo, Denomination = tostring(Denomination) })
  end
)

Handlers.add(
  "balance",
  Handlers.utils.hasMatchingTag("Action", "Balance"),
  function(msg)
    local bal = "0"
    if (msg.Tags.Target and Balances[msg.Tags.Target]) then
      bal = Balances[msg.Tags.Target]
    elseif Balances[msg.From] then
      bal = Balances[msg.From]
    end
    ao.send({ Target = msg.From, Balance = bal, Ticker = Ticker, Account = msg.Tags.Target or msg.From, Data = bal })
  end
)

Handlers.add(
  "balances",
  Handlers.utils.hasMatchingTag("Action", "Balances"),
  function(msg)
    ao.send({ Target = msg.From, Data = json.encode(Balances) })
  end
)

Handlers.add(
  "transfer",
  Handlers.utils.hasMatchingTag("Action", "Transfer"),
  function(msg)
    assert(type(msg.Recipient) == "string", "Recipient is required!")
    assert(type(msg.Quantity) == "string", "Quantity is required!")
    assert(bint.__lt(0, bint(msg.Quantity)), "Quantity must be greater than 0")

    if not Balances[msg.From] then Balances[msg.From] = "0" end
    if not Balances[msg.Recipient] then Balances[msg.Recipient] = "0" end

    local qty = bint(msg.Quantity)
    local balance = bint(Balances[msg.From])

    if bint.__le(qty, balance) then
      Balances[msg.From] = tostring(bint.__sub(balance, qty))
      Balances[msg.Recipient] = tostring(bint.__add(Balances[msg.Recipient], qty))
      if not msg.Cast then
        ao.send({
          Target = msg.From, Action = "Debit-Notice",
          Recipient = msg.Recipient, Quantity = tostring(qty),
          Data = Colors.gray .. "You transferred " .. Colors.blue .. msg.Quantity .. Colors.gray .. " to " .. Colors.green .. msg.Recipient .. Colors.reset
        })
        ao.send({
          Target = msg.Recipient, Action = "Credit-Notice",
          Sender = msg.From, Quantity = tostring(qty),
          Data = Colors.gray .. "You received " .. Colors.blue .. msg.Quantity .. Colors.gray .. " from " .. Colors.green .. msg.Recipient .. Colors.reset
        })
      end
    else
      ao.send({ Target = msg.From, Action = "Transfer-Error", ["Message-Id"] = msg.Id, Error = "Insufficient Balance!" })
    end
  end
)

Handlers.add(
  "mint",
  Handlers.utils.hasMatchingTag("Action", "Mint"),
  function (msg)
    assert(type(msg.Quantity) == "string", "Quantity is required!")
    assert(bint.__lt(0, msg.Quantity), "Quantity must be greater than zero!")

    if not Balances[ao.id] then
      Balances[ao.id] = "0"
    end
    if msg.From == ao.id then
      Balances[msg.From] = tostring(bint.__add(Balances[Owner], msg.Quantity))
      ao.send({ Target = msg.From, Data = Colors.gray .. "Successfully minted " .. Colors.blue .. msg.Quantity .. Colors.reset })
    else
      ao.send({ Target = msg.From, Action = "Mint-Error", ["Message-Id"] = msg.Id, Error = "Only the process owner can mint new " .. Ticker .. " tokens!" })
    end
  end
)`

    const messageID = await retry({
      fn: async () => {
        return await message({
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

    if (!messageID) {
      throw new Error('Eval contract error.')
    }

    const res = await result({
      message: messageID,
      process: processID
    })
    console.log('result message of create token', res)
    if (res.Error) {
      console.error('Eval action error: ' + res.Error)
      throw new Error('Eval contract error.')
    }

    return processID
  }

  let currentCommunityUserMap = $ref<Record<string, UserInfo>>()
  const setCurrentCommunityUserMap = async(users: Record<string, UserInfo>) => {
    currentCommunityUserMap = users
  }


  return $$({
    userInfo,
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
    addCommunity,
    updateCommunity,
    joinCommunity,
    exitCommunity,
    updateUser,
    getUser,
    getUserByAddress,
    getCommunityUser,
    setCurrentCommunityUserMap,
    currentCommunityUserMap,
    getCommunity,
    clearJoinedCommunities
  })
})



if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(communityStore, import.meta.hot))
