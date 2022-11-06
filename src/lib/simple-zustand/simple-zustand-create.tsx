import create from 'zustand'
import { StateCreator, StoreApi } from 'zustand/vanilla'
import { devtools } from 'zustand/middleware'
import { ucFirst } from '../utils/uc-first'
import { InitStateType, MiddlewareType, SimpleZustandType } from './simple-zustand-create.type'
import { createContextObject } from './create-context-object'
import { createHooksObject } from './create-hooks-object'

const createState = (initState: InitStateType, set: StoreApi<InitStateType>['setState']): any => {
  const state: Record<string, any> = {}
  for (const [key, value] of Object.entries(initState)) {
    state[key] = value
    state['set' + ucFirst(key)] = (value: any) => set(() => ({ [key]: value }))
  }
  return state
}

export const simpleZustandCreate = <T extends InitStateType>(initState: T, middlewares: MiddlewareType<T>[] = []) => {
  let initializer: StateCreator<SimpleZustandType<T>> = (set) => createState(initState, set)
  for (const middleware of middlewares) {
    initializer = middleware(initializer)
  }
  const store = create(initializer)
  return {
    store,
    hooks: createHooksObject<T>({ initState, store }),
    context: createContextObject<T>({ initState, store })
  }
}

const test = simpleZustandCreate({ a: 'demo' }, [(initializer) => devtools(initializer, { enabled: true })])

console.log(test)
console.log(test.store.getState().setA('demo2'))
console.log(test.store.getState().a)
