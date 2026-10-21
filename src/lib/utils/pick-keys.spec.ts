import { pickKeys } from './pick-keys'

describe('pickKeys', () => {
  it('should pick only the given keys', () => {
    expect(pickKeys({ a: 1, b: 2, setA: () => null }, ['a', 'b'])).toEqual({ a: 1, b: 2 })
  })

  it('should keep keys starting with "set"', () => {
    expect(pickKeys({ settings: 1, other: 2 }, ['settings'])).toEqual({ settings: 1 })
  })

  it('should return an empty object without keys', () => {
    expect(pickKeys({ a: 1 }, [])).toEqual({})
  })
})
