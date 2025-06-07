import type { VouchData } from '~/types'
import { uniq } from 'lodash-es'
import { dryrunResultParsed } from '~/utils/ao'
import { VALID_VOUCHERS } from '~/utils/processID'

export const getVouchData = async ({address, method = 'X'}: {address: string, method?: string}): Promise<string[]> => {
  if (!address) {
    throw new Error('No address specified.')
  }
  const vouchData = await dryrunResultParsed<VouchData>({
    process: VOUCH_PROCESS_ID,
    tags: [
      { name: 'Action', value: 'Get-Vouches' },
      { name: 'ID', value: address }
    ],
    signer: createDataItemSigner(window.arweaveWallet),
  })

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
