import React, { createContext, useState } from 'react'
import type { DeepPartial, InitStateType, ValidInitState, UseBoundStoreType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import type {
  ActionsResult,
  ActionsType,
  CreateSimpleOptions,
  MiddlewareMutators
} from '../types/create-simple-options'
import { useShallow } from 'zustand/react/shallow'
import { pickKeys } from '../utils/pick-keys'
import { useStoreContext } from '../utils/use-store-context'
import { mergePlain } from '../utils/merge-plain'

export const createSimpleContext = <
  State extends InitStateType,
  Actions extends ActionsType<State>,
  MutatorsPerMiddleware extends readonly unknown[] = unknown[]
>(
  defaultState: State & ValidInitState<State>,
  options: CreateSimpleOptions<State, Actions, MutatorsPerMiddleware> = {}
) => {
  const dataKeys = Object.keys(defaultState) as (keyof State)[]
  const StoreContext = createContext<UseBoundStoreType<
    State,
    ActionsResult<Actions>,
    MiddlewareMutators<MutatorsPerMiddleware>
  > | null>(null)

  const Provider: React.FC<{ initialValues?: DeepPartial<State>; children: React.ReactNode }> = ({
    children,
    initialValues = {}
  }) => {
    // lazy initial state: the store is created once per provider and the merge only runs on mount
    const [store] = useState(() =>
      createStore<State, Actions, MutatorsPerMiddleware>(
        mergePlain(defaultState, initialValues as Record<string, unknown>),
        options
      )
    )
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  }

  return {
    Provider,
    hooks: {
      useStore: () => useStoreContext(StoreContext, 'useStore'),
      useAllData: () => {
        const useLocalStore = useStoreContext(StoreContext, 'useAllData')
        return useLocalStore(useShallow((state) => pickKeys(state, dataKeys)))
      },
      ...createHooksObject<State, Actions, MiddlewareMutators<MutatorsPerMiddleware>>({
        initState: defaultState,
        StoreContext,
        reservedHookNames: ['useAllData', 'useStore']
      })
    }
  }
}
