export type CreateSimpleHooksType<State extends object> = {
  [Property in keyof State & string as `use${Capitalize<Property>}`]: () => readonly [
    State[Property],
    (value: State[Property]) => void
  ]
}
