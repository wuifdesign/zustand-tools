import type { Atomic } from './atomic-type'

export type DeepPartial<T> = T extends Atomic
  ? T
  : T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>
      }
    : T
