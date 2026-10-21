import type { InitStateType } from './init-state-type'
import type { CreateSimpleType } from './create-simple-type'
import type { StoreMutators } from './use-bound-store-type'
import type { StateCreator, StoreApi } from 'zustand'

/**
 * `set`, `get` and `store` of the actions see the state and the generated setters. Other custom actions are not part of
 * it: the type of the actions is inferred from this very function, so it can not depend on itself.
 */
export type ActionsType<State extends InitStateType> = (
  setState: StoreApi<CreateSimpleType<State>>['setState'],
  getState: StoreApi<CreateSimpleType<State>>['getState'],
  store: StoreApi<CreateSimpleType<State>>
) => Record<string, (...args: never[]) => unknown>

/**
 * The actions added to the state. Without `actions` option `Actions` is inferred as the constraint `ActionsType`, whose
 * result is an open `Record<string, fn>`: that must not end up as index signature on the store.
 */
export type ActionsResult<Actions extends (...args: never[]) => object> = string extends keyof ReturnType<Actions>
  ? {}
  : ReturnType<Actions>

/** The state of the created store: state, generated setters and custom actions. */
export type StoreStateType<State extends InitStateType, Actions extends ActionsType<State>> = CreateSimpleType<State> &
  ActionsResult<Actions>

/**
 * `Mutators` are the store mutators the middleware adds, they are inferred from the return type of e.g. `persist`.
 * The initializer a middleware receives already contains the generated setters and the custom actions.
 */
export type MiddlewareOptionType<
  State extends InitStateType,
  Actions extends ActionsType<State>,
  Mutators = unknown
> = (initializer: StateCreator<StoreStateType<State, Actions>, [], []>) => MiddlewareResult<State, Actions, Mutators>

// every middleware has its own mutated set/get/api types, zustand uses `any` here as well
/* oxlint-disable typescript/no-explicit-any */
type MiddlewareResult<State extends InitStateType, Actions extends ActionsType<State>, Mutators> = ((
  setState: any,
  getState: any,
  store: any
) => StoreStateType<State, Actions>) & { $$storeMutators?: Mutators }
/* oxlint-enable typescript/no-explicit-any */

/** Store mutators of all middlewares, outermost (= last) middleware first, like zustand's own `create()(a(b(...)))`. */
export type MiddlewareMutators<MutatorsPerMiddleware extends readonly unknown[]> =
  MutatorsPerMiddleware extends readonly [...infer Rest, infer Last]
    ? [...(Last extends StoreMutators ? Last : []), ...MiddlewareMutators<Rest>]
    : []

export type CreateSimpleOptions<
  State extends InitStateType,
  Actions extends ActionsType<State>,
  MutatorsPerMiddleware extends readonly unknown[] = unknown[]
> = {
  actions?: Actions
  // mapped tuple: every middleware infers its own mutators from its return type
  middlewares?: {
    [Index in keyof MutatorsPerMiddleware]: MiddlewareOptionType<State, Actions, MutatorsPerMiddleware[Index]>
  }
}
