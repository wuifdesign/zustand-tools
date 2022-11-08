import React, { createContext, useContext, useRef } from 'react'
import { DeepPartial, InitStateType, UseBoundStoreType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import deepmerge from 'deepmerge'
import { ActionsType, CreateSimpleOptions } from '../types/create-simple-options'
import shallow from 'zustand/shallow'
import { filterObjectByKey } from '../utils/filter-object-by-key'

export const createSimpleContext = <T extends InitStateType, A extends ActionsType<T>>(
  defaultState: T,
  options: CreateSimpleOptions<T, A> = {}
) => {
  const StoreContext = createContext<UseBoundStoreType<T & ReturnType<A>>>(null as any)

  const Provider: React.FC<{ initialValues?: DeepPartial<T>; children: React.ReactNode }> = ({
    children,
    initialValues = {}
  }) => {
    const useStore = useRef<UseBoundStoreType<T & ReturnType<A>>>()
    if (!useStore.current) {
      const mergedValues = deepmerge<T>(defaultState, initialValues)
      useStore.current = createStore(mergedValues, options)
    }
    return <StoreContext.Provider value={useStore.current}>{children}</StoreContext.Provider>
  }

  return {
    Provider,
    hooks: {
      useStore: () => useContext(StoreContext),
      useAllData: () => {
        const useLocalStore = useContext(StoreContext!)
        return useLocalStore((state) => filterObjectByKey(state, (key) => !key.startsWith('set')), shallow)
      },
      ...createHooksObject<T, A>({ initState: defaultState, StoreContext })
    }
  }
}
