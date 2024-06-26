

export default eventHandler(async (event) => {
  const { accessToken } = getQuery(event) as { accessToken?: string }
  const getUserIdUrl = 'https://api.twitter.com/2/users/me?user.fields=name'
  const getUserIdToken = 'Bearer ' + accessToken
  try {
    // const getUserIdToken = 'Bearer ' + accessToken
    const res = await $fetch(getUserIdUrl, {
      method: 'get',
      headers: {
        'Authorization': getUserIdToken
      }
    })
    return res
  } catch (error) {
    return getUserIdToken + error
  }
})
