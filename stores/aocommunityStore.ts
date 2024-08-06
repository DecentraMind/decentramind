import {
  createDataItemSigner,
  message,
  spawn,
  dryrun,
  result
} from '@permaweb/aoconnect'
import type { Community, CommunityList, CommunityListItem, CommunitySetting, UserInfo } from '~/types'
import type { CommunityToken, TokenSupply } from '~/utils/constants'
import { createUuid, sleep, retry } from '~/utils/util'
import { aoCommunityProcessID, moduleID, schedulerID } from '~/utils/processID'

// Read the Lua file
//const luaCode = fs.readFileSync('./AO/chat.lua', 'utf8')

export const aoCommunityStore = defineStore('aoCommunityStore', () => {
  const { address } = $(aoStore())
  let linkTwitter = $ref(true)
  let communityList = $ref<CommunityList>([])
  let userInfo = $ref<UserInfo>()
  let communityUser = $ref({})
  let joinedCommunities = $ref<CommunityList>([])
  let chatBanuser = $ref({})
  let isLoading = $ref(false)
  let isJoining = $ref(false)
  let isExiting = $ref(false)
  let currentUuid = $ref('')

  //Set the uuid of the currently selected community
  const setCurrentUuid = (uuid: any) => {
    currentUuid = uuid
  }

  //
  const vouch = async () => {
    try {
      console.log(address)
      const result2 = await message({
        process: 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo',
        tags: [
          { name: 'Action', value: 'Get-Vouches' },
          { name: 'ID', value: address }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log(result2)
      const res = await result({
        message: result2,
        process: 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo'
      });
      if (!res.Messages || res.Messages.length === 0) {
        linkTwitter = false
        console.log('No Messages found in the response.')
        return false
      }
      if (!res.Messages[0].Data) {
        linkTwitter = false
        console.log('No Data found in the first Message.')
        return false
      }
      console.log(res)
      // Parse the JSON string
      const data = JSON.parse(res.Messages[0].Data)

      // Check if Vouchers exist in the data
      if (!data.Vouchers || Object.keys(data.Vouchers).length === 0) {
        linkTwitter = false
        console.log('No Vouchers found in the data.')
        return false
      }

      // Get the Vouchers object
      const vouchers = data.Vouchers;

      // Get all Identifiers
      const identifiers = Object.values(vouchers)
        .map(voucher => voucher.Identifier)
        .filter(identifier => identifier) // Remove any undefined or null values

      if (identifiers.length === 0) {
        console.log('No valid Identifiers found in Vouchers.')
        linkTwitter = false
        return false
      }

      console.log('Identifiers:', identifiers)

      // If you only want the first (or only) Identifier:
      const firstIdentifier = identifiers[0]
      console.log('First Identifier:', firstIdentifier)
      linkTwitter = true
      return true
    } catch (error) {
      console.error('An error occurred:', error)
      // You might want to show an error message to the user here
    }
  }

  const banChat = async (communityId: string, userAddress: string) => {
    if (isLoading) return
    isLoading = true
    console.log('test---')
    console.log(communityId)
    console.log(userAddress)
    await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'chatban' },
        { name: 'community', value: communityId },
        { name: 'user', value: userAddress }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })
    isLoading = false
  }

  const unbanChat = async (communityId: string, userAddress: string) => {
    if (isLoading) return
    isLoading = tryUseNuxtApp
    await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'unchatban' },
        { name: 'community', value: communityId },
        { name: 'user', value: userAddress }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })
    isLoading = false
  }

  const getBan = async () => {
    if (isLoading) return
    isLoading = true
    const result = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'getchatban' }
      ]
    })
    console.log('testaaa')
    console.log(result.Messages[0].Data)
    // Assuming chatBanuser is set to result.Messages[0].Data
    const chatBanuserString = result.Messages[0].Data

    // Parse the JSON string
    chatBanuser = JSON.parse(chatBanuserString)

    isLoading = false
  }

  //Creating a community approach
  const addCommunity = async (
    logo,
    Banner,
    Name,
    desc,
    Website,
    Twitter,
    Github,
    Bounty,
    Ispublished,
    CommunityToken,
    IsTradable,
    Support,
    AllToken,
    TokenSupply,
    CommunityChatid
  ) => {
    const time = Date.now()
    const uuid = createUuid()

    const communitySubmitList = {
      logo: logo,
      banner: Banner,
      name: Name,
      desc,
      creater: address,
      owner: address,
      website: Website,
      twitter: Twitter,
      github: Github,
      buildnum: 1,
      bounty: Bounty,
      ispublished: Ispublished,
      communitytoken: CommunityToken,
      istradable: IsTradable,
      support: Support,
      alltoken: AllToken,
      tokensupply: TokenSupply,
      uuid: uuid,
      timestamp: time.toString(),
      communitychatid: CommunityChatid,
    }
    const jsonString = JSON.stringify(communitySubmitList)
    const invite = 'none'

    await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'add' },
        { name: 'userAddress', value: address },
        { name: 'time', value: time.toString() },
        { name: 'invite', value: invite }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })

    return uuid
  }

  /**
   * Modifying the community approach.
   * @param {CommunitySetting} setting - The community settings object.
   * @param {string} bounty - The token type.
   * @param {string} communityToken - The community token distribution ratio.
   * @param {string} support - The trading platform.
   * @param {any} tokenSupply - The details of the community token distribution ratio.
   */
  const updateCommunity = async (
    uuid: string,
    setting: CommunitySetting,
    bounty: string[], // token 类型
    communityToken: CommunityToken[], // 社区 token 分配比例
    support: string[], // 交易的平台
    tokenSupply: TokenSupply[], /** 社区 token 分配比例详情 */
  ) => {
    if (isLoading) return
    isLoading = true

    const { logoBase64Data: logo, banner, name, desc, creator, owner, website, twitter, github, builderNum, isPublished, isTradable, allToken, communityChatID, time } = setting
    const communitySubmitList = {
      logo,
      banner,
      name,
      desc,
      creater: creator,
      owner,
      website,
      twitter,
      github,
      buildnum: builderNum,
      bounty,
      ispublished: isPublished,
      communitytoken: communityToken,
      istradable: isTradable,
      support,
      alltoken: allToken,
      tokensupply: tokenSupply,
      uuid,
      timestamp: time,
      communitychatid: communityChatID
    }
    const jsonString = JSON.stringify(communitySubmitList)
    const messageID = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'updateCommunity' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })
    const res = await result({
      message: messageID,
      process: aoCommunityProcessID
    })
    console.log({communityUpdateRes: res})
    if (!res.Messages.length) {
      res.Output.data && console.error(res.Output.data)
      throw new Error('Failed to update community.')
    }
    // TODO update local community
    isLoading = false
  }

  /**
   * Get community list method (which generates a community table, and a joined community table)
   * */
  const getCommunityList = async () => {
    if (address !== '') {
      const result = await dryrun({
        process: aoCommunityProcessID,
        tags: [
          { name: 'Action', value: 'getCommunities' },
          { name: 'userAddress', value: address }
        ],
      })
      const jsonData = result.Messages[0].Data
      communityList = JSON.parse(jsonData) as CommunityList

      // Iterate through each object and parse nested JSON strings
      communityList = communityList.map((item) => {
        if (item.communitytoken && typeof item.communitytoken === 'string') {
          try {
            item.communitytoken = JSON.parse(item.communitytoken)
          } catch (e) {
            console.error('Failed to parse communitytoken:', e, item.communitytoken)
          }
        }
        return item
      })

      joinedCommunities = communityList.filter((item) => item.isJoined === true)
      joinedCommunities.sort((a: CommunityListItem, b: CommunityListItem) => {
        return parseInt(b.joinTime!) - parseInt(a.joinTime!)
      })
      isLoading = false
      return result
    } else {
      const result = await dryrun({
        process: aoCommunityProcessID,
        tags: [
          { name: 'Action', value: 'getCommunities' }
        ],
      })
      const jsonData = result.Messages[0].Data // 获取原始的 JSON 字符串
      const jsonObjects = jsonData.match(/\{.*?\}/g) // 使用正则表达式匹配字符串中的 JSON 对象
      communityList = jsonObjects.map((item: any) => JSON.parse(item)) // 解析每个 JSON 对象并存储到数组中
      joinedCommunities = jsonObjects
        .map((item: any) => JSON.parse(item))
        .filter((item: any) => item.isJoined === true)
      isLoading = false
      return result
    }
  }

  /**
   * Update local community.isJoined
   * */
  const updateLocalCommunityJoin = async (uuid: string, joinStatus: 'join' | 'exit') => {
    for (let i = 0; i < communityList.length; i++) {
      if (communityList[i].uuid === uuid) {
        if (joinStatus == 'join') {
          console.log('join')
          communityList[i].isJoined = true
        } else {
          console.log('exit')
          communityList[i].isJoined = false
        }
        break
      }
    }
    joinedCommunities = communityList.filter((item) => item.isJoined === true)
  }

  //Get joined users in a given community
  const getCommunityUser = async (uuid: any) => {
    if (isLoading) return
    isLoading = true
    const result = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'communityuser' },
        { name: 'uuid', value: uuid }
      ],
    })
    if (result && result.Messages && result.Messages.length > 0) {
      const dataStr = result.Messages[0].Data

      communityUser = JSON.parse(dataStr)
      let parsedCommunityUser = {}

      for (const key in communityUser) {
        if (communityUser.hasOwnProperty(key)) {
          try {
            parsedCommunityUser[key] = JSON.parse(communityUser[key])
          } catch (e) {
            console.error(`Error parsing JSON for key ${key}:`, e)
            parsedCommunityUser[key] = communityUser[key]
          }
        }
      }
      communityUser = reactive(parsedCommunityUser)
    }
    isLoading = false
    return result
  }

  //Getting information about a specific community from a cached community list
  const getLocalCommunity = async (uuid: string, reFetch = false) => {
    if (!communityList || !communityList.length || reFetch) {
      await getCommunityList()
    }

    if (!communityList || !communityList.length) {
      await getCommunityList()
    }

    const community = communityList.find(community => community.uuid === uuid)
    return community
  }

  //Getting information about a specific community
  const getCommunity = async (uuid: any) => {
    const result = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'getCommunity' },
        { name: 'uuid', value: uuid }
      ]
    })

    const json = extractResult<string>(result)
    if (!json) return

    return JSON.parse(json) as Community
  }

  //How to join the community
  const joinCommunity = async (communityID: string, inviterAddress: string) => {
    if (isJoining) return
    isJoining = true
    try {
      console.log('-----------')
      const time = Date.now()
      const join = await message({
        process: aoCommunityProcessID,
        tags: [
          { name: 'Action', value: 'join' },
          { name: 'userAddress', value: address },
          { name: 'invite', value: inviterAddress },
          { name: 'time', value: time.toString() }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
        data: communityID,
      })
      console.log(join)
      isJoining = false
      return join
    } catch (error) {
      alert('join failed: ' + error)
    } finally {
      isJoining = false
    }
  }

  //Methods of withdrawing from the community
  const exitCommunity = async (uuid: string) => {

    const exit = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'exit' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: uuid,
    })
    await updateLocalCommunityJoin(uuid, 'exit')
    return exit
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

  const createToken = async (Name: any, Ticker: any, Balance: any) => {
    if (isLoading) return
    isLoading = true
    try {
      const processId2 = await spawn({
        module: moduleID,
        scheduler: schedulerID,
        signer: createDataItemSigner(window.arweaveWallet),
      })
      await sleep(5000)
      const tokenName = 'Name = "' + Name + '"  ' + 'Ticker = "' + Ticker + '"'
      const luaCode = tokenName + '  local bint = require(".bint")(256)  local ao = require("ao")  local json = require("json")  if not Balances then Balances = { [ao.id] = tostring(bint(' + Balance + ' * 1e12)) } end  if Denomination ~= 12 then Denomination = 12 end  if not Logo then Logo = "SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY" end  Handlers.add("info", Handlers.utils.hasMatchingTag("Action", "Info"), function(msg) ao.send({ Target = msg.From, Name = Name, Ticker = Ticker, Logo = Logo, Denomination = tostring(Denomination) }) end)  Handlers.add("balance", Handlers.utils.hasMatchingTag("Action", "Balance"), function(msg) local bal = "0" if (msg.Tags.Target and Balances[msg.Tags.Target]) then bal = Balances[msg.Tags.Target] elseif Balances[msg.From] then bal = Balances[msg.From] end ao.send({ Target = msg.From, Balance = bal, Ticker = Ticker, Account = msg.Tags.Target or msg.From, Data = bal }) end)  Handlers.add("balances", Handlers.utils.hasMatchingTag("Action", "Balances"), function(msg) ao.send({ Target = msg.From, Data = json.encode(Balances) }) end)  Handlers.add("transfer", Handlers.utils.hasMatchingTag("Action", "Transfer"), function(msg) assert(type(msg.Recipient) == "string", "Recipient is required!") assert(type(msg.Quantity) == "string", "Quantity is required!") assert(bint.__lt(0, bint(msg.Quantity)), "Quantity must be greater than 0") if not Balances[msg.From] then Balances[msg.From] = "0" end if not Balances[msg.Recipient] then Balances[msg.Recipient] = "0" end local qty = bint(msg.Quantity) local balance = bint(Balances[msg.From]) if bint.__le(qty, balance) then Balances[msg.From] = tostring(bint.__sub(balance, qty)) Balances[msg.Recipient] = tostring(bint.__add(Balances[msg.Recipient], qty)) if not msg.Cast then ao.send({ Target = msg.From, Action = "Debit-Notice", Recipient = msg.Recipient, Quantity = tostring(qty), Data = Colors.gray .. "You transferred " .. Colors.blue .. msg.Quantity .. Colors.gray .. " to " .. Colors.green .. msg.Recipient .. Colors.reset }) ao.send({ Target = msg.Recipient, Action = "Credit-Notice", Sender = msg.From, Quantity = tostring(qty), Data = Colors.gray .. "You received " .. Colors.blue .. msg.Quantity .. Colors.gray .. " from " .. Colors.green .. msg.Recipient .. Colors.reset }) end else ao.send({ Target = msg.From, Action = "Transfer-Error", ["Message-Id"] = msg.Id, Error = "Insufficient Balance!" }) end end)  Handlers.add("mint", Handlers.utils.hasMatchingTag("Action", "Mint"), function (msg) assert(type(msg.Quantity) == "string", "Quantity is required!") assert(bint.__lt(0, msg.Quantity), "Quantity must be greater than zero!") if not Balances[ao.id] then Balances[ao.id] = "0" end if msg.From == ao.id then Balances[msg.From] = tostring(bint.__add(Balances[Owner], msg.Quantity)) ao.send({ Target = msg.From, Data = Colors.gray .. "Successfully minted " .. Colors.blue .. msg.Quantity .. Colors.reset }) else ao.send({ Target = msg.From, Action = "Mint-Error", ["Message-Id"] = msg.Id, Error = "Only the Process Owner can mint new " .. Ticker .. " tokens!" }) end end)'

      await message({
        process: processId2,
        tags: [
          { name: 'Action', value: 'Eval' }
        ],
        data: luaCode,
        signer: createDataItemSigner(window.arweaveWallet),
      })
      isLoading = false
      const resultText = 'tokenProcessId: ' + processId2
      return resultText
    } catch {
      isLoading = false
      const result = 'error'
      return result
    }
  }

  return $$({
    userInfo,
    communityUser,
    communityList,
    joinedCommunities,
    currentUuid,
    chatBanuser,
    linkTwitter,
    vouch,
    banChat: banChat,
    unbanChat,
    createToken,
    getBan,
    setCurrentUuid,
    makeCommunityChat,
    getLocalCommunity,
    getCommunityList,
    addCommunity,
    updateCommunity,
    joinCommunity,
    exitCommunity,
    updateUser,
    getUser,
    getUserByAddress,
    getCommunityUser,
    getCommunity
  })
})



if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aoCommunityStore, import.meta.hot))
