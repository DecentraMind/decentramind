import { tokenProcessIDs } from '~/utils/constants'
import { defaultUserAvatar } from '~/utils/arAssets'
import { result, results, dryrun, message, createDataItemSigner } from '~/utils/ao'
import { DM_PROCESS_ID } from '~/utils/processID'
import Arweave from 'arweave'
import type { Tag } from 'arweave/node/lib/transaction'
import type { AoTag } from '~/types'
import { getVouchDataSafe } from '~/utils/user/vouch.client'

const aoCommunityProcessID = DM_PROCESS_ID

import type { PermissionType } from 'arconnect'


const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES', // wallet switch event needs this permission
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH',
  'ACCESS_PUBLIC_KEY'
]

const arweave = Arweave.init({
  host: 'arweave.net', // 这是主网节点的 URL
  port: 443,
  protocol: 'https'
})

export const aoStore = defineStore('aoStore', () => {
  const { clearCommunityData } = $(communityStore())

  const tokenMap = $ref(tokenProcessIDs)
  const isLoginModalOpen = $ref(false)
  const isVouchModalOpen = $ref(false)

  /**
   * Address currently logged in, cached in local storage.
   * If current active address(from await window.arweaveWallet.getActiveAddress())
   * is successfully logged in, this address will be updated to current active address.
   */
  let address = $(lsItemRef<string>('address', ''))

  /** if current active address is vouched */
  let twitterVouched = $ref(false)
  /** twitter handles vouched by current active address */
  let twitterVouchedIDs = $ref<string[]>([])
  /** redirect url after login */
  let redirectUrlAfterLogin = $ref<{
    path?: string
    query?: Record<string, string>
    hash?: string
    replace?: boolean
    force?: boolean
  }>({})

  const { showError } = $(notificationStore())

  async function addSwitchListener() {
    const onSwitch = async (e: any) => {
      console.log('onSwitch', e.detail.address, address)
      if (e.detail.address !== address) {
        console.log('Wallet switched, logout.', e.detail.address, address)
        await doLogout()
        window.removeEventListener('walletSwitch', onSwitch)
        console.log('reload page')
        reloadNuxtApp()
      }
    }
    console.log('add switch listener')
    window.addEventListener('walletSwitch', onSwitch)
  }

  async function _sendRegisterOrLoginMessage(wallet: typeof window.arweaveWallet, name: string) {
    return await message({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'RegisterUserOrLogin' },
        { name: 'Name', value: name },
        { name: 'Avatar', value: defaultUserAvatar },
      ],
      signer: createDataItemSigner(wallet)
    })
  }

  const checkPermissions = async () => {
    const allowedPermissions = await window.arweaveWallet.getPermissions() as PermissionType[]
    return allowedPermissions.some((permission) => permissions.includes(permission))
  }

  /** Wander browser extension login */
  const connectExtensionWallet = async () => {
    if (!window.arweaveWallet) {
      console.error('window.arweaveWallet not found.')
      alert('Please install Wander Wallet to continue')
      window.location.href = 'https://www.wander.app'
      return false
    }
    await window.arweaveWallet.connect(permissions)
    console.log('connected to extension wallet', await window.arweaveWallet.getActiveAddress())
    // todo: check permissions, if not all permissions are granted,
    // show text "Please grant all permissions" to let user grant all permissions
    return true
  }

  const connectOthentWallet = async () => {
    if (typeof window !== 'undefined') {
      try {
        const { Othent } = await import('@othent/kms')
        const othent = new Othent({
          appInfo: {
            name: 'DecentraMind',
            version: '1.0.0',
            env: 'production',
          },
          inject: true
        })
        await othent.connect(undefined)
        console.log('connected to othent wallet')
        return true
      } catch (error) {
        console.error(error)
        throw new Error('Failed to login through Othent.')
      }
    } else {
      console.log('Running on server side, connect() is not available')
    }
  }

  async function registerOrLogin(wallet: typeof window.arweaveWallet, name?: string) {
    const activeAddress = await wallet.getActiveAddress()

    await _sendRegisterOrLoginMessage(wallet, name || activeAddress.slice(-4))

    const item = await retry({
      fn: async () => {
        const res = await results({
          process: aoCommunityProcessID, 
          sort: 'DESC',
          limit: 10
        })
        const resultMessage = res.edges[0].node
        const targetAddress = resultMessage.Messages?.[0]?.Target

        if (targetAddress !== activeAddress) {
          console.log('no required result message, waiting for next round...', targetAddress, activeAddress)
          throw new Error('No required result message.')
        }
        return resultMessage
      },
      maxAttempts: 3,
      interval: 5000
    })
    console.log('register/login result message', item)

    const userData = extractResult(item)
    console.log('register/login result', userData, activeAddress)

    return userData
  }

  const doLogout = async () => {
    await window.arweaveWallet.disconnect()
    clearCommunityData()
    twitterVouched = false
    twitterVouchedIDs = []
    address = ''
    redirectUrlAfterLogin = {}
  }

  async function checkIsActiveWallet() {
    if (!window.arweaveWallet) {
      console.log('no wallet')
      return false
    }
    try {
      const activeAddress = await window.arweaveWallet.getActiveAddress()
      console.log('address', address)
      console.log('activeAddress', activeAddress)

      return address === activeAddress
    } catch (error) {
      console.error(error)
      return false
    }
  }


  /**
   * update vouch data of current active address
   * @returns twitterVouchedIDs string[] vouched twitter handles for this address
   * @updates twitterVouched boolean if there is at least one vouched twitter handle
   */
  const updateVouchData = async () => {
    const activeAddress = await window.arweaveWallet.getActiveAddress()
    if (!activeAddress) {
      throw new Error('No address specified.')
    }
    twitterVouchedIDs = await getVouchDataSafe(activeAddress, 'X')

    if (twitterVouchedIDs.length === 0) {
      console.log('No valid Identifiers found in Vouchers.')
      twitterVouched = false
      return []
    }
    console.log('twitterVouchedIDs:', twitterVouchedIDs)

    twitterVouched = true
    return twitterVouchedIDs
  }

  const getBalance = async (process: string) => {
    if (tokenMap[process]) {
      process = tokenMap[process]
    }
    const messageId = await message({
      process,
      tags: [
        { name: 'Action', value: 'Balance' },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })

    try {
      const res = await result({
        message: messageId,
        process,
      })
      const balance = useGet(useGet(res, 'Messages[0].Tags').find((tag: AoTag) => tag.name === 'Balance'), 'value', '0')

      return parseFloat(balance)
    } catch (err) {
      console.error(err)
      throw new Error('Failed to get balance.')
    }
  }

  const getData = async ({ process, Action } : {process: string, Action: string}, tagFilters: Record<string, string>) => {
    if (tokenMap[process]) {
      process = tokenMap[process]
    }
    const res = await dryrun({
      process,
      tags: [
        { name: 'Action', value: Action },
      ],
    })
    try {
      const filteredMessages = res.Messages.filter(msg => {
        const hasMatchTag = msg.Tags.filter((tag: AoTag) => {
          if (tagFilters[tag.name]) {
            return tag.value == tagFilters[tag.name]
          }
          return false
        })
        return hasMatchTag.length === Object.keys(tagFilters).length
      })
      return JSON.parse(useGet(filteredMessages, '[0].Data'))
    } catch (err) {
      console.error(err)
      throw new Error('Failed to get data from process.')
    }
  }

  const sendToken = async (process: string, recipient: string, amount: string, tags = []) => {
    if (!address) {
      await connectExtensionWallet()
    }

    if (tokenMap[process]) {
      process = tokenMap[process]
    }

    if (parseFloat(amount) <= 0) {
      showError('amount can not be zero')
      return false
    }

    amount = (parseFloat(amount) * 1000).toString()

    const messageId = await message({
      process,
      tags: [
        ...tags,
        { name: 'Action', value: 'Transfer' },
        { name: 'Recipient', value: recipient },
        { name: 'Quantity', value: amount },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })

    try {
      const res = await result({
        message: messageId,
        process,
      })
      const error = useGet(res, 'Messages[0].Tags').find((tag: Tag) => tag.name === 'Error')
      if (error) {
        showError(error.value)
        return false
      }
      const action = useGet(res, 'Messages[0].Tags').find((tag: Tag) => tag.name === 'Action').value
      if (action === 'Debit-Notice') {
        return true
      }
    } catch (err) {
      console.error(err)
      throw new Error('Failed to send token.')
    }
    return false
  }

  const getArBalance = async () => {
    try {
      // 查询地址余额
      const balance = await arweave.wallets.getBalance(address)
      console.log('Balance (in winston):', balance)

      // 将余额从 winston 转换为 AR
      const arBalance = arweave.ar.winstonToAr(balance)
      console.log('Balance (in AR):', arBalance)
      return arBalance
    } catch (error) {
      console.log(error)
    }
  }

  return $$({ tokenMap, getData, address, sendToken, addSwitchListener, doLogout, connectOthentWallet, connectExtensionWallet, getArBalance, checkIsActiveWallet, isLoginModalOpen, isVouchModalOpen, updateVouchData, twitterVouched, twitterVouchedIDs, registerOrLogin, redirectUrlAfterLogin })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aoStore, import.meta.hot))

