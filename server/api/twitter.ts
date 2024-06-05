import axios from 'axios'

export default eventHandler(async () => {
  console.log('in twitter.ts')
  const url = 'https://api.twitter.com/2/spaces/1kvJpveMAnQKE?space.fields=creator_id,speaker_ids&expansions=creator_id&topic.fields=name'

  // 配置 headers
  const headers = {
    // 'User-Agent': 'v2RecentTweetCountsJS',
    Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAG5XuAEAAAAADQWNx%2FmfyBHNT4V71rSuwhzi4z0%3DQd5oXywZLlTyPArAnUVJMD6IuaBJrTuA3339oPjomyMKl4grXN',
  }
  const token = 'AAAAAAAAAAAAAAAAAAAAAG5XuAEAAAAADQWNx%2FmfyBHNT4V71rSuwhzi4z0%3DQd5oXywZLlTyPArAnUVJMD6IuaBJrTuA3339oPjomyMKl4grXN'
  const params = {
    'space.fields': 'creator_id,speaker_ids',
    'expansions': 'creator_id',
    'topic.fields': 'name'
  }

  // 配置 body (data)
  // const data = new URLSearchParams()
  // data.append('grant_type', 'client_credentials')

  // const response = await $fetch(url, {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // })

  const response = await axios.post(url, null, { headers })
  console.log(response)
  return response
})
