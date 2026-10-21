import { ucFirst } from './uc-first'

export type KeyNames = { readonly hookName: string; readonly setterName: string }

// the keys come from the state definitions in the code, so the cache stays small
const cache = new Map<string, KeyNames>()

/** Names generated for a state key, computed once per key and shared by the store, the hooks and every Provider. */
export const getKeyNames = (key: string): KeyNames => {
  let names = cache.get(key)
  if (!names) {
    const name = ucFirst(key)
    names = { hookName: 'use' + name, setterName: 'set' + name }
    cache.set(key, names)
  }
  return names
}
