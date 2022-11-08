import React, { createContext, useContext, useRef } from 'react'
import { DeepPartial, InitStateType, UseBoundStoreType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import deepmerge from 'deepmerge'
import { CreateSimpleOptions } from '../types/create-simple-options'

export const createSimpleContext = <T extends InitStateType>(defaultState: T, options: CreateSimpleOptions<T> = {}) => {
  const StoreContext = createContext<UseBoundStoreType<T>>(null as any)

  const Provider: React.FC<{ initialValues?: DeepPartial<T>; children: React.ReactNode }> = ({
    children,
    initialValues = {}
  }) => {
    const store = useRef<UseBoundStoreType<T>>()
    if (!store.current) {
      const mergedValues = deepmerge<T>(defaultState, initialValues)
      store.current = createStore(mergedValues, options)
    }
    return <StoreContext.Provider value={store.current}>{children}</StoreContext.Provider>
  }

  return {
    Provider,
    hooks: {
      useStore: () => useContext(StoreContext),
      ...createHooksObject<T>({ initState: defaultState, StoreContext })
    }
  }
}
