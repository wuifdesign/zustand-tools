import { mergePlain } from './merge-plain'

describe('mergePlain', () => {
  it('should merge plain objects recursively', () => {
    expect(mergePlain({ a: { b: 1, c: 2 }, d: 1 }, { a: { b: 10 } })).toEqual({ a: { b: 10, c: 2 }, d: 1 })
  })

  it('should add keys that only exist in source', () => {
    expect(mergePlain({ a: 1 } as Record<string, unknown>, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('should replace arrays', () => {
    expect(
      mergePlain({ list: [1, 2, 3], nested: { tags: ['a'] } }, { list: [9], nested: { tags: ['b', 'c'] } })
    ).toEqual({ list: [9], nested: { tags: ['b', 'c'] } })
  })

  it('should keep non plain objects by reference', () => {
    class Custom {}
    const date = new Date(0)
    const custom = new Custom()
    const map = new Map()
    const result = mergePlain({ date: new Date(1), custom: new Custom(), map: new Map() }, { date, custom, map })
    expect(result.date).toBe(date)
    expect(result.custom).toBe(custom)
    expect(result.map).toBe(map)
  })

  it('should replace a plain object with a primitive and the other way round', () => {
    expect(mergePlain({ a: { b: 1 }, c: 1 } as Record<string, unknown>, { a: 5, c: { d: 1 } })).toEqual({
      a: 5,
      c: { d: 1 }
    })
  })

  it('should ignore undefined values in source', () => {
    expect(mergePlain({ a: 1, b: { c: 2 } }, { a: undefined, b: { c: undefined } })).toEqual({ a: 1, b: { c: 2 } })
  })

  it('should keep null values from source', () => {
    expect(mergePlain({ a: 1 } as Record<string, unknown>, { a: null })).toEqual({ a: null })
  })

  it('should not mutate target or source', () => {
    const target = { a: { b: 1 } }
    const source = { a: { b: 2 } }
    const result = mergePlain(target, source)
    expect(target).toEqual({ a: { b: 1 } })
    expect(source).toEqual({ a: { b: 2 } })
    expect(result.a).not.toBe(target.a)
  })

  it('should not pollute the prototype', () => {
    const source = JSON.parse('{"__proto__": {"polluted": true}, "constructor": {"prototype": {"polluted": true}}}')
    const result = mergePlain({ a: 1 } as Record<string, unknown>, source)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(result.polluted).toBeUndefined()
    expect(Object.keys(result)).toEqual(['a'])
  })
})
