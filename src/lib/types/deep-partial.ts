type Primitive = string | number | boolean | bigint | symbol | null | undefined

// values that are replaced as a whole (see `mergePlain`) and therefore must not become partial
type Atomic =
  | Primitive
  | ((...args: never[]) => unknown)
  | readonly unknown[]
  | Date
  | RegExp
  | Map<unknown, unknown>
  | Set<unknown>
  | WeakMap<WeakKey, unknown>
  | WeakSet<WeakKey>
  | Promise<unknown>

export type DeepPartial<T> = T extends Atomic
  ? T
  : T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>
      }
    : T
