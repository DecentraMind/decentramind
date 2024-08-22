/** e.g. 37462 => 37.5K */
export const numberFormat = (num: number, fraction = 6) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: fraction, notation: 'compact', compactDisplay: 'short' }).format(num)
}

// TODO bigint2string(number: bigint, denomination)