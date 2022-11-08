import { InitStateType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import { CreateSimpleOptions } from '../types/create-simple-options'
import shallow from 'zustand/shallow'
import { filterObjectByKey } from '../utils/filter-object-by-key'

export const createSimple = <T extends InitStateType>(initState: T, options: CreateSimpleOptions<T> = {}) => {
  const useStore = createStore(initState, options)
  return {
    ...useStore,
    hooks: {
      useAllData: () => useStore((state) => filterObjectByKey(state, (key) => !key.startsWith('set')), shallow),
      ...createHooksObject<T>({ initState, store: useStore })
    }
  }
}
