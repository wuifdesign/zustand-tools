export type CreateSimpleHooksType<State extends { [key: string | number | symbol]: any }> = {
  [Property in keyof State as `use${Capitalize<string & Property>}`]: () => [
    State[Property],
    (value: State[Property]) => void
  ]
}
