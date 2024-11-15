import { ref } from 'vue'

export function useSignature() {
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const getSignature = async (message: string) => {
    error.value = null
    isLoading.value = true

    try {
      if (!window.arweaveWallet) {
        throw new Error('Arweave wallet not found')
      }

      await window.arweaveWallet.connect(['SIGNATURE', 'ACCESS_PUBLIC_KEY'])

      const data = new TextEncoder().encode(message)
      
      const signature = await window.arweaveWallet.signMessage(data, {
        hashAlgorithm: 'SHA-256'
      })
      
      const address = await window.arweaveWallet.getActiveAddress()
      const publicKey = await window.arweaveWallet.getActivePublicKey()

      console.log('Client-side values:', {
        message,
        signatureLength: signature.toString().length,
        address,
        publicKey: publicKey || 'Not available'
      })

      return {
        signature: window.Arweave.utils.bufferTob64Url(signature),
        address,
        publicKey,
        message
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error occurred')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    getSignature,
    error,
    isLoading
  }
} 