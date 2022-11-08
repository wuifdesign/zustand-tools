import React, { createContext, useContext, useRef } from 'react'
import { DeepPartial, InitStateType, UseBoundStoreType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import deepmerge from 'deepmerge'
import { ActionsType, CreateSimpleOptions } from '../types/create-simple-options'
import shallow from 'zustand/shallow'
import { filterObjectByKey } from '../utils/filter-object-by-key'

export const createSimpleContext = <State extends InitStateType, Actions extends ActionsType<State>>(
  defaultState: State,
  options: CreateSimpleOptions<State, Actions> = {}
) => {
  const StoreContext = createContext<UseBoundStoreType<State & ReturnType<Actions>>>(null as any)

  const Provider: React.FC<{ initialValues?: DeepPartial<State>; children: React.ReactNode }> = ({
    children,
    initialValues = {}
  }) => {
    const useStore = useRef<UseBoundStoreType<State & ReturnType<Actions>>>()
    if (!useStore.current) {
      const mergedValues = deepmerge<State>(defaultState, initialValues)
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
      ...createHooksObject<State, Actions>({ initState: defaultState, StoreContext })
    }
  }
}
