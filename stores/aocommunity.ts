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

export const aocommunity = defineStore('aocommunity', () => {
    const cCache = $ref({})
    let iscLoading = $ref(false)
    const processID = 'GGX1y0ISBh2UyzyjCbyJGMoujSLjosJ2ls0qcx25qVw'
    console.log("goood1")

    //创建社区方法
    const addCommunity = async (Name, Inbro, Website, Whitebook, Allreward) => {
        
        const uuid = uuidtest()

        let cSubmitL = [
            {
              "name": Name,
              "desc": Inbro,
              "website": Website,
              "whitebook": Whitebook,
              "allreward": Allreward,
              "uuid": uuid,
            }
        ]
        const jsonString = JSON.stringify(cSubmitL);

        let add = await message({
            process: processID,
            tags: [
                { name: 'Action', value: 'add'}
            ],
            signer: createDataItemSigner(window.arweaveWallet),
            data: jsonString,
        });
        console.log("goood2")
        console.log(add)
    }

    //获取社区列表方法
    const getCommunity = async () => {
        let result = await dryrun({
            process: processID,
            tags: [
                { name: 'Action', value: 'communitylist' },
                { name: 'userAddress', value: address}
            ],
        });
        console.log(result)
        console.log("goood2")
        return result
    }

    //加入社区方法
    const joinCommunity = async ( community ) => {
        await getActiveAddress()
        let join = await message({
            process: processID,
            tags: [
                { name: 'Action', value: 'join'},
                { name: 'userAddress', value: address}
            ],
            signer: createDataItemSigner(window.arweaveWallet),
            data: community,
        });
        console.log("goood2")
        console.log(join)
    }

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
        console.log("goods")
        console.log(Info)
        return Info
    }

    const getInfo = async () => {
        await getActiveAddress()
        let Info = await dryrun({
            process: processID,
            tags: [
                { name: 'Action', value: 'getInfo' },
                { name: 'userAddress', value: address }
            ]
        })
        console.log("goods")
        console.log(Info)
        return Info
    }

    return $$({ getCommunity, addCommunity, joinCommunity, personalInfo, getInfo })
})


if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(aocommunity, import.meta.hot))