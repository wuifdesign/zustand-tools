import React, { useEffect } from 'react'
import { simpleZustandCreate } from './lib'
import { useStore } from 'zustand'

const { hooks, context } = simpleZustandCreate({
  foo: 1,
  bar: 2
})

const useFoo = hooks.useFoo

const Provider = context.Provider
const useContextBar = context.hooks.useBar

function Child() {
  const [bar] = useContextBar()

  return <div>{bar}</div>
}

function App() {
  const [foo, setFoo] = useFoo()

  useEffect(() => {
    setFoo(5)
  }, [setFoo])

  return (
    <Provider value={{ a: 1 } as any}>
      {foo} <Child />
    </Provider>
  )
}

export default App
