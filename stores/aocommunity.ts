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




    const addCommunity = async () => {
        
        let add = await message({
            process: processID,
            tags: [{ name: 'Action', value: 'add'}],
            signer: createDataItemSigner(window.arweaveWallet),
        });
        console.log("goood2")
        console.log(add)
    }

    const getCommunities = async () => {
        console.log("no goods")
    }

    const getCommunity = async () => {
        let result = await dryrun({
            process: processID,
            tags: [{ name: 'Action', value: 'communitylist' }],
        });
        console.log("goood2")
        return result
    }

    return $$({ getCommunity, getCommunities, addCommunity })
})


if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(aocommunity, import.meta.hot))