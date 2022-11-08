import { InitStateType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'
import { CreateSimpleOptions } from '../types/create-simple-options'

export const createSimple = <T extends InitStateType>(initState: T, options: CreateSimpleOptions<T> = {}) => {
  const store = createStore(initState, options)
  return {
    ...store,
    hooks: createHooksObject<T>({ initState, store })
  }
}
