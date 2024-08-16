/**
 * 4Everland's arweave dedicated gateway
 * @caution 4everland's arweave gateway is at beta version,
 * and it only works on files that uploaded to 4everland's arweave synced
 * bucket. Try to use the url starts with https://${bucketName}.4everland.store
 * if this gateway not works
 * */
export const everlandGateway = 'https://arweave.4everland.xyz/'
// export const everlandGateway = 'https://ar.4everland.xyz/'

/** @see https://network-portal.app/#/gateways  */
export const gateways = {
  ario: 'https://ar-io.dev/',
  permagate: 'https://permagate.io/',
  everland: everlandGateway
}

export const defaultUserAvatar = 'UUyXJRLZHxJKxRERx-ZpdV-lRHqg-HzVuDRnN3J0N9c'
// export const defaultUserAvatar = '-UaLJIpKx-2rECSBaagaJpyjpcyi3_iojodOQ-sNHwA'

export const defaultCommunityLogo = 'OrzPJKbouDnEk_7sVEvRY28Cqf0o6R-dz_ARn0p9v3s'

export const defaultTokenLogo = 'rZbcNfx8UumPfzZJxXHlwXt7f_kxbO1_dcFbL_i0obg'

export const taskBanners = [
  'EqcbCxROKza6XqaicsV7Szy1lOF7OXtO4pabfoZd8bI',
  'QBfwr8Tt57GMkpEhsVB_862otMrUKC96PkPa0Y9pE1o',
  'GmaXCpnYI5gHAaQTCgczjnYaNTXbAHH93eNrOQCEWiw',
  'EXwjxvamy5QNQc6oM-kHjpP_jAGFiJ6h0VF20XyJtBs',
  'swlpzETV8ahXyNlDskY9nuIm1tbExAKJMKOVj0XD2ZI'
]

export const communityBanners = [
  'D26l_0y5eFivSMzL5bFT6TpQxTs7Z1L2LKMtuZFvfzw',
  'yf6WM8rxcfJUBa8OvyZ8H7hDTgHjwk3L51iez2rQVSk',
  'gfobMczppaYRojyhurFYi8MUezj_5Ns1qMAl4WWaT98',
  'gCtIzxKLgn7nQ4NhRAzQSR5JC2zxQHwvKcLgS5jlbBI',
  'm1Ij7Mc1Fun1fhHVfP8ZIP9G-gZPkgY3kNyl-G7uMSc',
]

export function arUrl(tx: string, gateWay = gateways.everland) {
  return gateWay + tx
}

export function getCommunityBannerUrl(banner: string, banners: string[] = communityBanners) {
  const matched = banner.match(/\d+$/)
  const bannerIndex = matched ? parseInt(matched[0]) - 6 : 0

  return arUrl(banners[bannerIndex])
}

export function getTaskBannerUrl(bannerName: string) {
  const legacyBannerNames = [
    'banner1',
    'banner2',
    'banner3',
    'banner4',
    'banner5',
  ]

  if (legacyBannerNames.includes(bannerName)) {
    const matched = bannerName.match(/\d+$/)
    const bannerIndex = matched ? parseInt(matched[0]) - 1 : 0

    if (taskBanners[bannerIndex]) {
      return arUrl(taskBanners[bannerIndex])
    }
    return `/task/${bannerName}.jpg`
  }

  return arUrl(bannerName)
}
