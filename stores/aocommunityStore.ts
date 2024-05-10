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


const { address } = $(aoStore())

export const aocommunityStore = defineStore('aocommunityStore', () => {
  const processID = 'GGX1y0ISBh2UyzyjCbyJGMoujSLjosJ2ls0qcx25qVw'
  let communityList = $ref({})
  let joincommunityList = $ref({})
  let isLoading = $ref(false)
  let communityCreate = $ref(false)

  //用户注册方法
  const registInfo = async () => {
    if (isLoading) return
    isLoading = true
    try {
      let result = await message({
        process: processID,
        tags: [
          { name: 'Action', value: 'registInfo' },
          { name: 'userAddress', value: address }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });
      isLoading = false
    } catch (error) {
      console.error('添加社区时出错：', error)
      isLoading = false
      return error
    }
  }
  //创建社区方法
  const addCommunity = async (Name, Inbro, Twitter, Website, Whitebook, Allreward) => {
    if (isLoading) return
    isLoading = true

    const uuid = createuuid()

    let communitySubmitList = [
      {
        "name": Name,
        "desc": Inbro,
        "creater": address,
        "twitter": Twitter,
        "website": Website,
        "whitebook": Whitebook,
        "allreward": Allreward,
        "uuid": uuid,
      }
    ]
    const jsonString = JSON.stringify(communitySubmitList);
    try {
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
    } catch (error) {
      console.error('添加社区时出错:', error)
      isLoading = false;
      return error
    }
  }

  //获取社区列表方法
  const getCommunitylist = async () => {
    if (isLoading) return
    isLoading = true
    if (address !== '') {
      let result = await dryrun({
        process: processID,
        tags: [
          { name: 'Action', value: 'communitylist' },
          { name: 'userAddress', value: address }
        ],
      });
      const jsonData = result.Messages[0].Data // 获取原始的 JSON 字符串
      const jsonObjects = jsonData.match(/\{.*?\}/g) // 使用正则表达式匹配字符串中的 JSON 对象
      communityList = jsonObjects.map((item: any) => JSON.parse(item)) // 解析每个 JSON 对象并存储到数组中
      joincommunityList = jsonObjects
        .map((item: any) => JSON.parse(item))
        .filter((item: any) => item.isJoined === true);
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

  //获取指定社区信息
  const getCommunityInfo = async (uuid) => {
    if (isLoading) return
    isLoading = true
    try {
      let result = await dryrun({
        process: processID,
        tags: [
          { name: 'Action', value: 'communityInfo' },
          { name: 'uuid', value: uuid }
        ]
      })
      isLoading = false
      return result
    } catch (error) {
      console.error('获取社区信息时候报错:', error)
      isLoading = false
      return error
    }
  }

  //加入社区方法
  const joinCommunity = async (uuid) => {
    if (isLoading) return
    isLoading = true
    try {
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
    } catch (error) {
      console.log('加入社区时候失败：', error)
      isLoading = false
      return error
    }
  }

  //修改个人信息
  const personalInfo = async (username, twitter, mail, phone) => {
    if (isLoading) return
    isLoading = true

    try {
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
    } catch (error) {
      console.log('修改个人信息时失败：', error)
      isLoading = false
      return error
    }
  }

  //获取个人信息
  const getInfo = async () => {
    if (isLoading) return
    isLoading = true

    try {
      let Info = await dryrun({
        process: processID,
        tags: [
          { name: 'Action', value: 'getInfo' },
          { name: 'userAddress', value: address }
        ]
      })
      isLoading = false
      return Info
    } catch (error) {
      console.log('获取个人信息时失败：', error)
      isLoading = false
      return error
    }
  }

  return $$({ communityList, joincommunityList, communityCreate, registInfo, getCommunitylist, addCommunity, joinCommunity, personalInfo, getInfo, getCommunityjoined, getCommunityInfo })
})


if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aocommunityStore, import.meta.hot))