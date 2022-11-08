export type CreateSimpleType<State extends { [key: string | number | symbol]: any }> = State & {
  [Property in keyof State as `set${Capitalize<string & Property>}`]: (value: State[Property]) => void
}
