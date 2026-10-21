import type { Context } from 'react'
import { useContext } from 'react'

export const useStoreContext = <Store>(context: Context<Store | null>, hookName: string): Store => {
  const store = useContext(context)
  if (!store) {
    throw new Error(`[zustand-tools] ${hookName} must be used inside its Provider`)
  }
  return store
}
