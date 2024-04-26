import {
    createDataItemSigner,
    result,
    message,
    dryrun
  } from '@permaweb/aoconnect'
  
  let processId = 'Hjb69NoUe5ClO2ZD3eVYM5gPKrS2PSYctns95kBA4Fg';

  export const taskStore = defineStore('taskStore', () => {
    const createTask = async (data: any, action: string) => {
        try {
            const messageId = await message({
                process: processId,
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