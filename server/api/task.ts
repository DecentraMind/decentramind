import type { Tasks, UserStatus } from '~/types'

const tasks: Tasks[] = [{
  id: 1,
  name: '卖辣椒',
  from: 'xDAO',
  balance: '11U',
  status: 'subscribed',
  location: 'Berlin, Germany'
}, {
  id: 2,
  name: '卖辣椒',
  from: 'xDAO',
  balance: '11U',
  status: 'subscribed',
  location: 'Berlin, Germany'
}, {
  id: 3,
  name: '卖辣椒',
  from: 'xDAO',
  balance: '11U',
  status: 'subscribed',
  location: 'Berlin, Germany'
}]

export default eventHandler(async (event) => {
  const { q, statuses, locations, sort, order } = getQuery(event) as { q?: string, statuses?: UserStatus[], locations?: string[], sort?: 'name' | 'email', order?: 'asc' | 'desc' }

  await new Promise(function (resolve) {
    setTimeout(resolve, 1000)
  })

  return tasks.filter((user) => {
    if (!q) return true

    return user.name.search(new RegExp(q, 'i')) !== -1 || user.balance.search(new RegExp(q, 'i')) !== -1
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
