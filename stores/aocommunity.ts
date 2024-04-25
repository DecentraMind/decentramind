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




export const aocommunity = defineStore('cStore', () => {
    const cCache = $ref({})
    let iscLoading = $ref(false)
    const processID = 'GGX1y0ISBh2UyzyjCbyJGMoujSLjosJ2ls0qcx25qVw'

    const getCommunity = async () => {
        let result = await dryrun({
            process: processID,
            tags: [{ name: 'Action', value: 'communitylist' }],
        });
        console.log("goods")
        const dataObj = JSON.parse(result.Messages[0].Data);
        console.log(dataObj); // 打印解析后的数据对象
        console.log(result.Messages[0])
        return result
    }

    return $$({ getCommunity })
})