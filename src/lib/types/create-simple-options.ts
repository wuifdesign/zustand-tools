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

export type CreateSimpleOptions<State extends InitStateType, Actions extends ActionsType<State>> = {
  actions?: Actions
  middlewares?: MiddlewareOptionType<State & ReturnType<Actions>>[]
}
