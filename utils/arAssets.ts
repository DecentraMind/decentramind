import type { Task } from '~/types'
import { ARWEAVE_ID_REGEXP } from './constants'

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

export const decentraMindLogo = 'FcaExQs5fN4KAeYhxgnfHK4Fp9U6Rh62xsBHhxg2AnU'

export const exploreLogo = '1jb3PLQc7GxOgFGXQ2sD9P1-IrDGwET7BIKe7EFogPU'

export const defaultUserAvatar = 'gAh_m4pAU-PCAvDfDkv-6MPKp46E7MpaGlfwvZV-cgw'

// OrzPJKbouDnEk_7sVEvRY28Cqf0o6R-dz_ARn0p9v3s
export const defaultCommunityLogo = 'SofH1iK6Az431hGKqkEv5hx1yO0o5X0SzrE8S-1VsL4'

export const defaultTokenLogo = 'rZbcNfx8UumPfzZJxXHlwXt7f_kxbO1_dcFbL_i0obg'

export const taskBannersMap: Record<Task['type'], string[]> = {
  space: [
    'iVTYARnF4MFibt2QEF9jrlqhvXFoL5LDojvuddzFC6E',
    'reiNxSXMV1YnSSJahTgLo1KvL9m7D5sZcnTnq7q1muE',
    'cjvbyCN9djO12OaVkjn80U5cddk46LMMBordWW-Y6dA',
    '3NHrjNZH_cICGR15qxO3t2nbCPq0cgnWSW644oRqIEQ'
  ],
  promotion: [
    '56lhvYDBHLtAsr-STGwVNsJx45-aDqMZRRWwZOJpjsQ',
    'eCFBZ8fjB3KB7lkSgJfXJJxV1_Krg7BXSDNZhzaN2Us',
    'M4tEQezugPozOg4-7C7D1wN3kKrXfYuxLmCnUp8huJE',
    'forWSpQwViqXBBb4jcXaffGMOi8y6LqJDBkxf0Sjqx4'
  ],
  bird: [
    'eF7hIO0xMrBoOHL8iUqCi4beQN-dn-l1olaOVunpcGU',
    'o4eUnWbWcogxjRNyicLkgQTTr6zTKQR2xuB0dizDIFc',
    '1dfZexP1Vk_gQrn-P4XfkKzN0EpQo_7zQVbfzTUsAwY',
    'ASSu5XLRLGKNw1NmciWVm7XO14ZKHWCcNaar_PDVwz4'
  ],
  article: [
    'jyVC4XeIxLNOZitnjgPzljLzf9jQikbPg1aQVHOV1wM',
    'xIGLkFhuHLmqNnJMamzbAg0EascuMW8odU8u3EXdjQk',
    'cSGrre5FzyMvYBdoLJ2VfBU7JHavHb7pVSAEpdYY2cU',
    '4qYkZ6nWT22v_v_MkyCH4ZJ-LvRWhf0M0NC29aehbPA'
  ],
  invite: [
    '56lhvYDBHLtAsr-STGwVNsJx45-aDqMZRRWwZOJpjsQ',
    'eCFBZ8fjB3KB7lkSgJfXJJxV1_Krg7BXSDNZhzaN2Us',
    'M4tEQezugPozOg4-7C7D1wN3kKrXfYuxLmCnUp8huJE',
    'forWSpQwViqXBBb4jcXaffGMOi8y6LqJDBkxf0Sjqx4'
  ]
}

export const communityBanners = [
  'D26l_0y5eFivSMzL5bFT6TpQxTs7Z1L2LKMtuZFvfzw',
  'yf6WM8rxcfJUBa8OvyZ8H7hDTgHjwk3L51iez2rQVSk',
  'gfobMczppaYRojyhurFYi8MUezj_5Ns1qMAl4WWaT98',
  'gCtIzxKLgn7nQ4NhRAzQSR5JC2zxQHwvKcLgS5jlbBI',
  'm1Ij7Mc1Fun1fhHVfP8ZIP9G-gZPkgY3kNyl-G7uMSc',
]

export function arUrl(tx: string, gateWay = gateways.everland) {
  if (!ARWEAVE_ID_REGEXP.test(tx)) {
    throw new Error('Invalid arweave id')
  }
  return gateWay + tx
}

export function getCommunityBannerUrl(banner: string, banners: string[] = communityBanners) {
  if (ARWEAVE_ID_REGEXP.test(banner)) {
    return arUrl(banner)
  }

  const matched = banner.match(/\d+$/)
  const bannerIndex = matched ? parseInt(matched[0]) - 6 : 0

  return arUrl(banners[bannerIndex])
}