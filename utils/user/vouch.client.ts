import type { VouchData } from '~/types'
import { uniq } from 'lodash-es'
import { messageResult } from '~/utils/ao'

/** move this function to aoStore */
export const getVouchData = async (address: string, method: string = 'X'): Promise<string[]> => {
  if (!address) {
    throw new Error('No address specified.')
  }
  const data = await messageResult<string>({
    process: VOUCH_PROCESS_ID,
    tags: [
      { name: 'Action', value: 'Get-Vouches' },
      { name: 'ID', value: address }
    ],
    signer: createDataItemSigner(window.arweaveWallet),
  })

  const vouchData = JSON.parse(data) as VouchData

  console.log(`vouch data for ${address}:`, vouchData)
  if (vouchData['Vouches-For'] !== address) {
    console.log('You are not vouched for this address.')
    return []
  }

  // Check if Vouchers exist in the data
  if (!vouchData.Vouchers || Object.keys(vouchData.Vouchers).length === 0) {
    console.log('No Vouchers found in the data.')
    return []
  }

  // Get the Vouchers object
  const vouchers = vouchData.Vouchers

  // Get all Identifiers
  const twitterVouchedIDs = uniq(Object.entries(vouchers)
    .filter(([voucherAddress, vouchInfo]) =>
      VALID_VOUCHERS.includes(voucherAddress)
      && vouchInfo.Method === method
      && vouchInfo['Vouch-For'] === address
    )
    .map(([_, vouchInfo]) => vouchInfo.Identifier)
    .filter(identifier => identifier) // Remove any undefined or null values
  )

  if (twitterVouchedIDs.length === 0) {
    console.log('No valid Identifiers found in Vouchers.')
    return []
  }
  console.log('twitterVouchedIDs:', twitterVouchedIDs)

  return twitterVouchedIDs
}