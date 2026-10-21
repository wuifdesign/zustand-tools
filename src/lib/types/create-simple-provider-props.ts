import type { ReactNode } from 'react'
import type { DeepPartial } from './deep-partial'
import type { InitStateType } from './init-state-type'

export type CreateSimpleProviderProps<State extends InitStateType> = {
  initialValues?: DeepPartial<State>
  children: ReactNode
}
