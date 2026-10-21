export const pickKeys = <T extends object, K extends keyof T>(value: T, keys: readonly K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    result[key] = value[key]
  }
  return result
}
