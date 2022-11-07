import { InitStateType } from './init-state-type'
import { StateCreator } from 'zustand'

type MiddlewareOptionType<T extends InitStateType> = (initializer: StateCreator<T>) => StateCreator<T, any, any>

export type CreateSimpleOptions<T extends InitStateType> = {
  middlewares?: MiddlewareOptionType<T>[]
}
