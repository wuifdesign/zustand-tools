import { StoreApi } from 'zustand/vanilla'
import { UseBoundStore } from 'zustand/react'
import { CreateSimpleType } from './create-simple-type'
import { InitStateType } from './init-state-type'

export type UseBoundStoreType<T extends InitStateType> = UseBoundStore<StoreApi<CreateSimpleType<T>>>
