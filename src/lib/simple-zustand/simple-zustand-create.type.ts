import { StateCreator, StoreApi } from 'zustand/vanilla'
import { UseBoundStore } from 'zustand/react'

export type InitStateType = Record<string, any>

export type SimpleZustandType<T extends { [key: string | number | symbol]: any }> = T & {
  [Property in keyof T as `set${Capitalize<string & Property>}`]: (value: T[Property]) => void
}

export type SimpleZustandHooksType<T extends { [key: string | number | symbol]: any }> = {
  [Property in keyof T as `use${Capitalize<string & Property>}`]: () => [T[Property], (value: T[Property]) => void]
}

export type MiddlewareType<T extends InitStateType> = (initializer: StateCreator<T>) => StateCreator<T, any, any>

export type UseBoundStoreType<T extends InitStateType> = UseBoundStore<StoreApi<SimpleZustandType<T>>>
