import type { DeepPartial } from './deep-partial'

// checked by `tsc --noEmit`
describe('DeepPartial', () => {
  it('should make nested plain objects partial', () => {
    expectTypeOf<DeepPartial<{ a: { b: { c: number; d: string } } }>>().toEqualTypeOf<{
      a?: { b?: { c?: number; d?: string } }
    }>()
  })

  it('should keep primitives', () => {
    expectTypeOf<DeepPartial<{ a: number; b: string; c: boolean; d: null }>>().toEqualTypeOf<{
      a?: number
      b?: string
      c?: boolean
      d?: null
    }>()
  })

  it('should keep arrays as a whole because they are replaced, not merged', () => {
    expectTypeOf<DeepPartial<{ list: { id: number }[]; tuple: readonly [number, string] }>>().toEqualTypeOf<{
      list?: { id: number }[]
      tuple?: readonly [number, string]
    }>()
  })

  it('should keep functions, Date, RegExp, Map and Set as a whole', () => {
    type State = {
      fn: (value: number) => string
      date: Date
      regExp: RegExp
      map: Map<string, { a: number }>
      set: Set<{ a: number }>
    }
    expectTypeOf<DeepPartial<State>>().toEqualTypeOf<{
      fn?: (value: number) => string
      date?: Date
      regExp?: RegExp
      map?: Map<string, { a: number }>
      set?: Set<{ a: number }>
    }>()
  })

  it('should handle optional and nullable objects', () => {
    expectTypeOf<DeepPartial<{ a?: { b: number }; c: { d: number } | null }>>().toEqualTypeOf<{
      a?: { b?: number }
      c?: { d?: number } | null
    }>()
  })
})
