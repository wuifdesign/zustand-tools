import { InitStateType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import { ActionsType, CreateSimpleOptions } from '../types/create-simple-options'
import shallow from 'zustand/shallow'
import { filterObjectByKey } from '../utils/filter-object-by-key'

export const createSimple = <T extends InitStateType, A extends ActionsType<T>>(
  initState: T,
  options: CreateSimpleOptions<T, A> = {}
) => {
  const useStore = createStore(initState, options)
  return {
    ...useStore,
    hooks: {
      useAllData: () => useStore((state) => filterObjectByKey(state, (key) => !key.startsWith('set')), shallow),
      ...createHooksObject<T, A>({ initState, store: useStore })
    }
  }
}
