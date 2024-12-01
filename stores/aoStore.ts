import { tokenProcessIDs } from '~/utils/constants'
import { defaultUserAvatar } from '~/utils/arAssets'
import { messageResultParsed, result, dryrun, message, createDataItemSigner } from '~/utils/ao'
import { DM_PROCESS_ID } from '~/utils/processID'

const aoCommunityProcessID = DM_PROCESS_ID

import type { PermissionType } from 'arconnect'

declare const window: any

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH',
  'ACCESS_PUBLIC_KEY'
]

import Arweave from 'arweave'
import type { Tag } from 'arweave/node/lib/transaction'
import type { AoTag } from '~/types'

const arweave = Arweave.init({
  host: 'arweave.net', // 这是主网节点的 URL
  port: 443,
  protocol: 'https'
})

export const aoStore = defineStore('aoStore', () => {
  const { clearCommunityData } = $(communityStore())

  const tokenMap = $ref(tokenProcessIDs)
  let isLoginModalOpen = $ref(false)
  const isVouchModalOpen = $ref(false)

  /** current connected address */
  let address = $(lsItemRef<string>('address', ''))

  const { showError } = $(notificationStore())

  async function addSwitchListener() {
    const onSwitch = async (e: any) => {
      if (e.detail.address !== address) {
        console.log('Wallet switched, logout.', e.detail.address, address)
        await doLogout()
        globalThis.removeEventListener('walletSwitch', onSwitch)
        console.log('reload page')
        reloadNuxtApp()
      }
    }
    console.log('add switch listener')
    globalThis.addEventListener('walletSwitch', onSwitch)
  }

  async function _login(wallet: typeof window.arweaveWallet) {
    const activeAddress = await wallet.getActiveAddress()
    const res = await messageResultParsed({
      process: aoCommunityProcessID,
      tags: [
        { name: 'Action', value: 'RegisterUserOrLogin' },
        { name: 'Name', value: activeAddress.slice(-4) },
        { name: 'Avatar', value: defaultUserAvatar },
      ],
      signer: createDataItemSigner(wallet),
    })
    isLoginModalOpen = false

    console.log('register/login result', res, activeAddress)
    address = activeAddress

    return res
  }

  /** ArConnect browser extension login */
  const doLogin = async () => {
    if (!window.arweaveWallet) {
      console.error('window.arweaveWallet not found.')
      alert('Please install Arweave Wallet or use Othent to continue')
      // TODO redirect to https://arconnect.io if in mobile
      window.location.href = 'https://chromewebstore.google.com/detail/arconnect/einnioafmpimabjcddiinlhmijaionap'
      return false
    }
    await window.arweaveWallet.connect(permissions)
    return await _login(window.arweaveWallet)
  }

  const othentLogin = async () => {
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
      } catch (error) {
        console.error(error)
        throw new Error('Failed to login through Othent.')
      }
    } else {
      console.log('Running on server side, connect() is not available')
    }

    return await _login(window.arweaveWallet)
  }

  const doLogout = async () => {
    await window.arweaveWallet.disconnect()
    clearCommunityData()
    address = ''
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
      await doLogin()
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

  return $$({ tokenMap, getData, address, sendToken, addSwitchListener, doLogout, othentLogin, doLogin, getArBalance, checkIsActiveWallet, isLoginModalOpen, isVouchModalOpen })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aoStore, import.meta.hot))

