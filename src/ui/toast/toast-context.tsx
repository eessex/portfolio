'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState
} from 'react'

import {
  Toast,
  type ToastProps
} from '@/ui/toast/toast'
import styles from '@/ui/toast/toast.module.scss'

interface ToastContextValue {
  addSuccessMessage: (message: string) => number
  addErrorMessage: (message: string) => void
  removeMessage: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast () {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

export function ToastProvider ({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([])
  const nextId = useRef(0)

  const removeMessage = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((type: ToastProps['type'], message: string) => {
    const id = nextId.current++
    setToasts(prev => [...prev, {
      id, type, message, onHide: () => removeMessage(id)
    }])
    return id
  }, [removeMessage])

  const value = {
    addSuccessMessage: (message: string) => add('success', message),
    addErrorMessage: (message: string) => add('error', message),
    removeMessage
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className={styles['toast-container']}>
        {toasts.map(t => (
          <Toast
            key={t.id}
            type={t.type}
            message={t.message}
            onHide={() => removeMessage(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
