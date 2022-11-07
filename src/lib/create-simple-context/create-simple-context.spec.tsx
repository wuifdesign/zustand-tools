import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { createSimpleContext } from './create-simple-context'

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
})
