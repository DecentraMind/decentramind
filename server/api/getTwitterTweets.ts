export default eventHandler(async (event) => {
  console.log('get twitter tweets info')
  const { ids } = getQuery(event) as { ids?: string }
  console.log('tweetId in twtitter.ts = ' + ids)
  const url = 'https://api.twitter.com/2/tweets?ids=' + ids + '&tweet.fields=referenced_tweets,created_at,public_metrics,note_tweet&expansions=author_id&user.fields=created_at,profile_image_url' //
  
  const { TWITTER_BEARER_TOKEN: token } = import.meta.env

  try{
    console.log('fetch from twitter api: ' + url)
    const data = await $fetch(url, {
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + token
      }
    })

    // console.log('get twitter tweets info = ', JSON.stringify(data))
    return data
  } catch (error) {
    console.error('get twitter tweets info error = ', error)
    return null
  }
})
