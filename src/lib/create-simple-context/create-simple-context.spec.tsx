import { act, render, renderHook, screen } from '@testing-library/react'
import React from 'react'
import { createSimpleContext } from './create-simple-context'
import type { StateCreator } from 'zustand'

const middlewareMock = vi.fn()

const demoMiddleware =
  <State,>(config: StateCreator<State>, value: string): StateCreator<State> =>
  (set, get, api) =>
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

  it('should replace arrays instead of concatenating them', () => {
    const { Provider, hooks } = createSimpleContext({ list: [1, 2, 3], nested: { tags: ['a'] } })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ list: [9], nested: { tags: ['b', 'c'] } }}>{children}</Provider>
    )
    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current).toEqual({ list: [9], nested: { tags: ['b', 'c'] } })
  })

  it('should keep default arrays when not overridden', () => {
    const { Provider, hooks } = createSimpleContext({ list: [1, 2], foo: 1 })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 2 }}>{children}</Provider>
    )
    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current).toEqual({ list: [1, 2], foo: 2 })
  })

  it('should not clone non plain objects from initial values', () => {
    class Custom {
      value = 1
    }
    const date = new Date(0)
    const custom = new Custom()
    const map = new Map([['a', 1]])
    const { Provider, hooks } = createSimpleContext({
      date: new Date(1),
      custom: new Custom(),
      map: new Map<string, number>()
    })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ date, custom, map }}>{children}</Provider>
    )
    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current.date).toBe(date)
    expect(result.current.custom).toBe(custom)
    expect(result.current.map).toBe(map)
  })

  it('should include state keys starting with "set" and exclude actions in all data hook', () => {
    const { Provider, hooks } = createSimpleContext(
      { settings: { dark: true }, setup: 'done' },
      { actions: () => ({ doIt: () => undefined }) }
    )
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <Provider>{children}</Provider>
    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current).toEqual({ settings: { dark: true }, setup: 'done' })
  })

  it('should ignore undefined initial values', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1, bar: { a: 1 } })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: undefined, bar: { a: undefined } }}>{children}</Provider>
    )
    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current).toEqual({ foo: 1, bar: { a: 1 } })
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

  it('should throw a helpful error when a hook is used without provider', () => {
    const { hooks } = createSimpleContext({ foo: 1 })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => hooks.useFoo())).toThrow('useFoo must be used inside its Provider')
    expect(() => renderHook(() => hooks.useAllData())).toThrow('useAllData must be used inside its Provider')
    expect(() => renderHook(() => hooks.useStore())).toThrow('useStore must be used inside its Provider')
    spy.mockRestore()
  })

  it('should throw when a state key collides with a built-in hook', () => {
    // @ts-expect-error rejected by the types as well
    expect(() => createSimpleContext({ allData: 1 })).toThrow(/"allData".*"useAllData"/)
    // @ts-expect-error rejected by the types as well
    expect(() => createSimpleContext({ store: 1 })).toThrow(/"store".*"useStore"/)
  })

  it('should only read initial values once, later changes of the prop are ignored', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1 })
    const Child = () => <span data-testid="value">{hooks.useFoo()[0]}</span>
    const App = ({ foo }: { foo: number }) => (
      <Provider initialValues={{ foo }}>
        <Child />
      </Provider>
    )
    const { rerender } = render(<App foo={5} />)
    expect(screen.getByTestId('value').textContent).toBe('5')
    rerender(<App foo={9} />)
    expect(screen.getByTestId('value').textContent).toBe('5')
  })

  it('should require every state key to be present in the default state', () => {
    // @ts-expect-error optional keys do not get a runtime hook, so they are rejected
    createSimpleContext({} as { foo?: number })
    createSimpleContext({ foo: undefined as number | undefined })
  })

  it('should validate the state when the context is created, not when a Provider mounts', () => {
    expect(() => createSimpleContext({ foo: 1, setFoo: 2 } as { foo: number })).toThrow(/"setFoo"/)
  })

  it('should share the default state when no initial values are given', () => {
    const defaults = { nested: { a: 1 } }
    const { Provider, hooks } = createSimpleContext(defaults)
    const wrapper = ({ children }: { children: React.ReactNode }) => <Provider>{children}</Provider>
    const { result } = renderHook(() => hooks.useNested()[0], { wrapper })
    expect(result.current).toBe(defaults.nested)
  })
})
