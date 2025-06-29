import { acceptHMRUpdate, defineStore } from 'pinia'

// TODO move these notification functions to utils
export const notificationStore = defineStore('notificationStore', () => {
  const toast = useToast()
  const showError = (description: string, error?: Error|string) => {
    const message = error instanceof Error ? error.message
      : (typeof error === 'string' ? error : '' )
    toast.add({
      title: 'Error',
      description: description + (message ? ' ' + message : ''),
      icon: 'i-heroicons-x-circle-16-solid', color: 'red'
    })
  }
  const showSuccess = (description: string) => {
    toast.add({ title: '', description, icon: 'i-heroicons-check-circle', color: 'green' })
  }

  const showMessage = (message: string) => {
    toast.add({ title: message, icon: 'heroicons:information-circle' })
  }

  const alertMessage = (description: string) => {
    alert(description)
  }

  return $$({ showError, showSuccess, alertMessage, showMessage })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(notificationStore, import.meta.hot))
