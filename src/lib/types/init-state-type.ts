// `object` instead of `Record<string, any>`: no `any` leaks into the types and interfaces are accepted as well
// (interfaces have no implicit index signature, so they are not assignable to `Record<string, unknown>`)
export type InitStateType = object

/**
 * Intersected with the state argument to reject states the generated hooks and setters can not represent:
 * optional keys (no runtime hook/setter) and number/symbol keys (no hook name).
 */
export type ValidInitState<State extends InitStateType> = {
  [Key in keyof State]-?: Key extends string ? State[Key] : never
}
