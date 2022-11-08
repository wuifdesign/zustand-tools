import { StoreApi, UseBoundStore } from 'zustand'
import { CreateSimpleType } from './create-simple-type'
import { InitStateType } from './init-state-type'

export type UseBoundStoreType<State extends InitStateType> = UseBoundStore<StoreApi<CreateSimpleType<State>>>
