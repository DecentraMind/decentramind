import type { Task } from '~/types'
import { createDataItemSigner, dryrunResultTags, message, result } from '~/utils/ao'
import { retry } from '~/utils/util'

export async function transferBounty(receiver: string, token: Task['bounties'][number]) {
  const { tokenProcessID, tokenName, quantity } = token

  if (!tokenProcessID) {
    throw new Error(`Bounty token ${tokenName} not supported.`)
  }
  console.log('sending ', tokenName, ' token processID: ', tokenProcessID)
  console.log({tokenName, amount: quantity, receiver})

  let transferTx = ''
  let mTags
  try {
    mTags = await retry({
      fn: async () => {
        const messageId = await message({
          process: tokenProcessID,
          signer: createDataItemSigner(window.arweaveWallet),
          tags: [
            { name: 'Action', value: 'Transfer' },
            { name: 'Recipient', value: receiver },
            { name: 'Quantity', value: quantity.toString() }
          ]
        })
        transferTx = messageId
        const { Messages } = await result({
          // the arweave TXID of the message
          message: messageId,
          // the arweave TXID of the process
          process: tokenProcessID,
        })
        return Messages[0].Tags as {name: string, value: string}[]
      },
      maxAttempts: 1,
      interval: 500
    })
  } catch(e) {
    if (e instanceof Error && e.message.includes('Cannot read properties of undefined')) {
      throw new Error(`Transfer token ${tokenName} failed.`)
    }
  }

  if (!mTags) {
    throw new Error('Pay bounty failed.')
  }

  let transError = false
  let errorMessage = ''
  for (let k = 0; k < mTags.length; ++k) {
    const tag = mTags[k]
    if (tag.name === 'Error') {
      errorMessage = tag.value
      transError = true
      break
    }
  }

  if (transError) {
    throw new Error('Pay bounty failed. ' + errorMessage)
  } else {
    console.info(`You have sent ${quantity} ${tokenName} to ${receiver}`)
    return {tokenProcessID, tokenName, transferTx}
  }
}

export async function getTokenInfo(tokenProcessID: string) {
  return await dryrunResultTags<{
    name: string
    ticker: string
    denomination: string
    logo: string
  }>({
    process: tokenProcessID,
    tags: [{ name: 'Action', value: 'Info' }]
  })
}

export async function amountToQuantity(amount: number, tokenProcessID: string) {
  let token = tokensByProcessID[tokenProcessID]
  if (!token) {
    const tokenInfo = await getTokenInfo(tokenProcessID)
    console.log('amountToQuantity: get tokenInfo from AO:', tokenInfo)
    token = {
      ticker: tokenInfo.ticker,
      label: tokenInfo.name,
      processID: tokenProcessID,
      denomination: Number(tokenInfo.denomination),
      logo: tokenInfo.logo
    }
  }
  return BigInt(amount * Math.pow(10, token.denomination))
}