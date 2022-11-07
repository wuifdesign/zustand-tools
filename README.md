# Zustand Tools

Tools for simpler [zustand](https://github.com/pmndrs/zustand) usage.

![Test](https://github.com/wuifdesign/zustand-tools/workflows/Test/badge.svg)
[![NPM](https://img.shields.io/npm/v/zustand-tools.svg)](https://www.npmjs.com/package/zustand-tools)

## Installation 

```bash
npm i zustand-tools
```

## Documentation

### createSimple(initStore, middlewares)

Creates a simple store with correct typings and hooks for easier usage.

e.g.:

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


### Adding Middlewares

Middlewares can be added by passing an array as a second parameter.

```typescript
import { createSimple } from 'zustand-tools'
import { devtools } from 'zustand/middleware'

const demoStore = createSimple({ foo: 'bar' }, [(initializer) => devtools(initializer, { enabled: true })])
```

### createSimpleContext(initStore, middlewares)

Basically the same as `createSimple` but return a provider to use the store only for a specific context.

`initialValues` can be used to override the `defaultValues` provided on creation. It will be merged with `defaultValues`.

e.g.:

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
