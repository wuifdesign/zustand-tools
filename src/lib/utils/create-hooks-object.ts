import { useMemo } from 'react'
import type { Context } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { CreateSimpleHooksType, InitStateType, UseBoundStoreType } from '../types'
import { getKeyNames } from './key-names'
import type { ActionsResult, ActionsType } from '../types/create-simple-options'
import { useStoreContext } from './use-store-context'

type HooksSource<State extends InitStateType, Actions extends ActionsType<State>, Mutators> =
  | { store: UseBoundStoreType<State, ActionsResult<Actions>, Mutators> }
  | { StoreContext: Context<UseBoundStoreType<State, ActionsResult<Actions>, Mutators> | null> }

// either a store or a StoreContext, the types do not allow both or none
type CreateHooksObjectOptions<State extends InitStateType, Actions extends ActionsType<State>, Mutators> = {
  initState: State
  reservedHookNames?: string[]
} & HooksSource<State, Actions, Mutators>

// the generated hooks access the state by string key, the public type is restored once at the end
type UntypedStore = UseBoundStore<StoreApi<Record<string, unknown>>>
const asUntyped = (store: unknown) => store as UntypedStore

export const createHooksObject = <State extends InitStateType, Actions extends ActionsType<State>, Mutators = []>(
  options: CreateHooksObjectOptions<State, Actions, Mutators>
) => {
  const { initState, reservedHookNames = [] } = options
  if (!('store' in options) && !('StoreContext' in options)) {
    throw new Error('[zustand-tools] createHooksObject needs either a store or a StoreContext')
  }
  const hooks: Record<string, () => readonly [unknown, unknown]> = {}
  // `store` never changes after creation, so the same branch (and hook order) is used on every render
  const useLocalStore = (hookName: string): UntypedStore => {
    if ('store' in options) {
      return asUntyped(options.store)
    }
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- `store` never changes after creation, the hook order is stable
    return asUntyped(useStoreContext(options.StoreContext, hookName))
  }
  for (const key of Object.keys(initState)) {
    const { hookName, setterName } = getKeyNames(key)
    if (reservedHookNames.includes(hookName)) {
      throw new Error(`[zustand-tools] state key "${key}" collides with the built-in hook "${hookName}"`)
    }
    // created once per key, a stable selector saves an allocation per render
    const select = (state: Record<string, unknown>) => state[key]
    hooks[hookName] = () => {
      const localStore = useLocalStore(hookName)
      const value = localStore(select)
      const setter = localStore.getState()[setterName]
      // same tuple as long as the value is the same, so it can be used in dependency arrays
      return useMemo(() => [value, setter] as const, [value, setter])
    }
  }
  return hooks as unknown as CreateSimpleHooksType<State>
}
