export const filterObjectByKey = (value: Record<string, any>, filterFunction: (key: string) => boolean) => {
  return Object.fromEntries(Object.entries(value).filter(([key]) => filterFunction(key)))
}
