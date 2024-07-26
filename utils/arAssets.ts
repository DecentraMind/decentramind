export const gateWays = ['https://ar-io.dev/', 'https://permagate.io/']

export const userAvatar = 'h3GpQlrBODufN2StZhf_er2egNU-9UcQiZQYAWg6AY4'

export const communityLogo = 'vtUgAy-qAyVFlMfOfKIF31izy9-Ms7m2v-Rp33UpGEw'

export const tokenLogo = 'Rk1xvMAm-z_TMGresU6zDpGjD0UNK6TjvZ_r6fFSrzQ'

export const taskBanners = [
  'rL_eONrQI7IHo70Aq19tl53Bai-jheSeQs6TxWjqig',
  'pVRDeHl4srK-ZI6zDayD5WO79Gzfe_4Tj0UbIMYSFnI',
  'C7jXwg2VNJwLVTkfXIfcVCT7Mi-0zpk0we6WSlM7XbM',
  'TyQujh7bXwCrTtRhuQtJVn7-Jdn94A1B3qbTgGGyYOI',
  'GoHQfecrvWhxhLJH0ZAPVbPhKY-I4CFGcvFNb9ttpyU'
]

export const communityBanners = [
  'sPZ9cEco_DW-angb7ujryZ-2pnU6dDu3rFSqxHQmh0k',
  'sSml8yAAsNSwlvCO3wY0Uf_k-VhueeYcr7v7RSwOAeY',
  '6ZNzI3G7Com0tVwAK1VvhP9uOTG4QkD0lO2EDsxaTm0',
  'rfhaMZdQ1eLCf7kx5VmcqfEr2H5wnFV1h8V7iupSfMc',
  'pS68oLQeIEBMUj1IZ2sz6wPsGzzTFiZylzOryDVGWoU',
]

export function arUrl(tx: string, gateWayIndex: number = 0) {
  return gateWays[gateWayIndex] + tx
}

export function replaceBanner(banner: string) {
  
}
