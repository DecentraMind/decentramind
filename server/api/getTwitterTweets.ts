export default eventHandler(async (event) => {
  console.log('get twitter tweets info')
  const { ids } = getQuery(event) as { ids?: string }
  console.log('tweetId in twtitter.ts = ' + ids)
  const url = 'https://api.twitter.com/2/tweets?ids=' + ids + '&tweet.fields=created_at,public_metrics,note_tweet&expansions=author_id,referenced_tweets.id&user.fields=created_at,profile_image_url' //
  console.log('ask twitter url = ' + url)
  
  const { TWITTER_BEARER_TOKEN: token } = import.meta.env

  const response = await $fetch(url, {
    baseURL: url,
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    }
  })

  // console.log('get twitter tweets info = ', JSON.stringify(response))
  return response
})
