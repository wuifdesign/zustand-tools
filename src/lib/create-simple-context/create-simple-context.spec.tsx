import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { createSimpleContext } from './create-simple-context'
import { MiddlewareType } from '../types'

const middlewareMock = jest.fn()

const demoMiddleware: MiddlewareType = (config, value) => (set, get, api) =>
  config(
    (args) => {
      middlewareMock(value)
      set(args)
    },
    get,
    api
  )

describe('simpleZustandCreate', () => {
  it('should create provider', () => {
    const { Provider } = createSimpleContext({ foo: 1 })
    expect(Provider).toBeTruthy()
  })

  it('should export hooks', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1 })

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 20 }}>{children}</Provider>
    )

    const { result } = renderHook(() => hooks.useFoo(), { wrapper })
    expect(result.current).toEqual([20, expect.any(Function)])
    act(() => {
      result.current[1](5)
    })
    expect(result.current[0]).toBe(5)
  })

  it('should export all data hook', () => {
    const { Provider, hooks } = createSimpleContext({ foo: 1, bar: 2 })

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 20 }}>{children}</Provider>
    )

    const { result } = renderHook(() => hooks.useAllData(), { wrapper })
    expect(result.current).toEqual({ bar: 2, foo: 20 })
  })

  it('should create with middleware', () => {
    const { Provider, hooks } = createSimpleContext(
      { foo: 1 },
      { middlewares: [(initializer) => demoMiddleware(initializer, 'TestValue')] }
    )

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider initialValues={{ foo: 20 }}>{children}</Provider>
    )

    const { result } = renderHook(() => hooks.useStore(), { wrapper })
    const getState = result.current.getState
    expect(middlewareMock).toBeCalledTimes(0)
    expect(getState().foo).toBe(20)
    getState().setFoo(3)
    expect(getState().foo).toBe(3)
    expect(middlewareMock).toBeCalledTimes(1)
    expect(middlewareMock).toBeCalledWith('TestValue')
  })
})
