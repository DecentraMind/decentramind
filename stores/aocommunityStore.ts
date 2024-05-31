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

import fs from 'fs'

const { address } = $(aoStore())

// Read the Lua file
//const luaCode = fs.readFileSync('./AO/chat.lua', 'utf8')

export const aocommunityStore = defineStore('aocommunityStore', () => {
  const processID = 'jl0nyTKNDHPVMoE3DlaHiBnn8Ltoz-x0zJ2Qytag9qU'
  let communityList = $ref({})
  let userInfo = $ref({})
  let joincommunityList = $ref({})
  let isLoading = $ref(false)
  let currentUuid = $ref('')
  let communityCreate = $ref(false)

  //设置当前选中社区的uuid
  const setCurrentuuid = (uuid: any) => {
    currentUuid = uuid
  }

  //用户注册方法
  const registInfo = async () => {
    if (isLoading) return
    isLoading = true

    let result = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'registInfo' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    });
    isLoading = false
  }
  //创建社区方法
  const addCommunity = async (
    logo,
    Banner,
    Name,
    Inbro,
    Website,
    ShowWebsite,
    Twitter,
    ShowTwitter,
    Whitebook,
    ShowWhitebook,
    Github,
    ShowGithub,
    ShowBuildnum,
    ShowAllreward,
    Bounty,
    ShowBounty,
    ShowDetail,
    Ispublished,
    CommunityToken,
    IsTradable,
    Support,
    ShowAlltoken,
    AllToken,
    TokenSupply
  ) => {
    if (isLoading) return
    isLoading = true

    const uuid = createuuid()

    let communitySubmitList = [
      {
        "logo": logo,
        "banner": Banner,
        "name": Name,
        "desc": Inbro,
        "creater": address,
        "website": Website,
        "showwebsite": ShowWebsite,
        "twitter": Twitter,
        "showtwitter": ShowTwitter,
        "whitebook": Whitebook,
        "showwhitebook": ShowWhitebook,
        "github": Github,
        "showgithub": ShowGithub,
        "buildnum": 0,
        "showbuildnum": ShowBuildnum,
        "showallreward": ShowAllreward,
        "bounty": Bounty,
        "showbounty": ShowBounty,
        "showdetail": ShowDetail,
        "ispublished": Ispublished,
        "communitytoken": CommunityToken,
        "istradable": IsTradable,
        "support": Support,
        "showalltoken": ShowAlltoken,
        "alltoken": AllToken,
        "tokensupply": TokenSupply,
        "uuid": uuid,
      }
    ]
    const jsonString = JSON.stringify(communitySubmitList);
    console.log("---------nonono")
    console.log(jsonString)
    let createCommunity = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'add' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    });
    isLoading = false
  }

  //创建社区方法
  const settingCommunity = async (
    logo,
    Banner,
    Name,
    Inbro,
    Website,
    ShowWebsite,
    Twitter,
    ShowTwitter,
    Whitebook,
    ShowWhitebook,
    Github,
    ShowGithub,
    Buildnum,
    ShowBuildnum,
    ShowAllreward,
    Bounty,
    ShowBounty,
    ShowDetail,
    Ispublished,
    CommunityToken,
    IsTradable,
    Support,
    ShowAlltoken,
    AllToken,
    TokenSupply
  ) => {
    if (isLoading) return
    isLoading = true

    const uuid = createuuid()

    let communitySubmitList = [
      {
        "logo": logo,
        "banner": Banner,
        "name": Name,
        "desc": Inbro,
        "creater": address,
        "owner": address,
        "website": Website,
        "showwebsite": ShowWebsite,
        "twitter": Twitter,
        "showtwitter": ShowTwitter,
        "whitebook": Whitebook,
        "showwhitebook": ShowWhitebook,
        "github": Github,
        "showgithub": ShowGithub,
        "buildnum": Buildnum,
        "showbuildnum": ShowBuildnum,
        "showallreward": ShowAllreward,
        "bounty": Bounty,
        "showbounty": ShowBounty,
        "showdetail": ShowDetail,
        "ispublished": Ispublished,
        "communitytoken": CommunityToken,
        "istradable": IsTradable,
        "support": Support,
        "showalltoken": ShowAlltoken,
        "alltoken": AllToken,
        "tokensupply": TokenSupply,
        "uuid": currentUuid,
      }
    ]
    const jsonString = JSON.stringify(communitySubmitList);
    console.log("---------nonono")
    console.log(jsonString)
    let settingCommunity = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'communitysetting' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: jsonString,
    });
    console.log(settingCommunity)
    isLoading = false
  }

  //获取社区列表方法(会产生社区表，以及一个加入了的社区表)
  const getCommunitylist = async () => {
    //if (isLoading) return
    //isLoading = true
    if (address !== '') {
      let result = await dryrun({
        process: processID,
        tags: [
          { name: 'Action', value: 'communitylist' },
          { name: 'userAddress', value: address }
        ],
      });
      console.log('--------------------11', result)
      console.log()
      const jsonData = result.Messages[0].Data;
      communityList = JSON.parse(jsonData); // Parse the main JSON data

      // Iterate through each object and parse nested JSON strings
      communityList = communityList.map((item) => {
        if (item.communitytoken && typeof item.communitytoken === 'string') {
          try {
            item.communitytoken = JSON.parse(item.communitytoken);
          } catch (e) {
            console.error('Failed to parse communitytoken:', e, item.communitytoken);
          }
        }
        return item;
      });

      joincommunityList = communityList.filter((item) => item.isJoined === true);
      console.log("-----------", joincommunityList)
      isLoading = false
      return result
    } else {
      let result = await dryrun({
        process: processID,
        tags: [
          { name: 'Action', value: 'communitylist' }
        ],
      });
      const jsonData = result.Messages[0].Data // 获取原始的 JSON 字符串
      const jsonObjects = jsonData.match(/\{.*?\}/g) // 使用正则表达式匹配字符串中的 JSON 对象
      communityList = jsonObjects.map((item: any) => JSON.parse(item)) // 解析每个 JSON 对象并存储到数组中
      joincommunityList = jsonObjects
        .map((item: any) => JSON.parse(item))
        .filter((item: any) => item.isJoined === true);
      console.log("------------------", result)
      isLoading = false
      return result
    }
  }

  //获取已加入得社区列表
  const getCommunityjoined = async () => {
    if (isLoading) return
    isLoading = true

    let result = await dryrun({
      process: processID,
      tags: [
        { name: 'Action', value: 'communitylistjoined' },
        { name: 'userAddress', value: address }
      ],
    })
    isLoading = false
    return result
  }

  //通过缓存的社区list来获取指定社区信息
  const getLocalcommunityInfo = async (uuid: any) => {
    console.log(uuid)
    //if (isLoading) return
    //isLoading = true

    const communityInfo = communityList.find(community => community.uuid === uuid);
    console.log(uuid)
    console.log("--------nnn:", communityInfo)
    return communityInfo
  }

  //获取指定社区信息
  const getCommunityInfo = async (uuid: any) => {
    if (isLoading) return
    isLoading = true

    let result = await dryrun({
      process: processID,
      tags: [
        { name: 'Action', value: 'communityInfo' },
        { name: 'uuid', value: uuid }
      ]
    })
    isLoading = false
    return result
  }

  //加入社区方法
  const joinCommunity = async (uuid) => {
    if (isLoading) return
    isLoading = true

    let join = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'join' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: uuid,
    });
    isLoading = false
    return join
  }

  //退出社区方法
  const exitCommunity = async (uuid) => {
    if (isLoading) return
    isLoading = true

    let exit = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'exit' },
        { name: 'userAddress', value: address }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: uuid,
    });
    isLoading = false
    return exit
  }

  //修改个人信息
  const personalInfo = async (username, twitter, mail, phone) => {
    if (isLoading) return
    isLoading = true
    let Info = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'personalInfo' },
        { name: 'userAddress', value: address },
        { name: 'username', value: username },
        { name: 'twitter', value: twitter },
        { name: 'mail', value: mail },
        { name: 'phone', value: phone }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })
    isLoading = false
    return Info
  }

  //获取个人信息
  const getInfo = async () => {
    if (isLoading) return
    isLoading = true
    let Info = await dryrun({
      process: processID,
      tags: [
        { name: 'Action', value: 'getInfo' },
        { name: 'userAddress', value: address }
      ]
    })
    // 检查是否成功获取到了 Info

    const jsonData = Info.Messages[0].Data;
    const jsonObjects = jsonData.match(/\{.*?\}/g);
    const infoJson = jsonObjects.map(item => JSON.parse(item));
    // 赋值给 userInfo
    userInfo = infoJson

    console.log(userInfo)
    isLoading = false
    return Info
  }

  //创建社区聊天室
  const makecommunityChat = async () => {
    console.log("------------------good")
    let processId2 = await spawn({
      module: '5l00H2S0RuPYe-V5GAI-1RgQEHFInSMr20E-3RNXJ_U',
      scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
      signer: createDataItemSigner(window.arweaveWallet),
    })

    const luaCode = `
    Handlers.add('inboxCount', Handlers.utils.hasMatchingTag('Action', '#Inbox'), function(msg)
      -- Assuming Inbox is an array containing the messages
      local inboxCount = #Inbox

      -- Send the inbox count as a response
      ao.send({
        Target = msg.From,
        Tags = { InboxCount = tostring(inboxCount) }
      })
    end)

    Handlers.add('inboxMessage', Handlers.utils.hasMatchingTag('Action', 'CheckInbox'), function(msg)
      -- Extract the index from the tags
      local index = tonumber(msg.Tags.Index)

      -- Check if the index is valid and within the range of the inbox messages
      if index and index > 0 and index <= #Inbox then
        -- Retrieve the message details based on the index
        local message = Inbox[index]

        -- Send the message details as a response
        ao.send({
          Target = msg.From,
          Tags = {
            Action = "Inbox",
            Index = tostring(index),
            MessageDetails = message
          }
        })
      else
        -- If the index is invalid or out of range, send an error message
        ao.send({
          Target = msg.From,
          Tags = { Error = "Invalid inbox message index" }
        })
      end
    end)
    `;
    let buildLua = await message({
      process: processID,
      tags: [
        { name: 'Action', value: 'eval' }
      ],
      data: luaCode,
      signer: createDataItemSigner(window.arweaveWallet),
    })
    console.log('gooooods', processId2)
    console.log('result', buildLua)
    return processId2
  }

  return $$({
    userInfo,
    communityList,
    joincommunityList,
    communityCreate,
    currentUuid,
    setCurrentuuid,
    makecommunityChat,
    registInfo,
    getLocalcommunityInfo,
    getCommunitylist,
    addCommunity,
    settingCommunity,
    joinCommunity,
    exitCommunity,
    personalInfo,
    getInfo,
    getCommunityjoined,
    getCommunityInfo
  })
})



if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aocommunityStore, import.meta.hot))