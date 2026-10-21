import { isPlainObject } from './is-plain-object'

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Merges `source` into `target` without mutating either. Plain objects are merged recursively, every other value
 * (arrays, Date, Map, class instances, ...) is replaced. `undefined` values in `source` are ignored.
 */
export const mergePlain = <T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T => {
  const result: Record<string, unknown> = { ...target }
  for (const key of Object.keys(source)) {
    const value = source[key]
    if (value === undefined || FORBIDDEN_KEYS.has(key)) {
      continue
    }
    const current = result[key]
    result[key] = isPlainObject(current) && isPlainObject(value) ? mergePlain(current, value) : value
  }
  return result as T
}
