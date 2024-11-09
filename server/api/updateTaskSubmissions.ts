import { defineEventHandler, readBody } from 'h3'
import Arweave from 'arweave'

interface UpdateSubmissionsBody {
  taskPid: string
  signature: string
  address: string
  publicKey: string
  message: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateSubmissionsBody>(event)
  const { taskPid, signature, address, publicKey, message } = body

  if (!taskPid || !signature || !address || !publicKey || !message) {
    throw new Error('taskPid, signature, address, publicKey and message are required')
  }

  try {
    console.log('api/updateTaskSubmissions Debug values:', {
      message,
      signature,
      publicKey,
      address,
      taskPid
    })

    // Convert message to Uint8Array
    const data = new TextEncoder().encode(message)
    
    // Convert base64url signature to Uint8Array
    const binarySignature = Arweave.utils.b64UrlToBuffer(signature)

    console.log('Binary signature length:', binarySignature.length)

    // Create public key
    const publicJWK: JsonWebKey = {
      ext: true,
      e: 'AQAB',
      kty: 'RSA',
      n: publicKey
    }

    // Import the public key
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      publicJWK,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    ).catch(err => {
      console.error('Key import error:', err)
      throw err
    })

    // Hash the message first
    const hash = await crypto.subtle.digest('SHA-256', data)

    console.log('Hash length:', new Uint8Array(hash).length)

    // Verify the signature
    const isValid = await crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      cryptoKey,
      binarySignature,
      hash
    ).catch(err => {
      console.error('Verification error:', err)
      throw err
    })

    if (!isValid) {
      throw new Error('Invalid signature')
    }

    try {
      // If signature is valid, proceed with the task
      const payload = { taskPid, signature, address }
      const { result } = await runTask('updateSubmissions', { payload })
      return { result }
    } catch (error) {
      console.error('Update submissions task error:', error)
      throw new Error('Update submissions failed.')
    }

  } catch (error) {
    console.error('Signature verification error:', error)
    const errorMessage = error instanceof Error ? error.message : ''
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    if (errorMessage === 'Invalid signature') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid signature.'
      })
    } else if (errorMessage.includes('Update submissions failed')) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Update submissions failed.'
      })
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Signature verification failed.'
      })
    }
  }
})
