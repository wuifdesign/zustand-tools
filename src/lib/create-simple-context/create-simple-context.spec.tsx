import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { createSimpleContext } from './create-simple-context'
import { MiddlewareType } from '../types'

const middlewareMock = vi.fn()

const demoMiddleware: MiddlewareType = (config, value) => (set, get, api) =>
  config(
    (args) => {
      middlewareMock(value)
      set(args)
    },
    get,
    api
  )

describe('simpleZustandCreate', () => {
  it('should create provider', () => {
    const { Provider } = createSimpleContext({ foo: 1 })
    expect(Provider).toBeTruthy()
  })

  it('should export hooks', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1 })

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 20 }}>{children}</Provider>
    )

    const { result } = renderHook(() => hooks.useFoo(), { wrapper })
    expect(result.current).toEqual([20, expect.any(Function)])
    act(() => {
      result.current[1](5)
    })
    expect(result.current[0]).toBe(5)
  })

  it('should export all data hook', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1, bar: 2 })

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 20 }}>{children}</Provider>
    )

    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current).toEqual({ bar: 2, foo: 20 })
  })

  it('should create with middleware', () => {
    const { Provider, hooks } = createSimpleContext(
      { foo: 1 },
      { middlewares: [(initializer) => demoMiddleware(initializer, 'TestValue')] }
    )

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 20 }}>{children}</Provider>
    )

    const { result } = renderHook(() => hooks.useStore(), { wrapper })
    const getState = result.current.getState
    expect(middlewareMock).toBeCalledTimes(0)
    expect(getState().foo).toBe(20)
    getState().setFoo(3)
    expect(getState().foo).toBe(3)
    expect(middlewareMock).toBeCalledTimes(1)
    expect(middlewareMock).toBeCalledWith('TestValue')
  })

  it('should create additional actions', () => {
    const { Provider, hooks } = createSimpleContext(
      { foo: 1 },
      {
        actions: (set) => ({
          increaseFoo: (amount: number) => set((state) => ({ foo: state.foo + amount }))
        })
      }
    )

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 20 }}>{children}</Provider>
    )

    const { result } = renderHook(() => hooks.useStore(), { wrapper })
    const getState = result.current.getState
    expect(getState().foo).toBe(20)
    getState().increaseFoo(5)
    expect(getState().foo).toBe(25)
  })

  it('should deep merge initial values', () => {
    const { Provider, hooks } = createSimpleContext({ foo: { a: 1, b: 2 }, bar: 1 })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: { a: 10 } }}>{children}</Provider>
    )
    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current).toEqual({ foo: { a: 10, b: 2 }, bar: 1 })
  })

  it('should use default state without initial values', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1 })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>
    const { result } = renderHook(() => hooks.useFoo(), { wrapper })
    expect(result.current[0]).toBe(1)
  })

  it('should not mutate default state', () => {
    const defaults = { foo: { a: 1 } }
    const { Provider, hooks } = createSimpleContext(defaults)
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: { a: 2 } }}>{children}</Provider>
    )
    renderHook(() => hooks.useFoo(), { wrapper })
    expect(defaults).toEqual({ foo: { a: 1 } })
  })

  it('should isolate state between providers', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1 })
    const make =
      (initial: number): React.FC<{ children: React.ReactNode }> =>
      ({ children }) => <Provider initialValues={{ foo: initial }}>{children}</Provider>
    const a = renderHook(() => hooks.useFoo(), { wrapper: make(1) })
    const b = renderHook(() => hooks.useFoo(), { wrapper: make(1) })
    act(() => a.result.current[1](50))
    expect(a.result.current[0]).toBe(50)
    expect(b.result.current[0]).toBe(1)
  })

  it('should keep the same store when provider rerenders', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1 })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>
    const { result, rerender } = renderHook(() => hooks.useStore(), { wrapper })
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('should update all data hook on changes', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1, bar: 2 })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>
    const { result } = renderHook(() => ({ all: hooks.useAllData(), foo: hooks.useFoo() }), { wrapper })
    act(() => result.current.foo[1](3))
    expect(result.current.all).toEqual({ foo: 3, bar: 2 })
  })

  it('should throw when hook is used without provider', () => {
    const { hooks } = createSimpleContext({ foo: 1 })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => hooks.useFoo())).toThrow()
    spy.mockRestore()
  })
})
