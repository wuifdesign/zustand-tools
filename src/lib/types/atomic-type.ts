type Primitive = string | number | boolean | bigint | symbol | null | undefined

/** Values that are handled as a whole: replaced by `mergePlain` and never a valid state object. */
export type Atomic =
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
