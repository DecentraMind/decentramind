import {
    createDataItemSigner,
    message,
    dryrun,
} from '@permaweb/aoconnect'
import {tasksProcessID} from '~/utils/processID'
// const { getAllTasksNoCommunity } = $(taskStore())
export default defineTask({
    meta: {
        name: "testo",
        description: "Run database migrations",
    },
    async run({ payload, context }) {
        const wallet = "{\"kty\": \"RSA\",\"e\":\"AQAB\",\"n\":\"1RQyFuGeOsed_-leats9JyWICujmPUnFamfGqfvj50uLZayp-2z-OWKCPqAS8_FksrKjnkb7PtgVkoJHlDU_Qcy1UR9uufndXttZDK3s9xZi8zydy7Ob8qMBaee4oDuR3wgSS7hJkEVw7YZdB6hcemXFkvTtAA4PLUEv1U_QXDAXg9gao1woSclwwaLKJAV_es5IoIK31FCU8qzvdHaYcPsJvMg3YvTp4Zm3u_0SWZQzeq6bk8JbU9p-WLLuZkkGAShsuSbLam5q_HWPdkuUyaMBLf2fGWpwu0dbns7X8fR9YDqpanQQc248zxkbytOCvkcarwvK4A8j4hJF3fS4_pl9BjOKLqhCpoFiGw-b4c-QeV5z3Y-p3SkcQcVRIDYy9TQsvtFvV67YieJ5JAvUe8e5y6BB9kEfpiK7eoPcf-iMQUt-sAb2VHtdUnKsSeXawceGa1wySRdP-w7ybHqGuuJkvuPo3N4eRcIe3kmYKfRlgv8snkIk954j3WVwEZt7nwL2KEILOfoWhXex3Qo45_IxebypgKuS5omRGt9qwUJLNWtdfhZqBuwVOduk2UD4SNQidx4MeH5CKMW2-oTmh7y2MWDpdLyhBDsnCcKM-ZaaVexIfZx841Zb2KYs5MdeZWZFjQ_9BG6mRT5hkbyBselBFI-MZsuzbzj7B6XyAe0\",\"d\":\"XBApxDEfSI5O-e8-2DR5q5xPt0cBk6F4Jo1IDNHEmn7Nb9S2bOeev_SMCbrn9XZq57q_bveEPpbmWzLm8mY_OpLUFITcNoZ62y0ywIO1StzlS-r40rZ7vs4nIjb4UmLql87I-OZbAna-YCIZt-FKc6fdQa2JaOiqLgdoP2YIxIwS3OhWOhbrYVYj3cYUSJQHjGvsfU19V8KpWGDX5R4Ip2gPwP1Q0PS4yLy94f9qGkIqK-udVK44_3X7-R72WkNa0M1CjIzyfr3Og93XamkllClVrSVTxIt0wbYHJAqCywuz0AwIfvI-2WDb7S8QDwZsCwJ1yQPzV_OysU7r2QaPlscQhaX7_vwNH_Osn4bQj8yrajcc9ujEqsfpHNGYw5HQdF2QpV_-njLqX5e1aY8id2szbBfuJVGCDOCofEKdvWbK50h1kpk_AhRfZKzzBNw1_TcnE6hFxpdtOEEqqBYzrxDuvGCv91DHapKsuCmnAvIXaN-5tGhR8SnpOfD_4Porutgn_2DcTuWW7apMajDBHSVLO4kf6VPDedq71Tp3--kbiKpkEd5RwAmFAtWeNxMxrbLAfgORNzjjWCgf1DAmulcUkFQjmhQtM9NKyQ67dak9IHf_TWq_2f25c1bgJ9iquRX55putPBENXT_NkaWrRDJR7JAyQAGHT0bOvawL1wE\",\"p\":\"_J3n-zOIik96RNGuTiKpvh285xUVBwISlfH2h6NO7HFWVDIROwEocQbqXHibpJXfntRXu30PcldZYqiTXHWc5VjJWofs1Dn3F_SxPfIdR8ObBE4A-E3TJDr6btoXhKlw2G2UeIq7s2wI83eKh5m5WA56MFRUzIUzglKCpc4vUx_B112pDjczsH5g5BVYiMC9O1eQf_AXj4UtWm_fC2r8uvZxuvnHAGDwIwqSRk1DQaHAyOHlBGFf5hxXI11ckdbysxi3b0O6VOPTF0WhJdeDdUJqu-02Fo-W2I3sNqMdLF1Hv47BJee-BslQl46sKnE4rYkRDb1u-P97JhrhXedJvQ\",\"q\":\"1-678RT3s3KvP73H5HFP0PnjdrDIjecnStbuUBuiirSVBS6eP6N4K0MLc7sD9-XFFN9PszSGwtqvc5y_x7tdNBdQkLCBdsfVrEz0jyymo7TGO38yqx8E9urEP0u1ZnFd0I7b4MArEZxBj9gofCuHtYZF5UdqYsxFCDtZt0MeQlAsjL2kC4uONUpKP2eIsKs2VkqyaRDCSo1mv3p8LZCLRbMidKQeotvdE0aAbk_8QSX-ATcWyGqXeOpkpI5gXRC3hWA4lyrcglyZigSqKZisAdstEXmkzlB8752HB-YUezGPDZJWseMCprO1bXrA8av-u9zEBXQfv9T2lgWJvc_j8Q\",\"dp\":\"Uefc7HzD-5xTV3bo3hqtEKBRvFcAj1ojroxaU5Ymo9EHnZryLUBt3V_RoxPT2yRg8f2FSJv-4yLhL3Ta-rKDoXUNLBZAOntk21aSFTSoO7l3TIkCFYAeQnQA-Oorj-7kULgO2Jqay0zvBgmvV9IG3z8qbPsa14kkr0-TXrEgdQIp9ms-wgYx8zq2rZ0iLIzZjiERD_pHmVgj4Vu-ZNRWh0QakfYkiMHlemcWEEdC1Efe2wMrHyV3U4PC2QuPVRXtcRZFe4TpKFcJ_VStMDjVPbLAKph53gzGawZxHTH75oOEHN7rTx_5Y_fn8ovm1IgLSXDUn7DZB1DGnA9BHRI9vQ\",\"dq\":\"VB3iBOZAIB2a-1-40Nr7VtMhswjm97CGc_cKWxaI2TPDoYMpjmzl0SSK_4ho4VcW0Sy05YCexqVeF9GGPA5XHoW-kr7PkDAEotxPoL6qI7e2SVMhr9ujmXSXAnlBryiWfTpJmWIC5RdTyu9Pxh9G_IXUEJ8jaF1evvgv2N5CmV6WHDV8BCtXOJc6GT0B2KC5yB_NJHSs21H-JrVWToGyX3KLB5kvfg3cLzgVq-NoxxA_xMVrEKPFYgsdLaVxEJAEjeaP5QODZx0fis6KYy3gQ9DX26jhdKWSJd3dzkvoypzht028jAt86uey03UwWHTCBPjZO66i953EeWiq4dBsYQ\",\"qi\":\"Lx5i4odcCo78A65rC-67YdajAAKg7baCPAW4jZeOOLBXkcr8oLLWmSFC8zt7poxKzcya--jGKBIgxSbGVniC8c1RH0iG8coQux9Emw-Gja8QydwkmQucU2p9fmvyrvs0V1_skAomzazWlnJa1HjMCL-BlXBbAWLlB6XkOOIuRHGf3rAODIBlh0CoOXGDDzq4aUu-SE1d5ll0L0ulSx3LhWFkjeFWqYd7P3wynIdIoK2Ui4vyXAQ0pCPJb2drQFQVgYotfXodarvQecodw2CAVPak5A4tDrPU8m3XKKvQV-fMnyH0TttAc7_6kvoIRyaIO1CK9g6HpPEd-9nPxvt_IA\"}"
        const wJson = JSON.parse(wallet)
        let res
        try {
            res = await dryrun({
                process: tasksProcessID,
                tags: [{ name: 'Action', value: 'GetAllTasks' }],
            })
        } catch (error) {
            console.log('error = ' + error)
        }
        if (res.Messages[0].Data === 'null') {
            console.log('No quest to change status.')
            return { result: "Success" };
          }
        let resp = res.Messages[0].Data.split(';')
        // console.log('resp = ' + resp)
        let toY = []
        let toN = []
        const currentDate = new Date()
        console.log('cTime = ' + currentDate)
        for (let index = 0; index < resp.length; index++) {

            let element = JSON.parse(resp[index])
            // console.log('start = ' + element.startTime)
            // console.log('start = ' + element.isBegin)
            // console.log('end = ' + element.endTime)

            // console.log('trans communityId = ' + communityId)
            if (currentDate <= new Date(element.endTime) && currentDate >= new Date(element.startTime)) {
                toY.push(element.taskId)
            } else if (currentDate > new Date(element.endTime)) {
                toN.push(element.taskId)
            }
            // const respData = {
            //     id: element.taskId,
            //     name: element.taskName,
            //     image: element.taskLogo,
            //     description: element.taskInfo,
            //     startTime: element.startTime,
            //     endTime: element.endTime,
            //     zone: element.zone,
            //     rewardTotal: element.rewardTotal,
            //     buildNumber: element.buildNumber,
            //     taskRule: element.taskRule,
            //     reward: reward,
            //     tokenNumber: element.tokenNumber,
            //     tokenType: element.tokenType,
            //     tokenNumber1: element.tokenNumber1,
            //     tokenType1: element.tokenType1,
            //     builderNum: element.buildNumber,
            //     status: element.isBegin,
            //     joined: element.joined,
            //     ownerId: element.ownerId,
            //     communityId: element.communityId,
            //     isBegin: element.isBegin,
            //     isSettle: element.isSettle,
            //     isCal: element.isCal,
            //     processId: element.processId
            // }


        }
        for (let i = 0; i < toY.length; ++i) {
            const taskId = toY[i]
            console.log('taskId to Y: ' + taskId)
            try {
                await message({
                    process: tasksProcessID,
                    signer: createDataItemSigner(wJson),
                    tags: [{ name: 'Action', value: 'updateTaskToIng' }],
                    data: taskId
                })
            } catch (error) {
                console.log('error = ' + error)
            }
        }
        for (let i = 0; i < toN.length; ++i) {
            const taskId = toN[i]
            console.log('taskId to N: ' + taskId)
            try {
                await message({
                    process: tasksProcessID,
                    signer: createDataItemSigner(wJson),
                    tags: [{ name: 'Action', value: 'updateTaskToEnd' }],
                    data: taskId
                })
            } catch (error) {
                console.log('error = ' + error)
            }
        }
        // console.log("toY = " + toY);
        // console.log("toN = " + toN);
        return { result: "Success" };
    },
});
