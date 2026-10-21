import React from 'react'
import { renderToString } from 'react-dom/server'
import { createSimple } from '../create-simple'
import { createSimpleContext } from './create-simple-context'

describe('server side rendering', () => {
  it('should render the initial values of the provider', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1 })
    const Child = () => <span>value:{hooks.useFoo()[0]}</span>
    expect(
      renderToString(
        <Provider initialValues={{ foo: 7 }}>
          <Child />
        </Provider>
      )
    ).toContain('7')
  })

  it('should not leak state between requests when every request renders its own provider', () => {
    const { Provider, hooks } = createSimpleContext({ user: 'anonymous' })
    const Child = () => <span>{hooks.useUser()[0]}</span>
    const render = (user?: string) =>
      renderToString(
        <Provider initialValues={{ user }}>
          <Child />
        </Provider>
      )
    expect(render('alice')).toContain('alice')
    expect(render('bob')).toContain('bob')
    expect(render()).toContain('anonymous')
  })

  it('should always render the initial state of createSimple on the server (zustand uses getInitialState there)', () => {
    const { hooks, useStore } = createSimple({ user: 'anonymous' })
    const Child = () => <span>{hooks.useUser()[0]}</span>
    useStore.getState().setUser('alice')
    expect(renderToString(<Child />)).toContain('anonymous')
  })

  it('should keep state written to createSimple in the module, so it is shared by all requests (see README)', () => {
    const { useStore } = createSimple({ user: 'anonymous' })
    useStore.getState().setUser('alice')
    // a later "request" in the same process sees it
    expect(useStore.getState().user).toBe('alice')
  })
})
