import { CreateSimpleType, InitStateType, MiddlewareType } from '../types'
import { ucFirst } from './uc-first'
import { StateCreator, StoreApi } from 'zustand/esm/vanilla'
import create from 'zustand'

const createState = (initState: InitStateType, set: StoreApi<InitStateType>['setState']): any => {
  const state: Record<string, any> = {}
  for (const [key, value] of Object.entries(initState)) {
    state[key] = value
    state['set' + ucFirst(key)] = (value: any) => set(() => ({ [key]: value }))
  }
  return state
}

export const createStore = <T extends InitStateType>(initState: T, middlewares: MiddlewareType<T>[] = []) => {
  let initializer: StateCreator<CreateSimpleType<T>> = (set) => createState(initState, set)
  for (const middleware of middlewares) {
    initializer = middleware(initializer)
  }
  return create(initializer)
}
