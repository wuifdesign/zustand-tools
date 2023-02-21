import { CreateSimpleType, InitStateType } from '../types'
import { ucFirst } from './uc-first'
import { create, StateCreator, StoreApi } from 'zustand'
import { ActionsType, CreateSimpleOptions } from '../types/create-simple-options'

const createState = (initState: InitStateType, set: StoreApi<InitStateType>['setState']): any => {
  const state: Record<string, any> = {}
  for (const [key, value] of Object.entries(initState)) {
    state[key] = value
    state['set' + ucFirst(key)] = (value: any) => set(() => ({ [key]: value }))
  }
  return state
}

export const createStore = <State extends InitStateType, Actions extends ActionsType<State>>(
  initState: State,
  { middlewares = [], actions }: CreateSimpleOptions<State, Actions> = {}
) => {
  let initializer: StateCreator<CreateSimpleType<State> & ReturnType<Actions>> = (set, get, api) => ({
    ...createState(initState, set),
    ...(actions ? actions(set, get, api) : {})
  })
  for (const middleware of middlewares) {
    initializer = middleware(initializer)
  }
  return create(initializer)
}
