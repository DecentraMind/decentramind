import type { SpaceSubmissionWithCalculatedBounties, Task, TweetSubmissionWithCalculatedBounties, TweetSubmission, AllSubmissionWithCalculatedBounties } from '~/types'

export function useTaskScoreCalculate<T extends AllSubmissionWithCalculatedBounties[]>(task: Task, submissions: T) {
  switch (task.type) {
    case 'space':
      return calcSpaceScore(submissions as SpaceSubmissionWithCalculatedBounties[]) as T
    case 'promotion':
      return calcPromotionScore(submissions as TweetSubmissionWithCalculatedBounties[]) as T
    case 'bird':
      return calcBirdScore(submissions as TweetSubmissionWithCalculatedBounties[]) as T
    case 'article':
      return calcArticleScore(submissions as TweetSubmissionWithCalculatedBounties[]) as T
    default:
      throw new Error('Invalid task type.')
  }

  function calcSpaceScore(submissions: SpaceSubmissionWithCalculatedBounties[]) {
    const clone = useCloneDeep(submissions)
    const maxInviteCount = Math.max(...clone.map(item => item.inviteCount))
    const maxAudience = Math.max(...clone.map(item => item.audience))
  
    for (const submission of clone) {
      if (submission.validateStatus && ['invalid', 'validation_error'].includes(submission.validateStatus)) {
        submission.score = 0
        continue
      }
      let friendScore = 0
      if (maxInviteCount != 0) {
        friendScore = (submission.inviteCount / maxInviteCount) * 40
      }
  
      let audienceScore = 0
      if (maxAudience != 0) {
        audienceScore = (submission.audience / maxAudience) * 50
      }
  
      let brandScore = 0
      if (submission.brandEffect === 10) {
        brandScore = 10
      }
  
      console.log({friendScore, audienceScore, brandScore})
      submission.score = friendScore + audienceScore + brandScore
    }
    return clone
  }

  function calcTweetScore(
    submissions: TweetSubmissionWithCalculatedBounties[],
    portion: Record<keyof Pick<TweetSubmission, 'buzz' | 'discuss' | 'identify' | 'popularity' | 'spread' | 'friends'>, number>
  ) {
    const clone = useCloneDeep(submissions)
    clone.forEach(item => {
      item.score = 0
    })

    for (const field in portion) {
      const fieldKey = field as keyof typeof portion
      const fieldPortion = portion[fieldKey]
      const max = Math.max(...clone.map(item => item[fieldKey]))
      if (max != 0) {
        clone.forEach(item => {
          if (item.validateStatus && ['invalid', 'validation_error'].includes(item.validateStatus)) {
            item.score = 0
          } else {
            item.score += (item[fieldKey] / max) * fieldPortion
          }
          console.log('score of ', item.address, fieldKey, {score: item.score})
        })
      }
    }

    return clone
  }

  function calcPromotionScore(submissions: TweetSubmissionWithCalculatedBounties[]) {
    return calcTweetScore(submissions, {
      buzz: 10,
      discuss: 10,
      identify: 10,
      popularity: 10,
      spread: 20,
      friends: 40,
    })
  }

  function calcBirdScore(submissions: TweetSubmissionWithCalculatedBounties[]) {
    return calcTweetScore(submissions, {
      buzz: 10,
      discuss: 10,
      identify: 10,
      popularity: 10,
      spread: 20,
      friends: 40,
    })
  }

  function calcArticleScore(submissions: TweetSubmissionWithCalculatedBounties[]) {
    return calcTweetScore(submissions, {
      buzz: 10,
      discuss: 10,
      identify: 10,
      popularity: 10,
      spread: 20,
      friends: 40,
    })
  }
}