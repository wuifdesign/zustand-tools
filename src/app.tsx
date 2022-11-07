import React, { useEffect } from 'react'
import { createSimple, createSimpleContext } from './lib'

const { hooks } = createSimple({
  foo: 1,
  bar: 2
})

const { Provider, hooks: contextHooks } = createSimpleContext({
  foo: 1,
  bar: 2
})

function Child() {
  const [foo] = contextHooks.useFoo()
  const [bar] = contextHooks.useBar()

  return (
    <div>
      {foo} : {bar}
    </div>
  )
}

function App() {
  const [foo, setFoo] = hooks.useFoo()

  useEffect(() => {
    setFoo(5)
  }, [setFoo])

  return (
    <Provider initialValues={{ foo: 1000 }}>
      {foo} <Child />
    </Provider>
  )
}

export default App
