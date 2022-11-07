import { StateCreator, StoreApi } from 'zustand'

export type MiddlewareType<T extends any = any> = (
  config: StateCreator<T>,
  options: any
) => (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => T
