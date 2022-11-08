import { InitStateType } from './init-state-type'
import { StateCreator, StoreApi } from 'zustand'

type MiddlewareOptionType<T extends InitStateType> = (initializer: StateCreator<T>) => StateCreator<T, any, any>

export type ActionsType<T> = (
  setState: StoreApi<T>['setState'],
  getState: StoreApi<T>['getState'],
  store: StoreApi<T>
) => Record<string, Function>

export type CreateSimpleOptions<T extends InitStateType, A extends ActionsType<T>> = {
  actions?: A
  middlewares?: MiddlewareOptionType<T & ReturnType<A>>[]
}
