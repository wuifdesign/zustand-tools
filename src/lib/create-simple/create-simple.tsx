import { InitStateType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import { ActionsType, CreateSimpleOptions } from '../types/create-simple-options'
import shallow from 'zustand/shallow'
import { filterObjectByKey } from '../utils/filter-object-by-key'

export const createSimple = <State extends InitStateType, Actions extends ActionsType<State>>(
  initState: State,
  options: CreateSimpleOptions<State, Actions> = {}
) => {
  const useStore = createStore(initState, options)
  return {
    useStore,
    hooks: {
      useAllData: () => useStore((state) => filterObjectByKey(state, (key) => !key.startsWith('set')), shallow),
      ...createHooksObject<State, Actions>({ initState, store: useStore })
    }
  }
}
