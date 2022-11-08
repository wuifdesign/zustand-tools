import { StateCreator, StoreApi } from 'zustand'

export type MiddlewareType<State extends any = any> = (
  config: StateCreator<State>,
  options: any
) => (set: StoreApi<State>['setState'], get: StoreApi<State>['getState'], api: StoreApi<State>) => State
