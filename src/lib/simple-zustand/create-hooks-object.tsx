import { InitStateType, SimpleZustandHooksType, UseBoundStoreType } from './simple-zustand-create.type'
import { ucFirst } from '../utils/uc-first'
import React, { useContext } from 'react'

type CreateHooksObjectOptions<T extends InitStateType> = {
  initState: T
  store?: UseBoundStoreType<T>
  StoreContext?: React.Context<UseBoundStoreType<T>>
}

export const createHooksObject = <T extends InitStateType>({
  initState,
  store,
  StoreContext
}: CreateHooksObjectOptions<T>) => {
  const hooks: Record<string, any> = {}
  for (const key of Object.keys(initState)) {
    hooks['use' + ucFirst(key)] = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const localStore = store || useContext(StoreContext!)
      return [localStore((state) => state[key]), localStore.getState()['set' + ucFirst(key)]]
    }
  }
  return hooks as SimpleZustandHooksType<T>
}
