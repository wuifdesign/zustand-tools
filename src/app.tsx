import React, { useEffect } from 'react'
import './zustand/simple-zustand-create'
import { simpleZustandCreate } from './lib'

const { hooks } = simpleZustandCreate({
  foo: 1,
  bar: 2
})

const useFoo = hooks.useFoo

function App() {
  const [foo, setFoo] = useFoo()

  useEffect(() => {
    setFoo(5)
  }, [setFoo])

  return <div>{foo}</div>
}

export default App
