import {
  createDataItemSigner,
  result,
  results,
  message,
  spawn,
  monitor,
  unmonitor,
  dryrun
} from '@permaweb/aoconnect'
import type { CommunitySetting, TradePlatform } from '~/types'
import type { TokenName, CommunityToken, TokenSupply } from '~/utils/constants'
import { createUuid } from '~/utils/util'
import { aoCommunityProcessID } from '~/utils/processID'

export type CommunityListItem = {
  uuid: string
  logo: string
  banner: string
  name: string
  desc: string
  website: string
  twitter: string
  whitebook: string
  github: string
  buildnum: string
  bounty: TokenName[]
  ispublished: boolean
  communitytoken: CommunityToken[]
  istradable: boolean
  support: TradePlatform[]
  alltoken: string
  tokensupply: TokenSupply[]
  creater: string
  communitychatid: string
  timestamp: string
  isJoined?: boolean
  joinTime?: string
}
export type CommunityList = CommunityListItem[]


// Read the Lua file
//const luaCode = fs.readFileSync('./AO/chat.lua', 'utf8')

export const aoCommunityStore = defineStore('aoCommunityStore', () => {
  const { address } = $(aoStore())
  let communityList = $ref<CommunityList>([])
  let userInfo = $ref({})
  let communityUser = $ref({})
  let joinedCommunities = $ref<CommunityList>({})
  let chatBanuser = $ref({})
  let isLoading = $ref(false)
  let isJoining = $ref(false)
  let isExiting = $ref(false)
  let currentUuid = $ref('')

  let githubCode = $ref()
  const Sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  //Set the uuid of the currently selected community
  const setCurrentUuid = (uuid: any) => {
    currentUuid = uuid
  }

  //
  const vouch = async () => {
    fetch('https://api.vouchdao.org/vouches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: '8Ys7hXzLXIk4iJvaCzYSeuoCcDjXF0JBQZSRfiktwfw'
      })
    })
      .then(response => response.json())
      .then(data => {
        // analysis and get the Twitter ID
        data.vouches.forEach(a => {
          console.log('-test')
          console.log(a)
          if (a.method === 'twitter') {
            console.log('Twitter ID:', a.identifier)
          }
        })
      })


    // let result2 = await message({
    //   process: 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo',
    //   tags: [
    //     { name: 'Action', value: 'Get-Vouches' },
    //     { name: 'ID', value: address }
    //   ],
    //   signer: createDataItemSigner(window.arweaveWallet),
    // });
    // const res = await result({
    //   message: result2,
    //   process: 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo'
    // })
    // console.log(res)
    // console.log(result2)
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

  //User registration method
  const registerInfo = async () => {
    if (isLoading) return
    isLoading = true

    await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'registInfo' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })
    isLoading = false
  }
  //Creating a community approach
  const addCommunity = async (
    logo,
    Banner,
    Name,
    Inbro,
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

    const communitySubmitList = [{
      logo: logo,
      banner: Banner,
      name: Name,
      desc: Inbro,
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
    }]
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
  const settingCommunity = async (
    setting: CommunitySetting,
    bounty: string[], // token 类型
    communityToken: CommunityToken[], // 社区 token 分配比例
    support: string[], // 交易的平台
    tokenSupply: TokenSupply[], /** 社区 token 分配比例详情 */
  ) => {
    if (isLoading) return
    isLoading = true

    const { logoBase64Data: logo, banner, name, inbro, creator, owner, website, twitter, github, builderNum, isPublished, isTradable, allToken, communityChatID, time } = setting
    const communitySubmitList = [{
      logo,
      banner,
      name,
      desc: inbro,
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
      uuid: currentUuid,
      timestamp: time,
      communitychatid: communityChatID
    }]
    const jsonString = JSON.stringify(communitySubmitList)
    await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'communitysetting' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    })
    isLoading = false
  }

  //Get community list method (which generates a community table, and a joined community table)
  const getCommunityList = async () => {
    //if (isLoading) return
    //isLoading = true
    if (address !== '') {
      const result = await dryrun({
        process: aoCommunityProcessID,
        tags: [
          { name: 'Action', value: 'communitylist' },
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
          { name: 'Action', value: 'communitylist' }
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

  const updateCommunity = async (uuid: string, joinStatus: 'join'|'exit') => {
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
      console.log(communityUser)
      for (let key of communityUser) {
        if (communityUser.hasOwnProperty(key)) {
          try {
            // 解析每个键的JSON字符串
            communityUser[key] = JSON.parse(communityUser[key])
          } catch (e) {
            console.error(`Failed to parse JSON for key ${key}:`, e)
          }
        }
      }
    }
    isLoading = false
    return result
  }

  //Get a list of communities you've joined
  const getJoinedCommunities = async () => {
    if (isLoading) return
    isLoading = true

    const result = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'communitylistjoined' },
        { name: 'userAddress', value: address }
      ],
    })
    isLoading = false
    return result
  }

  //Getting information about a specific community from a cached community list
  const getLocalCommunity = async (uuid: any) => {
    if (!communityList || !communityList.length) {
      await getCommunityList()
    }

    const communityInfo = communityList.find(community => community.uuid === uuid)
    return communityInfo
  }

  //Getting information about a specific community
  const getCommunityInfo = async (uuid: any) => {
    if (isLoading) return
    isLoading = true

    const result = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'communityInfo' },
        { name: 'uuid', value: uuid }
      ]
    })
    isLoading = false
    return result
  }

  //How to join the community
  const joinCommunity = async (uuid: string, invite: string) => {
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
          { name: 'invite', value: invite },
          { name: 'time', value: time.toString() }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
        data: uuid,
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
    if (isExiting) return
    isExiting = true
    const exit = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'exit' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: uuid,
    })
    isExiting = false
    return exit
  }

  //Modification of personal information
  const updateUser = async (avatar, username, twitter, showtwitter, mail, showmail, phone, showphone, github) => {
    //if (isLoading) return
    //isLoading = true
    const personal = [
      {
        avatar: avatar,
        name: username,
        twitter: twitter,
        showtwitter: showtwitter,
        mail: mail,
        showmail: showmail,
        phone: phone,
        showphone: showphone,
        github: github,
      }
    ]
    const jsonString = JSON.stringify(personal)
    const user = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'personalInfo' },
        { name: 'userAddress', value: address }
      ],
      data: jsonString,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    isLoading = false
    return user
  }

  //Modification of personal github information
  const personalGithub = async (avatar, username, twitter, showtwitter, mail, showmail, phone, showphone, github) => {
    //if (isLoading) return
    //isLoading = true
    const personal = [
      {
        avatar: avatar,
        name: username,
        twitter: twitter,
        showtwitter: showtwitter,
        mail: mail,
        showmail: showmail,
        phone: phone,
        showphone: showphone,
        github: github,
      }
    ]
    const jsonString = JSON.stringify(personal)
    const userWithGitHub = await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'personalInfo' },
        { name: 'userAddress', value: address },
        { name: 'github', value: 'yes' }
      ],
      data: jsonString,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    isLoading = false
    return userWithGitHub
  }

  //Obtaining Personal Information
  const getUser = async () => {
    if (isLoading) return
    isLoading = true
    const user = await dryrun({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'getInfo' },
        { name: 'userAddress', value: address }
      ]
    })

    if (!user.Messages) {
      console.error('get user info failed', user)
    }

    // Check if you have successfully obtained the Info
    const jsonData = user.Messages[0].Data
    const jsonObjects = jsonData.match(/\{.*?\}/g)
    const infoJson = jsonObjects.map(item => JSON.parse(item))
    userInfo = infoJson

    isLoading = false
    return user
  }

  //Create a community chat room
  const makeCommunityChat = async () => {
    const processId2 = await spawn({
      module: '5l00H2S0RuPYe-V5GAI-1RgQEHFInSMr20E-3RNXJ_U',
      scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
      signer: createDataItemSigner(window.arweaveWallet),
    })
    await Sleep(2000)
    const luaCode = 'Handlers.add(    "inboxCount",    Handlers.utils.hasMatchingTag("Action", "#Inbox"),    function (msg)      local inboxCount = #Inbox      ao.send({      Target = msg.From,      Tags = {      InboxCount = tostring(inboxCount)      }      })      Handlers.utils.reply("Echo back")(msg)    end  )      Handlers.add(    "inboxMessage",    Handlers.utils.hasMatchingTag("Action", "CheckInbox"),    function (msg)      local index = tonumber(msg.Tags.Index)      if index and index > 0 and index <= #Inbox then      local message = Inbox[index]      ao.send({      Target = msg.From,      Tags = {      Action = "Inbox",      Index = tostring(index),      MessageDetails = message      }      }) else      ao.send({      Target = msg.From,      Tags = {      Error = "Invalid inbox message index"      }      })      end      Handlers.utils.reply("Echo back")(msg)    end  )'

    await message({
      process: processId2,
      tags: [
        { name: 'Action', value: 'Eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    return processId2
  }
  return $$({
    userInfo,
    githubCode,
    communityUser,
    communityList,
    joinedCommunities,
    currentUuid,
    chatBanuser,
    vouch,
    banChat: banChat,
    getBan,
    setCurrentUuid,
    makeCommunityChat,
    registerInfo: registerInfo,
    getLocalCommunity,
    getCommunityList,
    updateCommunity,
    addCommunity,
    settingCommunity,
    joinCommunity,
    exitCommunity,
    personalInfo: updateUser,
    personalGithub,
    getUser,
    getCommunityUser,
    getJoinedCommunities,
    getCommunityInfo
  })
})



if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aoCommunityStore, import.meta.hot))
