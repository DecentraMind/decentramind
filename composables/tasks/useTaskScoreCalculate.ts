import type { PromotionSubmissionWithCalculatedBounties, SpaceSubmissionWithCalculatedBounties, Task, PromotionSubmission } from '~/types'

export function useTaskScoreCalculate<T extends SpaceSubmissionWithCalculatedBounties[] | PromotionSubmissionWithCalculatedBounties[]>(task: Task, submissions: T) {
  switch (task.type) {
    case 'space':
      return calcSpaceScore(submissions as SpaceSubmissionWithCalculatedBounties[]) as T
    case 'promotion':
      return calcPromotionScore(submissions as PromotionSubmissionWithCalculatedBounties[]) as T
    default:
      throw new Error('Invalid task type.')
  }

  function calcSpaceScore(submissions: SpaceSubmissionWithCalculatedBounties[]) {
    const clone = useCloneDeep(submissions)
    const maxInviteCount = Math.max(...clone.map(item => item.inviteCount))
    const maxAudience = Math.max(...clone.map(item => item.audience))
  
    for (const submission of clone) {
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

  function calcPromotionScore(submissions: PromotionSubmissionWithCalculatedBounties[]) {
    const clone = useCloneDeep(submissions)

    const portion: Record<keyof Pick<PromotionSubmission, 'buzz' | 'discuss' | 'identify' | 'popular' | 'spread' | 'friends'>, number> = {
      buzz: 10,
      discuss: 10,
      identify: 10,
      popular: 10,
      spread: 20,
      friends: 40,
    }

    for (const field in portion) {
      const fieldKey = field as keyof typeof portion
      const fieldPortion = portion[fieldKey]
      const max = Math.max(...clone.map(item => item[fieldKey]))
      if (max != 0) {
        clone.forEach(item => {
          item.score += (item[fieldKey] / max) * fieldPortion
          console.log('score of ', item.address, fieldKey, {score: item.score})
        })
      }
    }

    return clone
  }
}