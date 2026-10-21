import React from 'react'
import { renderHook } from '@testing-library/react'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { createSimple, createSimpleContext } from '../index'
import { createStore } from '../utils/create-store'
import type {
  ActionsType,
  CreateSimpleHooksType,
  CreateSimpleOptions,
  CreateSimpleProviderProps,
  CreateSimpleType,
  DeepPartial,
  InitStateType,
  UseBoundStoreType
} from '../index'

const typeOnly = (_check: () => void) => undefined

// everything in here is checked by `tsc --noEmit` (npm run test:typecheck), the runtime part just keeps vitest happy
describe('types', () => {
  it('should export the public types from the package entry', () => {
    expectTypeOf<DeepPartial<{ a: { b: number } }>>().toEqualTypeOf<{ a?: { b?: number } }>()
    expectTypeOf<CreateSimpleType<{ foo: number }>>().toHaveProperty('setFoo')
    expectTypeOf<CreateSimpleHooksType<{ foo: number }>>().toHaveProperty('useFoo')
    expectTypeOf<UseBoundStoreType<{ foo: number }>>().toHaveProperty('getState')
    expectTypeOf<{ foo: number }>().toExtend<InitStateType>()
    expectTypeOf<CreateSimpleOptions<{ foo: number }, ActionsType<{ foo: number }>>>().toHaveProperty('actions')
  })

  it('should accept interfaces as state', () => {
    interface State {
      foo: number
      nested: { a: string }
    }
    const state: State = { foo: 1, nested: { a: 'a' } }
    const { useStore } = createSimple(state)
    expectTypeOf(useStore.getState().foo).toEqualTypeOf<number>()
    expectTypeOf(useStore.getState().nested).toEqualTypeOf<{ a: string }>()
    createSimpleContext(state)
  })

  it('should reject non object state', () => {
    // @ts-expect-error state has to be an object
    createSimple(1)
    // @ts-expect-error state has to be an object
    createSimpleContext('a')
  })

  it('should keep literal state types and generate typed setters', () => {
    const { useStore, hooks } = createSimple({ foo: 1, name: 'a' })
    expectTypeOf(useStore.getState().foo).toEqualTypeOf<number>()
    expectTypeOf(useStore.getState().setName).toEqualTypeOf<(value: string) => void>()
    expectTypeOf(hooks.useName).returns.toEqualTypeOf<readonly [string, (value: string) => void]>()
    // @ts-expect-error there is no key "bar"
    void hooks.useBar
  })

  it('should type actions with their own parameters', () => {
    const { useStore } = createSimple(
      { foo: 1 },
      { actions: (set) => ({ increase: (amount: number) => set((state) => ({ foo: state.foo + amount })) }) }
    )
    expectTypeOf(useStore.getState().increase).parameters.toEqualTypeOf<[number]>()
    // @ts-expect-error amount has to be a number
    useStore.getState().increase('1')
    // @ts-expect-error actions do not get a generated setter
    void useStore.getState().setIncrease
  })

  it('should only accept functions as actions', () => {
    // @ts-expect-error an action has to be a function
    createSimple({ foo: 1 }, { actions: () => ({ notAFunction: 1 }) })
  })

  it('should not generate setters for actions in the context store type', () => {
    const { Provider, hooks } = createSimpleContext(
      { foo: 1 },
      { actions: () => ({ increase: (amount: number) => amount }) }
    )
    const { result } = renderHook(() => hooks.useStore().getState(), {
      wrapper: ({ children }: { children: React.ReactNode }) => <Provider>{children}</Provider>
    })
    expectTypeOf(result.current.foo).toEqualTypeOf<number>()
    expectTypeOf(result.current.setFoo).toBeFunction()
    expectTypeOf(result.current.increase).parameters.toEqualTypeOf<[number]>()
    // @ts-expect-error actions do not get a generated setter
    void result.current.setIncrease
  })

  it('should type the state seen by middlewares including setters and actions', () => {
    createSimple(
      { foo: 1 },
      {
        actions: () => ({ increase: () => undefined }),
        middlewares: [
          (initializer) => {
            expectTypeOf(initializer).parameter(0).toBeFunction()
            return initializer
          }
        ]
      }
    )
  })

  it('should only allow string keys', () => {
    // @ts-expect-error numeric keys have no hook name
    createSimple({ 1: 'a' })
    // @ts-expect-error numeric keys have no hook name
    createSimpleContext({ 1: 'a' })
  })

  it('should reject names that collide with generated or built-in names', () => {
    // never called: the invalid calls only have to fail the type check
    typeOnly(() => {
      // @ts-expect-error the hook useAllData is built in
      createSimple({ allData: 1 })
      // @ts-expect-error the hook useAllData is built in (any casing of the first letter)
      createSimple({ AllData: 1 })
      // @ts-expect-error the hook useStore is built in
      createSimpleContext({ store: 1 })
      // @ts-expect-error "foo" would get the setter "setFoo", which is a state key
      createSimple({ foo: 1, setFoo: 2 })
      // @ts-expect-error the empty key has no hook name
      createSimple({ '': 1 })
      // "store" is only built in for the context version
      createSimple({ store: 1 })
    })
  })

  it('should reject states that are no records of named values', () => {
    // never called: the invalid calls only have to fail the type check
    typeOnly(() => {
      // @ts-expect-error arrays have no named keys
      createSimple([1, 2])
      // @ts-expect-error functions have no named keys
      createSimple(() => 1)
      // @ts-expect-error a Map is not a record of named values
      createSimple(new Map<string, number>())
      // @ts-expect-error a Date is not a record of named values
      createSimpleContext(new Date())
    })
  })

  it('should accept states with an index signature', () => {
    const { hooks } = createSimple({} as Record<string, number>)
    expectTypeOf(hooks.useAllData).returns.toEqualTypeOf<Record<string, number>>()
  })

  it('should reject actions with the name of a state key', () => {
    // never called: the invalid calls only have to fail the type check
    typeOnly(() => {
      // @ts-expect-error a state key would be dropped
      createSimple({ foo: 1 }, { actions: () => ({ foo: () => undefined }) })
      // @ts-expect-error a state key would be dropped
      createSimpleContext({ foo: 1 }, { actions: () => ({ foo: () => undefined }) })
      // overriding a generated setter is allowed
      createSimple({ foo: 1 }, { actions: () => ({ setFoo: () => undefined }) })
    })
  })

  it('should reject middlewares that are none', () => {
    // never called: the invalid calls only have to fail the type check
    typeOnly(() => {
      // @ts-expect-error not a middleware
      createSimple({ foo: 1 }, { middlewares: [() => 1] })
      // @ts-expect-error not a function
      createSimple({ foo: 1 }, { middlewares: [1] })
    })
  })

  it('should type useAllData as the data of the state without setters and actions', () => {
    const { hooks } = createSimple({ foo: 1, name: 'a' }, { actions: () => ({ increase: () => undefined }) })
    expectTypeOf(hooks.useAllData).returns.toEqualTypeOf<{ foo: number; name: string }>()
    const context = createSimpleContext({ foo: 1 })
    expectTypeOf(context.hooks.useAllData).returns.toEqualTypeOf<{ foo: number }>()
  })

  it('should export the props of the provider', () => {
    expectTypeOf<CreateSimpleProviderProps<{ a: { b: number } }>>().toEqualTypeOf<{
      initialValues?: { a?: { b?: number } }
      children: React.ReactNode
    }>()
  })

  it('should not change the hook types when actions are added', () => {
    const { hooks } = createSimple({ foo: 1 }, { actions: () => ({ increase: () => undefined }) })
    expectTypeOf(Object.keys(hooks)).toEqualTypeOf<string[]>()
    expectTypeOf(hooks.useFoo).returns.toEqualTypeOf<readonly [number, (value: number) => void]>()
    // @ts-expect-error actions do not get a hook
    void hooks.useIncrease
  })

  it('should type the store created by createStore without any', () => {
    const store = createStore({ foo: 1, name: 'a' })
    expectTypeOf(store.getState().foo).toEqualTypeOf<number>()
    expectTypeOf(store.getState().setName).toEqualTypeOf<(value: string) => void>()
    // @ts-expect-error unknown key
    void store.getState().bar
  })

  describe('middlewares', () => {
    it('should expose the api added by middlewares', () => {
      const { useStore } = createSimple(
        { foo: 1 },
        {
          middlewares: [
            (initializer) => persist(initializer, { name: 'types-test' }),
            (initializer) => subscribeWithSelector(initializer)
          ]
        }
      )
      expectTypeOf(useStore.persist.rehydrate).toBeFunction()
      expectTypeOf(useStore.subscribe).toBeFunction()
      useStore.subscribe(
        (state) => state.foo,
        (foo) => expectTypeOf(foo).toEqualTypeOf<number>()
      )
    })

    it('should keep the state typed for middlewares with options', () => {
      const { useStore } = createSimple(
        { foo: 1 },
        { middlewares: [(initializer) => devtools(initializer, { enabled: false })] }
      )
      expectTypeOf(useStore.getState().foo).toEqualTypeOf<number>()
    })

    it('should not have middleware api without the middleware', () => {
      const { useStore } = createSimple({ foo: 1 })
      // @ts-expect-error persist was not added
      void useStore.persist
    })

    it('should expose the api added by middlewares on the context store', () => {
      const { Provider, hooks } = createSimpleContext(
        { foo: 1 },
        { middlewares: [(initializer) => persist(initializer, { name: 'types-test-context' })] }
      )
      const { result } = renderHook(() => hooks.useStore(), {
        wrapper: ({ children }: { children: React.ReactNode }) => <Provider>{children}</Provider>
      })
      expectTypeOf(result.current.persist.rehydrate).toBeFunction()
    })
  })

  it('should map every key to its hook name', () => {
    const { hooks } = createSimple({ a: 1, fooBar: 'a', FooBaz: true, snake_case: null as null | string })
    expectTypeOf(hooks.useA).returns.toEqualTypeOf<readonly [number, (value: number) => void]>()
    expectTypeOf(hooks.useFooBar).returns.toEqualTypeOf<readonly [string, (value: string) => void]>()
    expectTypeOf(hooks.useFooBaz).returns.toEqualTypeOf<readonly [boolean, (value: boolean) => void]>()
    expectTypeOf(hooks.useSnake_case).returns.toEqualTypeOf<readonly [string | null, (value: string | null) => void]>()
  })

  it('should type the initial values of the provider as deep partial of the state', () => {
    const { Provider } = createSimpleContext({ foo: { a: 1, b: 'b' }, list: [1], bar: 1 })
    expectTypeOf(Provider).parameter(0).toHaveProperty('initialValues')
    const valid = <Provider initialValues={{ foo: { a: 2 }, list: [2, 3] }}>child</Provider>
    const empty = <Provider>child</Provider>
    // @ts-expect-error a has to be a number
    const wrongNested = <Provider initialValues={{ foo: { a: 'a' } }}>child</Provider>
    // @ts-expect-error unknown key
    const unknownKey = <Provider initialValues={{ nope: 1 }}>child</Provider>
    expect([valid, empty, wrongNested, unknownKey]).toHaveLength(4)
  })

  describe('actions', () => {
    it('should type set, get and the store with the generated setters', () => {
      createSimple(
        { foo: 1, name: 'a' },
        {
          actions: (set, get, store) => {
            return {
              // not called: the state does not exist yet while the actions are created
              typeProbe: () => {
                expectTypeOf(get().foo).toEqualTypeOf<number>()
                expectTypeOf(get().setName).toEqualTypeOf<(value: string) => void>()
                expectTypeOf(store.getState().setFoo).toEqualTypeOf<(value: number) => void>()
              },
              reset: () => get().setFoo(0),
              increase: () => set((state) => ({ foo: state.foo + 1 })),
              rename: (name: string) => set({ name }),
              // @ts-expect-error name has to be a string
              invalid: () => set({ name: 1 }),
              // @ts-expect-error there is no key "nope"
              unknown: () => get().nope
            }
          }
        }
      )
    })

    it('should type the actions of the context version as well', () => {
      createSimpleContext(
        { foo: 1 },
        { actions: (_set, get) => ({ reset: () => get().setFoo(0), read: () => get().foo }) }
      )
    })
  })
})
