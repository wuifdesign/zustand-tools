import type { CreateSimpleType, InitStateType } from '../types'
import { getKeyNames } from './key-names'
import type { StateCreator, StoreApi } from 'zustand'
import { create } from 'zustand'
import type {
  ActionsResult,
  ActionsType,
  CreateSimpleOptions,
  MiddlewareMutators,
  MiddlewareOptionType,
  StoreStateType
} from '../types/create-simple-options'
import type { UseBoundStoreType } from '../types/use-bound-store-type'

// the only place where the generated state is created, the cast is safe because every key gets exactly its setter
const createState = <State extends InitStateType>(
  initState: State,
  set: StoreApi<InitStateType>['setState'],
  get: () => object
): CreateSimpleType<State> => {
  const state: Record<string, unknown> = {}
  const owners = new Map<string, string>()
  const claim = (name: string, owner: string) => {
    const existing = owners.get(name)
    if (existing !== undefined) {
      throw new Error(`[zustand-tools] "${name}" is used twice: by "${existing}" and by "${owner}"`)
    }
    owners.set(name, owner)
  }
  for (const [key, value] of Object.entries(initState)) {
    claim(key, `state key "${key}"`)
    const { setterName } = getKeyNames(key)
    claim(setterName, `the generated setter of "${key}"`)
    state[key] = value
    // setting the current value is a no-op, so subscribers (and e.g. persist) are not notified for nothing
    state[setterName] = (value: unknown) => {
      if (!Object.is((get() as Record<string, unknown>)[key], value)) {
        set({ [key]: value })
      }
    }
  }
  return state as unknown as CreateSimpleType<State>
}

// overriding a generated setter with an action is intended, shadowing a state key would silently drop the state
const assertActionsDoNotShadowState = (initState: InitStateType, actions: Record<string, unknown>) => {
  for (const name of Object.keys(actions)) {
    if (name in initState) {
      throw new Error(`[zustand-tools] action "${name}" collides with the state key "${name}"`)
    }
  }
}

export const createStore = <
  State extends InitStateType,
  Actions extends ActionsType<State>,
  MutatorsPerMiddleware extends readonly unknown[] = unknown[]
>(
  initState: State,
  { middlewares, actions }: CreateSimpleOptions<State, Actions, MutatorsPerMiddleware> = {}
): UseBoundStoreType<State, ActionsResult<Actions>, MiddlewareMutators<MutatorsPerMiddleware>> => {
  let initializer: StateCreator<StoreStateType<State, Actions>, [], []> = (set, get, api) => {
    const state = createState(initState, set, get)
    const customActions = actions ? actions(set, get, api) : {}
    assertActionsDoNotShadowState(initState, customActions)
    return { ...state, ...customActions } as StoreStateType<State, Actions>
  }
  for (const middleware of (middlewares ?? []) as readonly MiddlewareOptionType<State, Actions>[]) {
    // the middleware adds its mutators to the type of the store, which is part of the return type of createStore
    initializer = middleware(initializer) as typeof initializer
  }
  // the mutators added by the middlewares can not be tracked through the loop, they are part of the return type
  return create<StoreStateType<State, Actions>>()(initializer) as unknown as UseBoundStoreType<
    State,
    ActionsResult<Actions>,
    MiddlewareMutators<MutatorsPerMiddleware>
  >
}
