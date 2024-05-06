export const notificationStore = defineStore('notificationStore', () => {
  const toast = useToast()
  const showError = description => {
    toast.add({ title: 'Error', description, icon: 'i-heroicons-x-circle-16-solid', color: 'red' })
  }
  const showSuccess = description => {
    toast.add({ title: 'succeed', description, icon: 'i-heroicons-check-circle', color: 'green' })
  }

  return $$({ showError, showSuccess })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(notificationStore, import.meta.hot))
