export type CreateSimpleHooksType<T extends { [key: string | number | symbol]: any }> = {
  [Property in keyof T as `use${Capitalize<string & Property>}`]: () => [T[Property], (value: T[Property]) => void]
}
