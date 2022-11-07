import { createSimple } from './create-simple'
import { act, renderHook } from '@testing-library/react'

describe('createSimple', () => {
  it('should export getter and setter', () => {
    const { store } = createSimple({
      foo: 1,
      bar: 2
    })
    expect(store.getState().foo).toBe(1)
    expect(store.getState().bar).toBe(2)
    store.getState().setFoo(3)
    expect(store.getState().foo).toBe(3)
  })

  it('should export hooks', () => {
    const { hooks } = createSimple({ foo: 1 })
    const { result } = renderHook(() => hooks.useFoo())
    expect(result.current).toEqual([1, expect.any(Function)])
    act(() => {
      result.current[1](5)
    })
    expect(result.current[0]).toBe(5)
  })
})
