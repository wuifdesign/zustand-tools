# Zustand Tools

Tools for simpler [zustand](https://github.com/pmndrs/zustand) usage with [react](https://reactjs.org/).

![Test](https://github.com/wuifdesign/zustand-tools/workflows/Test/badge.svg)
[![NPM](https://img.shields.io/npm/v/zustand-tools.svg)](https://www.npmjs.com/package/zustand-tools)

## Installation 

```bash
npm i zustand-tools
```

## createSimple(initStore, middlewares)

Creates a simple store with correct typings and hooks for easier usage.

```tsx
import { createSimple } from 'zustand-tools'

const demoStore = createSimple({ foo: 'bar' })
/*
 * will provide:
 * demoStore.getState().foo
 * demoStore.getState().setFoo(value)
 * demoStore.hooks.useFoo() => [value, setter] // like useState
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

## createSimpleContext(initStore, middlewares)

Basically the same as `createSimple` but return a provider to use the store only for a specific context.

`initialValues` can be used to override the `defaultValues` provided on creation. It will be merged with `defaultValues`.

```tsx
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
    <Provider initialValues={{ foo: 'customBar' }}>
      <Child />
    </Provider>
  )
}
```

## Special Hook: `useAllData()`

This special hook will return all data from the store using a shallow compare. 

```typescript
import { createSimple } from 'zustand-tools'

const demoStore = createSimple({ foo: 1, bar: 2 })
// useAllData() -> { foo: 1, bar: 2 }
```

## Adding Additional Actions

If needed you can add additional actions to the generated store.

```typescript
import { createSimple } from 'zustand-tools'

const { hooks, getState } = createSimple(
  { foo: 1 },
  {
    actions: (set) => ({
      increaseFoo: (amount: number) => set((state) => ({ foo: state.foo + amount }))
    })
  }
)

getState().increaseFoo(5)
```

## Adding Middlewares

Middlewares can be added by passing an array as `middlewares` in the second parameter.

```typescript
import { createSimple } from 'zustand-tools'
import { devtools } from 'zustand/middleware'

const demoStore = createSimple({ foo: 'bar' }, { middlewares: [(initializer) => devtools(initializer, { enabled: true })] })
```
