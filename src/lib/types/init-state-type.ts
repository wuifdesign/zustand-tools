import type { Atomic } from './atomic-type'

// `object` instead of `Record<string, any>`: no `any` leaks into the types and interfaces are accepted as well
// (interfaces have no implicit index signature, so they are not assignable to `Record<string, unknown>`)
export type InitStateType = object

/**
 * Intersected with the state argument to reject states the generated hooks and setters can not represent:
 * - arrays, functions, `Date`, `Map`, ... (not a record of named values)
 * - optional keys (no runtime hook/setter) and number/symbol keys (no hook name)
 * - empty keys and keys colliding with a built-in hook (`ReservedKey`, compared as hook name: `Capitalize`)
 * - keys whose generated setter is a state key as well (`foo` and `setFoo`)
 * Index signatures (`Record<string, T>`) are accepted, their keys are not known.
 */
export type ValidInitState<State extends InitStateType, ReservedKey extends string = 'allData'> = State extends Atomic
  ? never
  : {
      [Key in keyof State]-?: Key extends string
        ? string extends Key
          ? State[Key]
          : Key extends ''
            ? never
            : Capitalize<Key> extends Capitalize<ReservedKey>
              ? never
              : `set${Capitalize<Key>}` extends keyof State
                ? never
                : State[Key]
        : never
    }
