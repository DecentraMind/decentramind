import type {
  SpaceSubmissionWithCalculatedBounties,
  Task
} from '~/types'
import { DM_BOUNTY_CHARGE_PERCENT } from '~/utils/constants'

/**
 * Calculate and modify submission.score based on submission's inviteCount, audience and brandEffect
 * @param submissions 
 * @returns 
 */
export function calcScore(submissions: SpaceSubmissionWithCalculatedBounties[]) {
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

export function calcBounties(submission: SpaceSubmissionWithCalculatedBounties, selectedTotalScore: number, taskBounties: Task['bounties']) {
  const { calculatedBounties, score, address } = submission
  return useCloneDeep(calculatedBounties).map((bounty) => {
    if (!bounty.tokenName) return

    const token = tokens[bounty.tokenName as TokenName]
    if (!token) {
      throw new Error(`Bounty token ${bounty.tokenName} not supported.`)
    }
    const { label, denomination, processID } = token

    const taskBounty = taskBounties.find(taskBounty => taskBounty.tokenProcessID ===  processID)
    if (!taskBounty) {
      console.error('The shape of task.bounties and calculatedBounties may not match.', {taskBounties, submissionBounty: bounty})
      throw new Error('Failed to calculate submission\'s bounty.')
    }
    // console.log(`${label} total bounty: ${taskBounty.amount} ${taskBounty.quantity}`)

    // don't use bountyToSend.toFixed here, otherwise the total amount will be rounded incorrectly
    // Instead, we multiply by 10000 to shift the decimal point, then floor to remove fractional part, and finally divide by 10000 to get the correct decimal value
    const amountToSend = (score / selectedTotalScore * taskBounty.amount * (1 - DM_BOUNTY_CHARGE_PERCENT/100))
    bounty.quantity = float2BigInt(Number(amountToSend.toFixed(denomination-1)), denomination).toString()
    bounty.amount = amountToSend

    console.log(`calculating: ${address} should receive ${label} ${bounty.amount} ${bounty.quantity}`)
    return bounty
  })
}