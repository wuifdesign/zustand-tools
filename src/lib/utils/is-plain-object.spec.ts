import { isPlainObject } from './is-plain-object'

describe('isPlainObject', () => {
  it('should accept plain objects', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
  })

  it('should reject everything else', () => {
    class Custom {}
    for (const value of [null, undefined, 1, 'a', [], new Date(), new Map(), new Set(), new Custom(), () => null]) {
      expect(isPlainObject(value)).toBe(false)
    }
  })
})
