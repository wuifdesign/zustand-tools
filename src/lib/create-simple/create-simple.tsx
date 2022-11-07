import { InitStateType, MiddlewareType } from '../types'
import { createHooksObject } from '../utils/create-hooks-object'
import { createStore } from '../utils/create-store'

export const createSimple = <T extends InitStateType>(initState: T, middlewares: MiddlewareType<T>[] = []) => {
  const store = createStore(initState, middlewares)
  return {
    ...store,
    hooks: createHooksObject<T>({ initState, store })
  }
}
