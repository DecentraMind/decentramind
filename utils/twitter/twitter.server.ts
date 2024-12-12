import type { TwitterSpacesInfo, TwitterTweetInfo } from '~/types'

const { TWITTER_BEARER_TOKEN: token } = process.env
if (!token) throw new Error('Twitter token not configured')

export async function getSpaces(ids: string) {
  const url = 'https://api.twitter.com/2/spaces?ids=' + ids + '&space.fields=creator_id,host_ids,participant_count,started_at,ended_at&expansions=host_ids&user.fields=created_at,profile_image_url'
  
  console.log('fetch spaces from twitter api: ' + url)
  const data = await $fetch<TwitterSpacesInfo>(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    },
    async onResponseError({ request, response }) {
      // Log error
      console.error(
        'Fetch twitter api error:',
        request,
        response.status,
        response.body
      )
      throw new Error('Failed to fetch spaces from twitter api.')
    },
  })
  return data
}

export async function getTweets(ids: string) {
  if (!ids) {
    throw new Error('No tweet ids provided.')
  }

  const url = 'https://api.twitter.com/2/tweets?ids=' + ids + '&tweet.fields=referenced_tweets,created_at,public_metrics,note_tweet&expansions=author_id&user.fields=created_at,profile_image_url'
  
  console.log('fetch tweets from twitter api: ' + url)
  const data = await $fetch<TwitterTweetInfo>(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    },
    async onResponseError({ request, response }) {
      // Log error
      console.error(
        'Fetch twitter api error:',
        request,
        response.status,
        response.body
      )
      throw new Error('Failed to fetch tweets from twitter api.')
    },
  })
  return data
}