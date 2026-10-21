export type CreateSimpleHooksType<State extends object> = {
  [Property in keyof State & string as `use${Capitalize<Property>}`]: () => readonly [
    State[Property],
    (value: State[Property]) => void
  ]
}

/** The data of the store (without setters and actions), like `useAllData` returns it. */
export type UseAllDataType<State extends object> = () => Pick<State, keyof State>
