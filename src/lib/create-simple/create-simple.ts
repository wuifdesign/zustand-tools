import type { InitStateType, ValidInitState } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import type { ActionsType, CreateSimpleOptions, MiddlewareMutators } from '../types/create-simple-options'
import { useShallow } from 'zustand/react/shallow'
import { pickKeys } from '../utils/pick-keys'

export const createSimple = <
  State extends InitStateType,
  Actions extends ActionsType<State>,
  MutatorsPerMiddleware extends readonly unknown[] = unknown[]
>(
  initState: State & ValidInitState<State>,
  options: CreateSimpleOptions<State, Actions, MutatorsPerMiddleware> = {}
) => {
  const useStore = createStore<State, Actions, MutatorsPerMiddleware>(initState, options)
  const dataKeys = Object.keys(initState) as (keyof State)[]
  return {
    useStore,
    hooks: {
      useAllData: () => useStore(useShallow((state) => pickKeys(state, dataKeys))),
      ...createHooksObject<State, Actions, MiddlewareMutators<MutatorsPerMiddleware>>({
        initState,
        store: useStore,
        reservedHookNames: ['useAllData']
      })
    }
  }
}
