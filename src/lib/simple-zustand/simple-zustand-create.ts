import create from 'zustand'
import { StoreApi } from 'zustand/vanilla'

const ucFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

type InitStateType = Record<string, any>

type SimpleZustandType<T extends { [key: string | number | symbol]: any }> = T & {
  [Property in keyof T as `set${Capitalize<string & Property>}`]: (value: T[Property]) => void
}

type SimpleZustandHooksType<T extends { [key: string | number | symbol]: any }> = {
  [Property in keyof T as `use${Capitalize<string & Property>}`]: () => [T[Property], (value: T[Property]) => void]
}

const createState = (initState: InitStateType, set: StoreApi<InitStateType>['setState']): any => {
  const state: Record<string, any> = {}
  for (const [key, value] of Object.entries(initState)) {
    state[key] = value
    state['set' + ucFirst(key)] = (value: any) => set(() => ({ [key]: value }))
  }
  return state
}

export const simpleZustandCreate = <T extends InitStateType>(initState: T) => {
  const store = create<SimpleZustandType<T>>((set) => createState(initState, set))
  const hooks: Record<string, any> = {}
  for (const key of Object.keys(initState)) {
    hooks['use' + ucFirst(key)] = () => [store((state) => state[key]), store.getState()['set' + ucFirst(key)]]
  }
  return {
    store,
    hooks: hooks as SimpleZustandHooksType<T>
  }
}
