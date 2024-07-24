// TODO move these notification functions to utils
export const notificationStore = defineStore('notificationStore', () => {
  const toast = useToast()
  const showError = (description: string) => {
    toast.add({ title: 'Error', description, icon: 'i-heroicons-x-circle-16-solid', color: 'red' })
  }
  const showSuccess = (description: string) => {
    toast.add({ title: 'succeed', description, icon: 'i-heroicons-check-circle', color: 'green' })
  }

  const alertMessage = (description: string) => {
    alert(description)
  }

  return $$({ showError, showSuccess, alertMessage })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(notificationStore, import.meta.hot))
