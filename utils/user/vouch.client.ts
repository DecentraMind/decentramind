import type { VouchData } from '~/types'
import { uniq } from 'lodash-es'
import { messageResult } from '~/utils/ao'
import { VALID_VOUCHERS } from '~/utils/processID'
import { GQL_ENDPOINT } from '~/utils/arwaeve/arwaeve'

export async function getVouchDataGQL(address: string, method: string = 'X') {
  if (!address) {
    throw new Error('No address specified.')
  }
  const validVouchers = VALID_VOUCHERS
    .map(voucher => `"${voucher}"`)
    .join(',')
  const gql = /* GraphQL */ `
    query {
      transactions(
        owners: [${validVouchers}],
        tags: [
          {name: "Data-Protocol", values: ["Vouch"]},
          {
            name: "Vouch-For"
            values: ["${address}"]
          }
          { name: "Method", values: "${method}" }
        ]
      ) {
        edges {
          node {
            id
            owner {
              address
              key
            }
            tags {
              name
              value
            }
          }
        }
      }
    }
  `
  // fetch from GQL_ENDPOINT
  const response = await fetch(GQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gql }),
  })
  const data = await response.json()
  console.log('vouch data from gql endpoint:', data.data)

  if (data.errors || data.errors.length > 0) {
    console.error('Error fetching vouch data from gql endpoint:', data.errors)
    throw new Error('Error fetching vouch data from gql endpoint')
  }

  if (!data.data?.transactions?.edges?.length) {
    console.log('No vouch data found.')
    return []
  }

  const twitterVouchedIDs: string[] = []
  for (const edge of data.data.transactions.edges) {
    for (const tag of edge.node.tags) {
      if (tag.name === 'Identifier') {
        twitterVouchedIDs.push(tag.value)
      }
    }
  }
  return uniq(twitterVouchedIDs)
}

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

/**
 * get vouch data from gql endpoint, if it fails, try to get it from AO
 * @returns twitterVouchedIDs string[] vouched handles for this address
 */
export const getVouchDataSafe = async (address: string, method: string = 'X'): Promise<string[]> => {
  try {
    return await getVouchDataGQL(address, method)
  } catch (_) {
    return await getVouchData(address, method)
  }
}
