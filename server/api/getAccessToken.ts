export default eventHandler(async (event) => {

  const { code } = getQuery(event) as { code?: string }
  const getAccessTokenUrl = 'https://api.twitter.com/2/oauth2/token?code=' + code + '&grant_type=authorization_code&client_id=ZkJXajNiRUdwanFQTkZOenZBUzA6MTpjaQ&redirect_uri=https://decentramind.club/callback&code_verifier=test'

  try {
    const response = await $fetch(getAccessTokenUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response
  } catch (error) {
    return error
  }
})
