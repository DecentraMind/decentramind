import { tokenProcessIDs } from '~/utils/constants'
import {
  createDataItemSigner,
  result,
  // results,
  message,
  // spawn,
  // monitor,
  // unmonitor,
  dryrun
} from '@permaweb/aoconnect'

import * as Othent from "@othent/kms";



declare const window: any
import type { PermissionType } from 'arconnect'

const permissions: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGNATURE',
  'SIGN_TRANSACTION',
  'DISPATCH'
]

import Arweave from 'arweave'

const arweave = Arweave.init({
  host: 'arweave.net', // 这是主网节点的 URL
  port: 443,
  protocol: 'https'
})

export const aoStore = defineStore('aoStore', () => {
  let totalBalance = $ref(0)
  const tokenMap = $ref(tokenProcessIDs)
  const processID = 'GGX1y0ISBh2UyzyjCbyJGMoujSLjosJ2ls0qcx25qVw'

  /** current connected address */
  let address = $(lsItemRef<string>('address', ''))

  let isLoginModalOpen = $ref(false)

  const tokenBalances = $ref({
    //CRED: 0,
    AOCOIN: 0,
    AR: 0,
    FIZI: 0,
    BRKTST: 0,
    TRUNK: 0,
    EXP: 0,
    ORBT: 0,
    EARTH: 0,
    FIRE: 0,
    AIR: 0,
    FIREEARTH: 0
  })
  let credBalance = $(lsItemRef('credBalance', 0))
  let aoCoinBalance = $(lsItemRef('aoCoinBalance', 0))
  const { showError } = $(notificationStore())

  const doLogin = async () => {
    if (!window.arweaveWallet) {
      console.error('Arweave Wallet no install')
      alert('Please install Arweave Wallet to continue')
      window.location.href = 'https://chromewebstore.google.com/detail/arconnect/einnioafmpimabjcddiinlhmijaionap?hl=zh'
      return false
    }
    try {
      await window.arweaveWallet.connect(permissions)
    } catch (error) {
      return false
    }
    try {
      address = await window.arweaveWallet.getActiveAddress()
      const result = await message({
        process: processID,
        tags: [
          { name: 'Action', value: 'registInfo' },
          { name: 'userAddress', value: address }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      })
      return result

      //await init()
    } catch (error) {
      console.error(error)
    }
  }

  const othentLogin = async () => {

    if (typeof window !== 'undefined') {
      try {
        const OthentModule = await import("@othent/kms")
        const res = await OthentModule.connect()
        if (OthentModule) {
          window.arweaveWallet = OthentModule
          // 使用 address 进行后续操作
        } else {
          console.error('Othent is not defined in the module')
        }
      } catch (error) {
        console.error('An error occurred:', error)
      }
    } else {
      console.log('Running on server side, connect() is not available')
    }

    try {
      address = await window.arweaveWallet.getActiveAddress()

      const result = await message({
        process: processID,
        tags: [
          { name: 'Action', value: 'registInfo' },
          { name: 'userAddress', value: address }
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      })
      const success = 'success'
      return success

      //await init()
    } catch (error) {
      console.error(error)
    }
  }

  const doLogout = async () => {
    await window.arweaveWallet.disconnect()
    address = ''
    credBalance = 0
    aoCoinBalance = 0
  }

  const getBalance = async (process: string) => {
    if (tokenMap[process]) {
      process = tokenMap[process]
    }
    let rz = await message({
      process,
      tags: [
        { name: 'Action', value: 'Balance' },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    })

    try {
      rz = await result({
        message: rz,
        process,
      })
      rz = useGet(useGet(rz, 'Messages[0].Tags').find(tag => tag.name === 'Balance'), 'value', '0')
      totalBalance = Object.values(tokenBalances).reduce((acc, curr) => acc + curr, 0)

      return parseFloat(rz)
    } catch (err) {
      console.log(`====> err :`, err)
    }

    return 0
  }

  const getData = async ({ process, Action }, tagFilters) => {
    if (tokenMap[process]) {
      process = tokenMap[process]
    }
    let rz = await dryrun({
      process,
      tags: [
        { name: 'Action', value: Action },
      ],
    })
    try {
      rz = rz.Messages.filter(msg => {
        const hasMatchTag = msg.Tags.filter(tag => {
          if (tagFilters[tag.name]) {
            return tag.value == tagFilters[tag.name]
          }
          return false
        })
        return hasMatchTag.length === Object.keys(tagFilters).length
      })
      rz = JSON.parse(useGet(rz, '[0].Data'))
    } catch (err) {
      console.log(`====> err :`, err, rz)
    }

    return rz
  }

  const sendToken = async (process, recipient, amount, tags = []) => {
    if (!address) {
      await doLogin()
    }

    if (tokenMap[process]) {
      process = tokenMap[process]
    }

    if (amount <= 0) {
      showError(`amount can not be zero`)
      return false
    }

    amount = (parseFloat(amount) * 1000).toString()

    let rz = await message({
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
      rz = await result({
        message: rz,
        process,
      })
      const error = useGet(rz, 'Messages[0].Tags').find((tag: Tag) => tag.name === 'Error')
      if (error) {
        showError(error.value)
        return false
      }
      rz = useGet(rz, 'Messages[0].Tags').find((tag: Tag) => tag.name === 'Action').value
      if (rz === "Debit-Notice") {
        return true
      }
    } catch (err) {
      console.log(`====> err :`, err)
      showError(err.toString())
    }
    return false
  }

  const init = async () => {
    if (!address) return
    //tokenBalances.CRED = (await getBalance('CRED')) / 1e12
    tokenBalances.AOCOIN = (await getBalance('AOCoin')) / 1e12
    tokenBalances.AR = (await getBalance('AR'))
    tokenBalances.FIZI = (await getBalance('FIZI')) / 1e12
    tokenBalances.BRKTST = (await getBalance('BRKTST')) / 1e12
    tokenBalances.TRUNK = (await getBalance('TRUNK')) / 1e12
    tokenBalances.EXP = (await getBalance('EXP')) / 1e12
    tokenBalances.ORBT = (await getBalance('ORBT')) / 1e12
    tokenBalances.EARTH = (await getBalance('EARTH')) / 1e12
    tokenBalances.FIRE = (await getBalance('FIRE')) / 1e12
    tokenBalances.AIR = (await getBalance('AIR')) / 1e12
    tokenBalances.FIREEARTH = (await getBalance('FIREEARTH')) / 1e12
    totalBalance = Object.values(tokenBalances).reduce((acc, curr) => acc + curr, 0)


  }

  const getarbalance = async () => {
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

  return $$({ tokenMap, tokenBalances, totalBalance, getData, address, credBalance, aoCoinBalance, sendToken, init, doLogout, othentLogin, doLogin, getarbalance, isLoginModalOpen })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(aoStore, import.meta.hot))

