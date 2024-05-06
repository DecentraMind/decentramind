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


const { address, getActiveAddress } = $(arweaveWalletStore())

export const aocommunityStore = defineStore('aocommunityStore', () => {
    const cCache = $ref({})
    const processID = 'GGX1y0ISBh2UyzyjCbyJGMoujSLjosJ2ls0qcx25qVw'

    //创建社区方法
    const addCommunity = async (Name, Inbro, Twitter, Website, Whitebook, Allreward) => {
        
        const uuid = uuidtest()

        let cSubmitL = [
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
        const jsonString = JSON.stringify(cSubmitL);

        let createCommunity = await message({
            process: processID,
            tags: [
                { name: 'Action', value: 'add'}
            ],
            signer: createDataItemSigner(window.arweaveWallet),
            data: jsonString,
        });
    }

    //获取社区列表方法
    const getCommunitylist = async () => {
        await getActiveAddress()
        let result = await dryrun({
            process: processID,
            tags: [
                { name: 'Action', value: 'communitylist' },
                { name: 'userAddress', value: address }
            ],
        });
        return result
    }

    //获取已加入得社区列表
    const getCommunityjoined = async () => {
        await getActiveAddress()
        let result = await dryrun({
            process: processID,
            tags: [
                { name: 'Action', value: 'communitylistjoined' },
                { name: 'userAddress', value: address }
            ],
        })
        return result
    }

    //获取指定社区信息
    const getCommunityInfo = async ( uuid ) => {
        let result = await dryrun({
            process: processID,
            tags: [
                { name: 'Action', value: 'communityInfo' },
                { name: 'uuid', value: uuid}
            ]
        })
        return result
    }

    //加入社区方法
    const joinCommunity = async ( uuid ) => {
        await getActiveAddress()
        let join = await message({
            process: processID,
            tags: [
                { name: 'Action', value: 'join'},
                { name: 'userAddress', value: address}
            ],
            signer: createDataItemSigner(window.arweaveWallet),
            data: uuid,
        });
        return join
    }

    //修改个人信息
    const personalInfo = async ( username, twitter, mail, phone ) => {
        await getActiveAddress()
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
        return Info
    }

    //获取个人信息
    const getInfo = async () => {
        await getActiveAddress()
        let Info = await dryrun({
            process: processID,
            tags: [
                { name: 'Action', value: 'getInfo' },
                { name: 'userAddress', value: address }
            ]
        })
        return Info
    }

    return $$({ getCommunitylist, addCommunity, joinCommunity, personalInfo, getInfo, getCommunityjoined, getCommunityInfo })
})


if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(aocommunityStore, import.meta.hot))