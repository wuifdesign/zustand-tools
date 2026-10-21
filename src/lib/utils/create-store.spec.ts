import { createStore } from './create-store'
import { persist, subscribeWithSelector } from 'zustand/middleware'

describe('createStore', () => {
  it('should create state with setters for every key', () => {
    const store = createStore({ foo: 1, fooBar: 'a' })
    const state = store.getState()
    expect(Object.keys(state).sort()).toEqual(['foo', 'fooBar', 'setFoo', 'setFooBar'])
  })

  it('should only replace the targeted key', () => {
    const store = createStore({ foo: { a: 1 }, bar: 2 })
    store.getState().setFoo({ a: 5 })
    expect(store.getState().foo).toEqual({ a: 5 })
    expect(store.getState().bar).toBe(2)
  })

  it('should keep setters when state is updated', () => {
    const store = createStore({ foo: 1 })
    const setFoo = store.getState().setFoo
    setFoo(2)
    expect(store.getState().setFoo).toBe(setFoo)
  })

  it('should notify subscribers with new and previous state', () => {
    const store = createStore({ foo: 1 })
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.getState().setFoo(2)
    expect(listener).toBeCalledTimes(1)
    expect(listener).toBeCalledWith(expect.objectContaining({ foo: 2 }), expect.objectContaining({ foo: 1 }))
    unsubscribe()
    store.getState().setFoo(3)
    expect(listener).toBeCalledTimes(1)
  })

  it('should pass set, get and api to actions', () => {
    const store = createStore(
      { foo: 1 },
      {
        actions: (set, get, api) => ({
          double: () => set({ foo: get().foo * 2 }),
          getApi: () => api
        })
      }
    )
    store.getState().double()
    expect(store.getState().foo).toBe(2)
    expect(store.getState().getApi().getState).toBe(store.getState)
  })

  it('should let actions override generated setters', () => {
    const store = createStore({ foo: 1 }, { actions: (set) => ({ setFoo: () => set({ foo: 99 }) }) })
    store.getState().setFoo()
    expect(store.getState().foo).toBe(99)
  })

  it('should apply middlewares in order', () => {
    const calls: string[] = []
    const wrap = (name: string) => (initializer: any) => (set: any, get: any, api: any) => {
      calls.push(name)
      return initializer(set, get, api)
    }
    createStore({ foo: 1 }, { middlewares: [wrap('first'), wrap('second')] as any })
    expect(calls).toEqual(['second', 'first'])
  })

  it('should work with subscribeWithSelector', () => {
    const store = createStore({ foo: 1, bar: 1 }, { middlewares: [subscribeWithSelector as any] })
    const listener = vi.fn()
    ;(store.subscribe as any)((s: any) => s.foo, listener)
    store.getState().setBar(2)
    expect(listener).toBeCalledTimes(0)
    store.getState().setFoo(2)
    expect(listener).toBeCalledWith(2, 1)
  })

  it('should work with persist', () => {
    localStorage.clear()
    const options = { name: 'test-persist', partialize: (s: any) => ({ foo: s.foo }) }
    const middlewares = [((init: any) => persist(init, options)) as any]
    const store = createStore({ foo: 1, bar: 1 }, { middlewares })
    store.getState().setFoo(7)
    expect(JSON.parse(localStorage.getItem('test-persist')!).state).toEqual({ foo: 7 })

    const restored = createStore({ foo: 1, bar: 1 }, { middlewares })
    expect(restored.getState().foo).toBe(7)
    expect(restored.getState().bar).toBe(1)
    expect(typeof restored.getState().setFoo).toBe('function')
  })
})
