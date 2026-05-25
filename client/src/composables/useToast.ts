import { reactive } from 'vue'

interface ToastItem {
  id: number
  message: string
  type: 'error' | 'success'
}

const state = reactive<{ toasts: ToastItem[] }>({ toasts: [] })
let nextId = 0

export function useToast() {
  function show(message: string, type: 'error' | 'success' = 'error') {
    const id = nextId++
    state.toasts.push({ id, message, type })
    setTimeout(() => {
      const idx = state.toasts.findIndex(t => t.id === id)
      if (idx !== -1) state.toasts.splice(idx, 1)
    }, 4000)
  }

  function remove(id: number) {
    const idx = state.toasts.findIndex(t => t.id === id)
    if (idx !== -1) state.toasts.splice(idx, 1)
  }

  return { toasts: state.toasts, show, remove }
}
