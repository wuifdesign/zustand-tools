import { createContext, useState } from 'react'
import type {
  CreateSimpleProviderProps,
  InitStateType,
  UseAllDataType,
  UseBoundStoreType,
  ValidInitState
} from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore, planState } from '../utils/create-store'
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

// keys whose generated hook would be `useAllData` / `useStore`
type ReservedHookKey = 'allData' | 'store'

export const createSimpleContext = <
  State extends InitStateType,
  Actions extends ActionsType<State>,
  MutatorsPerMiddleware extends readonly unknown[] = unknown[]
>(
  defaultState: State & ValidInitState<State, ReservedHookKey>,
  options: CreateSimpleOptions<State, Actions, MutatorsPerMiddleware> = {}
) => {
  const dataKeys = Object.keys(defaultState) as (keyof State)[]
  // validated once instead of on every mount of a Provider
  const plan = planState(defaultState)
  const StoreContext = createContext<UseBoundStoreType<
    State,
    ActionsResult<Actions>,
    MiddlewareMutators<MutatorsPerMiddleware>
  > | null>(null)

  const Provider = ({ children, initialValues }: CreateSimpleProviderProps<State>) => {
    // lazy initial state: the store is created once per provider and the merge only runs on mount
    const [store] = useState(() =>
      createStore<State, Actions, MutatorsPerMiddleware>(
        // nothing to merge in the common case, the state is only read, so the default can be shared
        initialValues ? mergePlain(defaultState, initialValues as Record<string, unknown>) : defaultState,
        options,
        plan
      )
    )
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  }

  const useAllData: UseAllDataType<State> = () => {
    const useLocalStore = useStoreContext(StoreContext, 'useAllData')
    // oxlint-disable-next-line react/hooks -- the store of a context never changes while its Provider is mounted
    return useLocalStore(useShallow((state) => pickKeys(state, dataKeys)))
  }

  return {
    Provider,
    hooks: {
      useStore: () => useStoreContext(StoreContext, 'useStore'),
      useAllData,
      ...createHooksObject<State, Actions, MiddlewareMutators<MutatorsPerMiddleware>>({
        initState: defaultState,
        StoreContext,
        reservedHookNames: ['useAllData', 'useStore']
      })
    }
  }
}
