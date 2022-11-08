import React, { useContext } from 'react'
import { CreateSimpleHooksType, InitStateType, UseBoundStoreType } from '../types'
import { ucFirst } from './uc-first'
import { ActionsType } from '../types/create-simple-options'

type CreateHooksObjectOptions<T extends InitStateType, A extends ActionsType<T>> = {
  initState: T
  store?: UseBoundStoreType<T & ReturnType<A>>
  StoreContext?: React.Context<UseBoundStoreType<T & ReturnType<A>>>
}

export const createHooksObject = <T extends InitStateType, A extends ActionsType<T>>({
  initState,
  store,
  StoreContext
}: CreateHooksObjectOptions<T, A>) => {
  const hooks: Record<string, any> = {}
  for (const key of Object.keys(initState)) {
    hooks['use' + ucFirst(key)] = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const localStore = store || useContext(StoreContext!)
      return [localStore((state) => state[key]), localStore.getState()['set' + ucFirst(key)]]
    }
  }
  return hooks as CreateSimpleHooksType<T>
}
