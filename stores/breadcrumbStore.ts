import { acceptHMRUpdate, defineStore } from 'pinia'

export interface IBreadcrumbLink {
  label: string
  labelKey?: string
  to?: string
  icon?: string
  isCommunityUuid?: boolean
  communityId?: string
  communityName?: string
}

export const breadcrumbStore = defineStore('breadcrumb', () => {
  let breadcrumbs = $ref<IBreadcrumbLink[]>([])

  const setBreadcrumbs = (links: IBreadcrumbLink[]) => {
    console.log('setBreadcrumbs', links)
    breadcrumbs = links
  }

  const addBreadcrumb = (link: IBreadcrumbLink) => {
    breadcrumbs.push(link)
  }

  const clearBreadcrumbs = () => {
    breadcrumbs = []
  }

  return $$({ 
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs
  })
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(breadcrumbStore, import.meta.hot))
} 