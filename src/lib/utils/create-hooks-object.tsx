import React, { useContext } from 'react'
import { CreateSimpleHooksType, InitStateType, UseBoundStoreType } from '../types'
import { ucFirst } from './uc-first'
import { ActionsType } from '../types/create-simple-options'

type CreateHooksObjectOptions<State extends InitStateType, Actions extends ActionsType<State>> = {
  initState: State
  store?: UseBoundStoreType<State & ReturnType<Actions>>
  StoreContext?: React.Context<UseBoundStoreType<State & ReturnType<Actions>>>
}

export const createHooksObject = <State extends InitStateType, Actions extends ActionsType<State>>({
  initState,
  store,
  StoreContext
}: CreateHooksObjectOptions<State, Actions>) => {
  const hooks: Record<string, any> = {}
  for (const key of Object.keys(initState)) {
    hooks['use' + ucFirst(key)] = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const localStore = store || useContext(StoreContext!)
      return [localStore((state) => state[key]), localStore.getState()['set' + ucFirst(key)]]
    }
  }
  return hooks as CreateSimpleHooksType<State>
}
