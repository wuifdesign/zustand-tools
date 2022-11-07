import { StateCreator } from 'zustand/esm/vanilla'
import { InitStateType } from './init-state-type'

export type MiddlewareType<T extends InitStateType> = (initializer: StateCreator<T>) => StateCreator<T, any, any>
