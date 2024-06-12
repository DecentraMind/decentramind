
export default eventHandler(async (event) => {
  console.log('in twitter.ts')
  const {spaceId} = getQuery(event) as { spaceId?: string }
  console.log('spaceId in twtitter.ts = ' + spaceId)
  const url = 'https://api.twitter.com/2/spaces/' + spaceId + '?space.fields=creator_id,speaker_ids&expansions=creator_id&topic.fields=name'
  console.log('ask twitter url = ' + url)
  // 配置 headers

  const token = 'Bearer AAAAAAAAAAAAAAAAAAAAAG5XuAEAAAAADQWNx%2FmfyBHNT4V71rSuwhzi4z0%3DQd5oXywZLlTyPArAnUVJMD6IuaBJrTuA3339oPjomyMKl4grXN'
  // const params = {
  //   'space.fields': 'creator_id,speaker_ids',
  //   'expansions': 'creator_id',
  //   'topic.fields': 'name'
  // }

  // 配置 body (data)
  // const data = new URLSearchParams()
  // data.append('grant_type', 'client_credentials')

  // const response = await $fetch('http://localhost:8080/api/course/getSpaceById')
  const response = await $fetch(url, {
    baseURL: url,
    method: 'get',
    headers: {
      'Authorization': token
    }
  })

  // console.log(JSON.stringify(response))
  return response
})
