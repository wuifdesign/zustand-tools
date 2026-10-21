import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { createHooksObject } from './create-hooks-object'
import { createStore } from './create-store'

describe('createHooksObject', () => {
  it('should create a hook per state key', () => {
    const store = createStore({ foo: 1, barBaz: 2 })
    const hooks = createHooksObject({ initState: { foo: 1, barBaz: 2 }, store: store as any })
    expect(Object.keys(hooks).sort()).toEqual(['useBarBaz', 'useFoo'])
  })

  it('should read from store and update via setter', () => {
    const store = createStore({ foo: 1 })
    const hooks = createHooksObject({ initState: { foo: 1 }, store: store as any })
    const { result } = renderHook(() => hooks.useFoo())
    expect(result.current[0]).toBe(1)
    act(() => result.current[1](4))
    expect(result.current[0]).toBe(4)
    expect(store.getState().foo).toBe(4)
  })

  it('should react to changes made outside of react', () => {
    const store = createStore({ foo: 1 })
    const hooks = createHooksObject({ initState: { foo: 1 }, store: store as any })
    const { result } = renderHook(() => hooks.useFoo())
    act(() => store.getState().setFoo(9))
    expect(result.current[0]).toBe(9)
  })

  it('should not rerender when other keys change', () => {
    const store = createStore({ foo: 1, bar: 1 })
    const hooks = createHooksObject({ initState: { foo: 1, bar: 1 }, store: store as any })
    let renders = 0
    renderHook(() => {
      renders++
      return hooks.useFoo()
    })
    const initial = renders
    act(() => store.getState().setBar(2))
    expect(renders).toBe(initial)
    act(() => store.getState().setFoo(2))
    expect(renders).toBe(initial + 1)
  })

  it('should read from context store', () => {
    const store = createStore({ foo: 1 })
    const StoreContext = React.createContext(store)
    const hooks = createHooksObject({ initState: { foo: 1 }, StoreContext: StoreContext as any })
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    )
    const { result } = renderHook(() => hooks.useFoo(), { wrapper })
    expect(result.current[0]).toBe(1)
  })

  it('should throw when a hook name is reserved', () => {
    expect(() =>
      createHooksObject({
        initState: { allData: 1 },
        StoreContext: React.createContext<any>(null),
        reservedHookNames: ['useAllData']
      })
    ).toThrow(/"allData".*"useAllData"/)
  })

  it('should throw a helpful error when used without store and context value', () => {
    const StoreContext = React.createContext<any>(null)
    const hooks = createHooksObject({ initState: { foo: 1 }, StoreContext })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => hooks.useFoo())).toThrow('useFoo must be used inside its Provider')
    spy.mockRestore()
  })

  it('should throw on creation without store and context', () => {
    // @ts-expect-error the types need a store or a StoreContext
    expect(() => createHooksObject({ initState: { foo: 1 } })).toThrow('needs either a store or a StoreContext')
  })
})
