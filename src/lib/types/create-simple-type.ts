export type CreateSimpleType<State extends object> = State & {
  [Property in keyof State as `set${Capitalize<string & Property>}`]: (value: State[Property]) => void
}
