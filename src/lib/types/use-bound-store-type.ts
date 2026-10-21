import type { Mutate, StoreApi, StoreMutatorIdentifier, UseBoundStore } from 'zustand'
import type { CreateSimpleType } from './create-simple-type'
import type { InitStateType } from './init-state-type'

export type StoreMutators = [StoreMutatorIdentifier, unknown][]

/** `Mutators` are the store mutators added by middlewares (e.g. `persist`, `subscribeWithSelector`). */
export type UseBoundStoreType<State extends InitStateType, Actions extends object = {}, Mutators = []> = UseBoundStore<
  Mutate<StoreApi<CreateSimpleType<State> & Actions>, Mutators extends StoreMutators ? Mutators : []>
>
