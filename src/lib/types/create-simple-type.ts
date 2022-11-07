export type CreateSimpleType<T extends { [key: string | number | symbol]: any }> = T & {
  [Property in keyof T as `set${Capitalize<string & Property>}`]: (value: T[Property]) => void
}
