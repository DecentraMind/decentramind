import { useFetch } from 'nuxt/app'

export default eventHandler(async (event) => {
  console.log('get twitter tweets info')
  const { ids } = getQuery(event) as { ids?: string }
  console.log('tweetId in twtitter.ts = ' + ids)
  const url = 'https://api.twitter.com/2/tweets?ids=' + ids + '&tweet.fields=created_at,public_metrics,note_tweet&expansions=author_id,referenced_tweets.id&user.fields=created_at,profile_image_url' //
  
  const { TWITTER_BEARER_TOKEN: token } = import.meta.env

  const { data, error } = await useFetch(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    }
  })

  if (error.value) {
    console.error('get twitter tweets info error = ', error.value)
    return null
  }

  // console.log('get twitter tweets info = ', JSON.stringify(data))
  return data
})
