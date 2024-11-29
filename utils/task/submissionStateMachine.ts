import { assign, setup } from 'xstate'

export type SubmissionStatus = 
  | 'waiting_for_validation'
  | 'validated' 
  | 'invalid'
  | 'validation_error'

export type SubmissionContext = {
  url: string
  error?: string
  taskType: 'space' | 'promotion' | 'bird' | 'article'
  validateTime?: number
  isFirstValidation: boolean
  validateError?: string
  metrics?: {
    buzz?: number
    discuss?: number 
    identify?: number
    popularity?: number
    spread?: number
    friends?: number
    score?: number
  }
}

export const submissionMachine = setup({
  types: {
    context: {} as SubmissionContext,
    events: {} as
      | { type: 'VALIDATE' }
      | { type: 'VALIDATION_SUCCESS'; metrics: SubmissionContext['metrics'] }
      | { type: 'VALIDATION_FAILED'; error: string }
      | { type: 'VALIDATION_ERROR'; error: string }
      | { type: 'UPDATE_METRICS'; metrics: SubmissionContext['metrics'] }
      | { type: 'RESUBMIT' }
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwK4CMC2BLWssHsA7AOgHcBDLAFy0KgH0AzfAJ3oDdyAbLCcmogGIAagEEAMgEkAIqIAqAUQDaABgC6iUAAd8eAYU0gAHogBMpgOzEAnNYCMAZhXXTDgBwq7KgCzeANCAAnojWDsQAbHamAKxuTtE+DtYWdgC+qQGomDh4RMScPHw0dCISMvKSAPIAcvQAygCqAMJNCnV1qhpIIDp6BAbdJgjeKqbE3vbRDg4WpqPm0QHBCAC0XlZ2oRbRFg6m3qbWnhbpmejYuP353Lz8tFClUrJyVbUAYqKS4grSnYa91H6hiGDjs0WIdnCyXMTmS1jcdiWiAcE2I0TscUSFgsLl23lOICyF1yJAKt2KDzETwqNXoCgASvTKvS-t0AfpgYhfG40So3G5otF7N4Mc4kQhXGFnOEhdiZSM4qYCUSclcyUVIIIGgAFZ4KegAWQUcnpkiaHXU-10gKInIQHm8vNMYJU2yOkLc4rWrohWx2ewOR1cyvOqrytHVgnpbQaACEDZI5KztNaOYNEOFwuMZrtwm5IqZwnNTOKYlnC7NCyNYVCThlCaHLnl1XciPQwCwWKxHuVFMmeqmgemEOFnMQBW5vJPvKCoW4LOK4mii5FsU4Rt5tul64R8BA4IYVU2Bim+rbhysHFmEdNZr54RZN56gog1tZHVCZuFsW5bCk3CG2THmQlAUkwrAcDcRRDqeNonsYiB2HYEL5kW2wJFE0QwuKXhjJsQpzPYcThN4UKAcSapQXcdBWme8EgkW44IqEliFtEM52P4L4IO+EJRPK3jsWCJFpPWR4ktchT8JAtFwXaswqMQPgzjsREqCi4RemMgpeOiSHoupIzRORYYkBGUGyWmoAgo+TGbDEewkaRDjipu1hoiKbo+B4hYmcBLb6O2nasJZMEIQgFiZsQ7hzDK0zqUJi5hNEK52GuPg+HW6RAA */
  id: 'submission',
  initial: 'waiting_for_validation',
  context: {
    url: '',
    taskType: 'space',
    isFirstValidation: true
  },

  states: {
    waiting_for_validation: {
      on: {
        VALIDATE: {
          target: 'validating'
        }
      }
    },

    validating: {
      on: {
        VALIDATION_FAILED: {
          target: 'invalid',
          actions: assign({
            error: ({ event }) => event.error,
            validateTime: () => Date.now(),
            isFirstValidation: false
          })
        },

        VALIDATION_ERROR: {
          target: 'validation_error',
          actions: assign({
            error: ({ event }) => event.error,
            validateTime: () => Date.now(),
            isFirstValidation: false
          })
        }
      }
    },

    validated: {
      on: {
        UPDATE_METRICS: {
          actions: assign({
            metrics: ({ event }) => event.metrics,
            validateTime: () => Date.now()
          })
        }
      }
    },

    invalid: {
      on: {
        RESUBMIT: {
          target: 'waiting_for_validation',
          actions: assign({
            error: undefined,
            validateTime: undefined
          })
        }
      }
    },

    validation_error: {
      on: {
        VALIDATE: {
          target: 'validating'
        }
      }
    }
  }
})