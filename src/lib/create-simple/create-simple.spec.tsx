import { createSimple } from './create-simple'
import { act, renderHook } from '@testing-library/react'
import { MiddlewareType } from '../types'

const middlewareMock = jest.fn()

const demoMiddleware: MiddlewareType = (config, value) => (set, get, api) =>
  config(
    (args) => {
      middlewareMock(value)
      set(args)
    },
    get,
    api
  )

describe('createSimple', () => {
  beforeEach(() => {
    middlewareMock.mockReset()
  })

  it('should export getter and setter', () => {
    const { getState } = createSimple({
      foo: 1,
      bar: 2
    })
    expect(getState().foo).toBe(1)
    expect(getState().bar).toBe(2)
    getState().setFoo(3)
    expect(getState().foo).toBe(3)
    expect(getState().bar).toBe(2)
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

  it('should export all data hook', () => {
    const { hooks } = createSimple({ foo: 1, bar: 2 })
    const { result } = renderHook(() => hooks.useAllData())
    expect(result.current).toEqual({ foo: 1, bar: 2 })
  })

  it('should create with middleware', () => {
    const { getState } = createSimple(
      { foo: 1 },
      { middlewares: [(initializer) => demoMiddleware(initializer, 'TestValue')] }
    )
    expect(middlewareMock).toBeCalledTimes(0)
    expect(getState().foo).toBe(1)
    getState().setFoo(3)
    expect(getState().foo).toBe(3)
    expect(middlewareMock).toBeCalledTimes(1)
    expect(middlewareMock).toBeCalledWith('TestValue')
  })
})
