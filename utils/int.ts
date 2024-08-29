import { z } from 'zod'

export function bigInt2Float(integer: bigint, denomination: number): number {
  // Validate inputs
  z.bigint().parse(integer)
  z.number().int().nonnegative().parse(denomination)

  const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER)

  // If the integer is small enough to be safely converted to a number
  if (integer <= maxSafeInteger) {
    return Number(integer) / 10 ** denomination
  }

  // If the integer is too large, handle the conversion safely
  const integerStr = integer.toString() // Convert BigInt to string
  const intLength = integerStr.length

  if (intLength <= denomination) {
    // If the integer length is less than or equal to the denomination, return a small float
    return parseFloat('0.' + '0'.repeat(denomination - intLength) + integerStr)
  }

  // Otherwise, insert a decimal point at the correct position
  const decimalPointIndex = intLength - denomination
  const integerPart = integerStr.slice(0, decimalPointIndex)
  const fractionalPart = integerStr.slice(decimalPointIndex)

  return parseFloat(`${integerPart}.${fractionalPart}`)
}

export function fractionalPart(num: number) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, decimalPart = ''] = num.toString().split('.')
  return decimalPart
}

export function float2BigInt(num: number, denomination: number): bigint {
  // Validate inputs
  z.number().finite().parse(num) // Ensure `num` is a finite number
  z.number().int().nonnegative().parse(denomination) // Ensure `denomination` is a non-negative integer

  // Convert the float to a string
  const numStr = num.toString()
  const [integerPart, decimalPart = ''] = numStr.split('.')

  // Ensure decimal part is not longer than the denomination
  if (decimalPart.length > denomination) {
    throw new Error('The number of decimals in the input exceeds the allowed denomination.')
  }

  // Create the string representing the number as an integer without a decimal point
  const fullNumberStr = integerPart + decimalPart.padEnd(denomination, '0')

  // Convert the full number string to BigInt
  const result = BigInt(fullNumberStr)

  return result
}

export function isValidNumber(value: unknown, isAcceptFloat = true) {
  if (typeof value !== 'number') {
    return false
  }
  
  if (!isAcceptFloat) {
    return Number.isInteger(value)
  }

  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return false
  }
  
  return true
}

export function isValidInt(value: unknown) {
  return isValidNumber(value, false)
}

export function bigintReplacer(_: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value
}