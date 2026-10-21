import { createSimple } from './create-simple'
import { act, renderHook } from '@testing-library/react'
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

describe('createSimple', () => {
  beforeEach(() => {
    middlewareMock.mockReset()
  })

  it('should export getter and setter', () => {
    const {
      useStore: { getState }
    } = createSimple({
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
    const {
      useStore: { getState }
    } = createSimple({ foo: 1 }, { middlewares: [(initializer) => demoMiddleware(initializer, 'TestValue')] })
    expect(middlewareMock).toBeCalledTimes(0)
    expect(getState().foo).toBe(1)
    getState().setFoo(3)
    expect(getState().foo).toBe(3)
    expect(middlewareMock).toBeCalledTimes(1)
    expect(middlewareMock).toBeCalledWith('TestValue')
  })

  it('should create additional actions', () => {
    const {
      useStore: { getState }
    } = createSimple(
      { foo: 1 },
      {
        actions: (set) => ({
          increaseFoo: (amount: number) => set((state) => ({ foo: state.foo + amount }))
        })
      }
    )
    expect(getState().foo).toBe(1)
    getState().increaseFoo(5)
    expect(getState().foo).toBe(6)
  })

  it('should update all data hook on changes', () => {
    const { hooks, useStore } = createSimple({ foo: 1, bar: 2 })
    const { result } = renderHook(() => hooks.useAllData())
    act(() => useStore.getState().setBar(5))
    expect(result.current).toEqual({ foo: 1, bar: 5 })
  })

  it('should not rerender all data hook when state is set to equal value', () => {
    const { hooks, useStore } = createSimple({ foo: 1 })
    let renders = 0
    renderHook(() => {
      renders++
      return hooks.useAllData()
    })
    const initial = renders
    act(() => useStore.getState().setFoo(1))
    expect(renders).toBe(initial)
  })

  it('should exclude generated setters and custom actions from all data hook', () => {
    const { hooks } = createSimple({ foo: 1 }, { actions: () => ({ doIt: () => undefined }) })
    const { result } = renderHook(() => hooks.useAllData())
    expect(result.current).toEqual({ foo: 1 })
  })

  it('should include state keys starting with "set" in all data hook', () => {
    const { hooks, useStore } = createSimple({ settings: { dark: true }, setup: 'done', foo: 1 })
    const { result } = renderHook(() => hooks.useAllData())
    expect(result.current).toEqual({ settings: { dark: true }, setup: 'done', foo: 1 })
    act(() => useStore.getState().setSettings({ dark: false }))
    expect(result.current).toEqual({ settings: { dark: false }, setup: 'done', foo: 1 })
  })

  it('should share state between hooks and store', () => {
    const { hooks, useStore } = createSimple({ foo: 1 })
    const { result } = renderHook(() => hooks.useFoo())
    act(() => useStore.getState().setFoo(8))
    expect(result.current[0]).toBe(8)
  })

  it('should work as selector hook on useStore', () => {
    const { useStore } = createSimple({ foo: 1, bar: 2 })
    const { result } = renderHook(() => useStore((s) => s.bar))
    expect(result.current).toBe(2)
  })

  it('should keep separate state per createSimple call', () => {
    const a = createSimple({ foo: 1 })
    const b = createSimple({ foo: 1 })
    a.useStore.getState().setFoo(2)
    expect(b.useStore.getState().foo).toBe(1)
  })

  it('should throw when a state key collides with the built-in all data hook', () => {
    // @ts-expect-error rejected by the types as well
    expect(() => createSimple({ allData: 1 })).toThrow(/"allData".*"useAllData"/)
  })

  it('should allow a state key named "store"', () => {
    const { hooks } = createSimple({ store: 1 })
    const { result } = renderHook(() => hooks.useStore())
    expect(result.current[0]).toBe(1)
  })

  it('should store functions as values instead of treating them as updaters', () => {
    const { useStore } = createSimple({ callback: (() => 'a') as () => string })
    const next = () => 'b'
    useStore.getState().setCallback(next)
    expect(useStore.getState().callback).toBe(next)
  })

  it('should create hooks for keys with an explicit undefined value', () => {
    const { hooks, useStore } = createSimple({ user: undefined as { name: string } | undefined })
    const { result } = renderHook(() => hooks.useUser())
    expect(result.current[0]).toBeUndefined()
    act(() => useStore.getState().setUser({ name: 'a' }))
    expect(result.current[0]).toEqual({ name: 'a' })
  })

  it('should require every state key to be present in the initial state', () => {
    // @ts-expect-error optional keys do not get a runtime hook, so they are rejected
    createSimple({} as { foo?: number })
    createSimple({ foo: undefined as number | undefined })
  })

  it('should let actions use the generated setters through get and the store', () => {
    const { useStore } = createSimple(
      { foo: 1, bar: 2 },
      {
        actions: (_set, get, store) => ({
          resetFoo: () => get().setFoo(0),
          resetBar: () => store.getState().setBar(0)
        })
      }
    )
    useStore.getState().setFoo(5)
    useStore.getState().setBar(6)
    useStore.getState().resetFoo()
    useStore.getState().resetBar()
    expect(useStore.getState().foo).toBe(0)
    expect(useStore.getState().bar).toBe(0)
  })
})
