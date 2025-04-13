import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTokenInfo } from '~/utils/token'
// import * as aoModule from '~/utils/ao'

// vi.mock('~/utils/ao', () => ({
//   dryrunResult: vi.fn(),
//   createDataItemSigner: vi.fn().mockReturnValue('mocked-signer')
// }))

describe('Token utilities', () => {
  // beforeEach(() => {
    // vi.clearAllMocks()
    
    // Mock window.arweaveWallet
    // global.window = {
    //   ...global.window,
    //   arweaveWallet: 'mocked-wallet'
    // } as any
  // })

  describe('getTokenInfo', () => {
    it('should call dryrunResult with the correct parameters', async () => {
      const tokenProcessID = 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10'
      const result = await getTokenInfo(tokenProcessID)

      // Check if the function returns the expected result
      expect(result.denomination).toEqual('12')
      expect(result.ticker).toEqual('wAR')
      expect(result.name).toEqual('Wrapped AR')
      expect(result.logo).toEqual('L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs')
    })

    // it('should handle errors when dryrunResult fails', async () => {
    //   // Mock dryrunResult to throw an error
    //   const mockedDryrunResult = vi.mocked(aoModule.dryrunResult)
    //   mockedDryrunResult.mockRejectedValue(new Error('Token info retrieval failed'))

    //   // Call the function and expect it to throw
    //   const tokenProcessID = 'invalid-token-process-id'
    //   await expect(getTokenInfo(tokenProcessID)).rejects.toThrow('Token info retrieval failed')
    // })
  })
}) 