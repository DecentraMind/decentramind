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




export const aocommunity = defineStore('aocommunity', () => {
    const cCache = $ref({})
    let iscLoading = $ref(false)
    const processID = 'GGX1y0ISBh2UyzyjCbyJGMoujSLjosJ2ls0qcx25qVw'
    console.log("goood1")



    //创建社区方法
    const addCommunity = async (dataT) => {
        
        let add = await message({
            process: processID,
            tags: [{ name: 'Action', value: 'add'}],
            signer: createDataItemSigner(window.arweaveWallet),
            data: dataT,
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
            ],
        });
        console.log(result)
        console.log("goood2")
        return result
    }

    //加入社区方法
    const joinCommunity = async( community ) => {
        let join = await message({
            process: processID,
            tags: [{ name: 'Action', value: 'join'}],
            signer: createDataItemSigner(window.arweaveWallet),
            data: community,
        });
        console.log("goood2")
        console.log(join)
    }

    return $$({ getCommunity, addCommunity, joinCommunity })
})


if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(aocommunity, import.meta.hot))