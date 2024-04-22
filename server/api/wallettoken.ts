import type { Wallettoken, UserStatus } from '~/types'

const Wallettoken: Wallettoken[] = [{
  id: 1,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=1'
  },
  status: 'subscribed',
  location: 'New York, USA'
}, {
  id: 2,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=2'
  },
  status: 'unsubscribed',
  location: 'London, UK'
}, {
  id: 3,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=3'
  },
  status: 'bounced',
  location: 'Paris, France'
}, {
  id: 4,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=4'
  },
  status: 'subscribed',
  location: 'Berlin, Germany'
}, {
  id: 5,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=5'
  },
  status: 'subscribed',
  location: 'Tokyo, Japan'
}, {
  id: 6,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=6'
  },
  status: 'subscribed',
  location: 'Sydney, Australia'
}, {
  id: 7,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=7'
  },
  status: 'subscribed',
  location: 'New York, USA'
}, {
  id: 8,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=8'
  },
  status: 'subscribed',
  location: 'London, UK'
}, {
  id: 9,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=9'
  },
  status: 'bounced',
  location: 'Paris, France'
}, {
  id: 10,
  token: 'USDC币名字',
  chain: 'Ethereum',
  balance: '11.111',
  balance_u: '$11.111',
  avatar: {
    src: 'https://i.pravatar.cc/128?u=10'
  },
  status: 'subscribed',
  location: 'Berlin, Germany'
}]

export default eventHandler(async (event) => {
  const { q, statuses, locations, sort, order } = getQuery(event) as { q?: string, statuses?: UserStatus[], locations?: string[], sort?: 'name' | 'email', order?: 'asc' | 'desc' }

  await new Promise(function (resolve) {
    setTimeout(resolve, 1000)
  })

  return Wallettoken.filter((user) => {
    if (!q) return true

    return user.token.search(new RegExp(q, 'i')) !== -1 || user.balance.search(new RegExp(q, 'i')) !== -1
  }).filter((user) => {
    if (!statuses?.length) return true

    return statuses.includes(user.status)
  }).filter((user) => {
    if (!locations?.length) return true

    return locations.includes(user.location)
  }).sort((a, b) => {
    if (!sort) return 0

    const aValue = a[sort]
    const bValue = b[sort]

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
})
