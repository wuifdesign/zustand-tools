import React, { createContext, useContext } from 'react'
import { InitStateType, UseBoundStoreType } from './simple-zustand-create.type'
import { createHooksObject } from './create-hooks-object'

type CreateContextObjectOptions<T extends InitStateType> = {
  initState: T
  store?: UseBoundStoreType<T>
}

export const createContextObject = <T extends InitStateType>({ initState, store }: CreateContextObjectOptions<T>) => {
  const StoreContext = createContext<UseBoundStoreType<T>>(null as any)

  return {
    Provider: ({ children }: any) => <StoreContext.Provider value={store as any}>{children}</StoreContext.Provider>,
    hooks: {
      useStoreContext: () => useContext(StoreContext),
      ...createHooksObject<T>({ initState, StoreContext })
    }
  }
}
