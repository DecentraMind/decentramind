import {
    createDataItemSigner,
    result,
    message,
    dryrun
  } from '@permaweb/aoconnect'
  

  export const taskStore = defineStore('taskStore', () => {
    const createTask = async (process: string, data: any, action: string) => {
        try {
            const messageId = await message({
                process: process,
                signer: createDataItemSigner(window.arweaveWallet),
                tags: [{name: 'Action', value: action}],
                data: JSON.stringify(data)
            });
    
            console.log("messageId:", messageId)
            return messageId;
        }catch(error){
            console.log("messageToAo -> error:", error)
            return '';
        }
    }

    const getAllTasks = async (process: string, action: string) => {
        let res;
        try {
            res = await dryrun({
                process: process,
                tags: [{name: 'Action', value: action}],
            });
        }catch(error){
            console.log("messageToAo -> error:", error)
            return '';
        }
        let resp = res.Messages[0].Data;

        return JSON.parse(resp);
    }

    return $$({ createTask, getAllTasks })
  })