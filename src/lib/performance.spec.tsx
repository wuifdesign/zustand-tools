import React, { useEffect } from 'react'
import { act, render, renderHook, screen } from '@testing-library/react'
import { createSimple } from './create-simple'
import { createSimpleContext } from './create-simple-context'
import { createStore } from './utils/create-store'

const createCounter = () => {
  const counts: Record<string, number> = {}
  const count = (name: string) => {
    counts[name] = (counts[name] ?? 0) + 1
  }
  return { counts, count }
}

describe('re-renders', () => {
  it('should only re-render components that use the changed key (createSimple)', () => {
    const { hooks, useStore } = createSimple({ a: 1, b: 1 })
    const { counts, count } = createCounter()
    const A = () => {
      count('a')
      return <span data-testid="a">{hooks.useA()[0]}</span>
    }
    const B = () => {
      count('b')
      return <span data-testid="b">{hooks.useB()[0]}</span>
    }
    render(
      <>
        <A />
        <B />
      </>
    )
    expect(counts).toEqual({ a: 1, b: 1 })
    act(() => useStore.getState().setB(2))
    expect(counts).toEqual({ a: 1, b: 2 })
    expect(screen.getByTestId('b').textContent).toBe('2')
  })

  it('should only re-render components that use the changed key (createSimpleContext)', () => {
    const { Provider, hooks } = createSimpleContext({ a: 1, b: 1 })
    const { counts, count } = createCounter()
    let setB: (value: number) => void = () => undefined
    const A = () => {
      count('a')
      return <span>{hooks.useA()[0]}</span>
    }
    const B = () => {
      count('b')
      const [value, set] = hooks.useB()
      useEffect(() => {
        setB = set
      }, [set])
      return <span>{value}</span>
    }
    render(
      <Provider>
        <A />
        <B />
      </Provider>
    )
    act(() => setB(2))
    expect(counts).toEqual({ a: 1, b: 2 })
  })

  it('should not re-render a component using useAllData for custom actions', () => {
    const { hooks, useStore } = createSimple({ a: 1 }, { actions: () => ({ noop: () => undefined }) })
    const { counts, count } = createCounter()
    const Comp = () => {
      count('all')
      return <span>{hooks.useAllData().a}</span>
    }
    render(<Comp />)
    act(() => useStore.setState({ noop: () => undefined }))
    expect(counts).toEqual({ all: 1 })
  })

  it('should not re-render when a key is set to its current value', () => {
    const { hooks, useStore } = createSimple({ a: 1 })
    const { counts, count } = createCounter()
    const Comp = () => {
      count('a')
      return <span>{hooks.useA()[0]}</span>
    }
    render(<Comp />)
    act(() => useStore.getState().setA(1))
    expect(counts).toEqual({ a: 1 })
  })
})

describe('hook result', () => {
  it('should return the same tuple while the value does not change', () => {
    const { hooks } = createSimple({ foo: { n: 1 } })
    const { result, rerender } = renderHook(() => hooks.useFoo())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('should return a new tuple but the same setter when the value changes', () => {
    const { hooks } = createSimple({ foo: 1 })
    const { result } = renderHook(() => hooks.useFoo())
    const [, setFoo] = result.current
    const first = result.current
    act(() => setFoo(2))
    expect(result.current).not.toBe(first)
    expect(result.current[0]).toBe(2)
    expect(result.current[1]).toBe(setFoo)
  })
})

describe('setters', () => {
  it('should not notify subscribers when a key is set to its current value', () => {
    const store = createStore({ foo: 1, nan: NaN })
    const listener = vi.fn()
    store.subscribe(listener)
    store.getState().setFoo(1)
    store.getState().setNan(NaN)
    expect(listener).not.toBeCalled()
    store.getState().setFoo(2)
    expect(listener).toBeCalledTimes(1)
  })

  it('should still notify for a new object with equal content', () => {
    const store = createStore({ foo: { a: 1 } })
    const listener = vi.fn()
    store.subscribe(listener)
    store.getState().setFoo({ a: 1 })
    expect(listener).toBeCalledTimes(1)
  })
})
