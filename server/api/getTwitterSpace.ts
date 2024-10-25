export default eventHandler(async (event) => {
  console.log('get twitter space info')
  const { spaceId } = getQuery(event) as { spaceId?: string }
  console.log('spaceId in twtitter.ts = ' + spaceId)
  const url = 'https://api.twitter.com/2/spaces/' + spaceId + '?space.fields=speaker_ids,creator_id,participant_count,started_at,ended_at&expansions=creator_id&user.fields=created_at,profile_image_url'
  console.log('fetch from twitter api: ' + url)

  const { TWITTER_BEARER_TOKEN: token } = import.meta.env

  const response = await $fetch(url, {
    baseURL: url,
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    }
  })

  // console.log(JSON.stringify(response))
  return response
})
