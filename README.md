# Zustand Tools

![Test](https://github.com/wuifdesign/zustand-tools/workflows/Test/badge.svg)
[![NPM](https://img.shields.io/npm/v/zustand-tools.svg)](https://www.npmjs.com/package/zustand-tools)

Tools for simpler [zustand](https://github.com/pmndrs/zustand) usage with [react](https://react.dev/): create a store in one line and get typed state, setters and hooks generated from the keys. Custom actions, middlewares and React context stores are supported.

## Installation

```bash
npm i zustand-tools zustand
```

|            | Supported                                                        |
| ---------- | ---------------------------------------------------------------- |
| React      | 18 and 19 (peer dependency)                                      |
| zustand    | 5 (peer dependency)                                              |
| TypeScript | 5 or newer                                                       |
| Modules    | ESM and CommonJS, no side effects (tree-shakable)                |
| Node       | 18 or newer, only relevant for tooling and server-side rendering |

## Quick start

```tsx
import { useEffect } from 'react'
import { createSimple } from 'zustand-tools'

const demoStore = createSimple({ foo: 'bar' })
/*
 * will provide:
 * demoStore.useStore.getState().foo
 * demoStore.useStore.getState().setFoo(value)
 * demoStore.hooks.useFoo() => [value, setter] // like useState, but the setter only takes a value
 */

const useFoo = demoStore.hooks.useFoo

function App() {
  const [foo, setFoo] = useFoo()

  useEffect(() => {
    setFoo('newBar')
  }, [setFoo])

  return <div>{foo}</div>
}
```

## API

### `createSimple(initialState, options?)`

Creates one store for the whole module and returns `{ useStore, hooks }`:

- `useStore` is the regular zustand hook/store (`getState`, `setState`, `subscribe`, ...), including the generated setters and your actions.
- `hooks` contains `useAllData` and one hook per key of `initialState`, see [Generated hooks and setters](#generated-hooks-and-setters).

### `createSimpleContext(defaultState, options?)`

Same as `createSimple`, but every `Provider` creates its own store, so the store is only available for a specific part of the tree (and per request on the server). Returns `{ Provider, hooks }`:

- `defaultState` is the state a store starts with.
- `<Provider initialValues={...}>` overrides parts of `defaultState` for this provider, see [initialValues](#initialvalues).
- `hooks` contains the same hooks as for `createSimple` and additionally `useStore`, which returns the store of the closest `Provider`.

```tsx
import { useEffect } from 'react'
import { createSimpleContext } from 'zustand-tools'

const demoStore = createSimpleContext({ foo: 'bar' })

const DemoStoreProvider = demoStore.Provider
const useFoo = demoStore.hooks.useFoo

function Child() {
  const [foo, setFoo] = useFoo()

  useEffect(() => {
    setFoo('newBar')
  }, [setFoo])

  return <div>{foo}</div>
}

function App() {
  return (
    <DemoStoreProvider initialValues={{ foo: 'customBar' }}>
      <Child />
    </DemoStoreProvider>
  )
}
```

Using a hook outside of its `Provider` throws `[zustand-tools] useFoo must be used inside its Provider`.

### Options

Both functions take the same options as second argument:

| Option        | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `actions`     | Function returning custom actions, see [Actions](#actions).    |
| `middlewares` | Array of zustand middlewares, see [Middlewares](#middlewares). |

## Generated hooks and setters

For every key of the state a setter and a hook are generated. Only the first letter of the key is capitalized:

| State key | Setter (on the store) | Hook (in `hooks`) |
| --------- | --------------------- | ----------------- |
| `foo`     | `setFoo`              | `useFoo`          |
| `fooBar`  | `setFooBar`           | `useFooBar`       |

- `useFoo()` returns `[value, setValue]`. The component only re-renders when `foo` changes.
- The setter takes a value, not an updater function. `setFoo(prev => prev + 1)` stores the function itself. To derive from the previous value use `useStore.getState()` or a custom action.
- Setting a key to its current value (compared with `Object.is`) does nothing: subscribers, `persist` and `devtools` are not notified. A new object with equal content is a new value.
- The returned `[value, setValue]` array keeps its identity as long as the value is the same.
- The setters are stable: a setter keeps its identity for the lifetime of the store, so it is safe to use in dependency arrays.
- Every key needs to be present in the initial state, because hooks and setters are generated from the keys. For optional values set the key explicitly to `undefined`: `{ user: undefined as User | undefined }`. Optional properties (`user?: User`) and number/symbol keys are rejected by the types.

### `useAllData()`

Returns all state values (without setters and actions) using a shallow compare.

```typescript
import { createSimple } from 'zustand-tools'

const demoStore = createSimple({ foo: 1, bar: 2 })
// demoStore.hooks.useAllData() -> { foo: 1, bar: 2 }
```

The component re-renders whenever any of the values changes. If it only needs some of them, use the hook of the key (`hooks.useFoo()`), which only re-renders when that value changes.

### Reserved names

Name clashes would silently overwrite state, so they throw an error when the store is created:

- A state key must not equal the setter of another key, e.g. `{ foo: 1, setFoo: 2 }`, or `{ foo: 1, Foo: 2 }` (both generate `setFoo`).
- A state key must not generate a built-in hook: `allData` (`useAllData`) and, for `createSimpleContext` only, `store` (`useStore`).
- An action must not have the name of a state key.

Keys that merely start with `set` (`settings`, `setup`) are fine. An action named like a generated setter (e.g. `setFoo`) replaces that setter on purpose, which can be used for custom validation.

### `initialValues`

`initialValues` are merged into `defaultState` once, when the `Provider` mounts:

- Plain objects are merged deeply.
- Everything else is replaced as a whole: arrays (`[1, 2]` + `[3]` gives `[3]`), `Date`, `Map`, `Set` and class instances.
- `undefined` values are ignored, so they keep the default.
- Neither `defaultState` nor `initialValues` are mutated.
- Later changes of the prop are ignored. Use the setters to update the store, or give the `Provider` a `key` to create a fresh store.

```tsx
import { createSimpleContext } from 'zustand-tools'

const store = createSimpleContext({ user: { name: 'anonymous', roles: ['guest'] }, theme: 'light' })

function App() {
  // state of this provider: { user: { name: 'anonymous', roles: ['admin'] }, theme: 'light' }
  return <store.Provider initialValues={{ user: { roles: ['admin'] } }}>...</store.Provider>
}
```

## Actions

Add custom actions with the `actions` option. It receives `set`, `get` and the `store` and returns an object of functions.

```typescript
import { createSimple } from 'zustand-tools'

const { useStore } = createSimple(
  { foo: 1 },
  {
    actions: (set, get) => ({
      increaseFoo: (amount: number) => set((state) => ({ foo: state.foo + amount })),
      resetFoo: () => get().setFoo(0)
    })
  }
)

useStore.getState().increaseFoo(5)
```

- `set`, `get` and `store` are typed with the state and the generated setters. Other custom actions are not part of their type.
- `get()` only works inside the actions, not while the `actions` function itself runs (the state does not exist yet).
- Actions are not part of `useAllData` and get no hook, use `useStore((state) => state.increaseFoo)` or `useStore.getState()`.

## Middlewares

Pass an array of zustand middlewares as `middlewares`. Each entry is a function that receives the `initializer` and returns it wrapped by a middleware.

```typescript
import { createSimple } from 'zustand-tools'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'

const demoStore = createSimple(
  { foo: 'bar' },
  {
    middlewares: [
      (initializer) => persist(initializer, { name: 'demo' }),
      (initializer) => subscribeWithSelector(initializer),
      (initializer) => devtools(initializer, { enabled: true })
    ]
  }
)

demoStore.useStore.persist.rehydrate()
demoStore.useStore.subscribe(
  (state) => state.foo,
  (foo) => console.log(foo)
)
```

- The middlewares are applied in array order, the last one is the outermost, like `devtools(subscribeWithSelector(persist(initializer)))`.
- The initializer a middleware receives already contains the generated setters and your actions. With `persist` use the `partialize` option to store only part of the state.

## Server-side rendering (Next.js, Remix, ...)

`createSimple` creates one store per module. On the server that module is shared by every request:

- zustand always renders the initial state on the server, so request specific data can not be rendered through `createSimple`.
- Everything written with the setters or `useStore.getState()` stays in the module and is visible to all following requests.

For SSR use `createSimpleContext` and render a `Provider` per request (or per page), passing request specific data via `initialValues`. Only use `createSimple` for client-only state.

## TypeScript

Types are inferred from the initial state, no generics are needed:

```typescript
import { createSimple } from 'zustand-tools'

type User = { name: string }

const { useStore, hooks } = createSimple({
  count: 0,
  user: undefined as User | undefined
})

useStore.getState().setCount(1) // (value: number) => void
useStore.getState().setUser({ name: 'a' }) // (value: User | undefined) => void
const [user, setUser] = hooks.useUser() // readonly [User | undefined, (value: User | undefined) => void]
```

- State can be a type alias, an interface or an object literal.
- The types of `set`, `get` and `store` in actions, and the API added by middlewares (`persist`, `subscribeWithSelector`, ...), are inferred as well.
- `initialValues` of the `Provider` are typed as a deep partial of the state, arrays and class instances are not made partial.
- The package also exports its helper types: `DeepPartial`, `CreateSimpleType`, `CreateSimpleHooksType`, `CreateSimpleOptions`, `CreateSimpleProviderProps`, `ActionsType`, `InitStateType` and `UseBoundStoreType`.

## Changelog

Changes are listed in the [GitHub releases](https://github.com/wuifdesign/zustand-tools/releases).

## License

MIT
