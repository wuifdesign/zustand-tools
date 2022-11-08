import { InitStateType } from './init-state-type'
import { StateCreator, StoreApi } from 'zustand'

type MiddlewareOptionType<State extends InitStateType> = (
  initializer: StateCreator<State>
) => StateCreator<State, any, any>

export type ActionsType<State> = (
  setState: StoreApi<State>['setState'],
  getState: StoreApi<State>['getState'],
  store: StoreApi<State>
) => Record<string, Function>

export type CreateSimpleOptions<T extends InitStateType, A extends ActionsType<T>> = {
  actions?: A
  middlewares?: MiddlewareOptionType<T & ReturnType<A>>[]
}
