import type {
  AllSubmissionWithCalculatedBounties,
  Task
} from '~/types'
import { DM_BOUNTY_CHARGE_PERCENT, tokensByProcessID } from '~/utils/constants'
import { float2BigInt } from '~/utils/int'
import { cloneDeep } from 'lodash-es'

export function calcBounties(submission: AllSubmissionWithCalculatedBounties, selectedTotalScore: number, selectedSubmissionsLength: number, taskBounties: Task['bounties']) {
  const { score, address } = submission

  if (score > selectedTotalScore) {
    throw new Error('Submission\'s score can not greater than selected total score.')
  }

  return cloneDeep(taskBounties).map((bounty) => {
    if (!bounty.tokenProcessID) return

    const token = tokensByProcessID[bounty.tokenProcessID]
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

    let amountToSend = 0
    if (selectedTotalScore > 0) {
      amountToSend = (score / selectedTotalScore * taskBounty.amount * (1 - DM_BOUNTY_CHARGE_PERCENT/100))
    } else {
      // if selectedTotalScore is 0, then split the bounty to all submissions equally
      amountToSend = taskBounty.amount * (1 - DM_BOUNTY_CHARGE_PERCENT/100) / selectedSubmissionsLength
    }
    bounty.quantity = float2BigInt(Number(amountToSend.toFixed(denomination-1)), denomination)
    bounty.amount = amountToSend

    console.log(`calculating: ${address} should receive ${label} ${bounty.amount} ${bounty.quantity}`)
    return bounty
  })
}