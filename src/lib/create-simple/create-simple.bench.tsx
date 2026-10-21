import { describe, test } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { createSimple } from './create-simple'
import { pickKeys } from '../utils/pick-keys'

// run with `npm run bench`
const KEYS = 50
const initialState = Object.fromEntries(Array.from({ length: KEYS }, (_, index) => [`key${index}`, index]))
const dataKeys = Object.keys(initialState)

// the keys are generated, so the types do not know them
type Hooks = {
  useAllData: () => Record<string, number>
  useKey0: () => readonly [number, (value: number) => void]
}
type Setters = Record<string, (value: number) => void>
const createStoreWith50Keys = () => {
  const { hooks, useStore } = createSimple(initialState)
  return { hooks: hooks as unknown as Hooks, useStore: useStore as unknown as { getState: () => Setters } }
}

describe(`store with ${KEYS} keys`, () => {
  test('selecting the data', async ({ bench }) => {
    const state = createSimple(initialState).useStore.getState()
    await bench.compare(
      bench('pickKeys (useAllData)', () => {
        pickKeys(state, dataKeys)
      }),
      bench('Object.fromEntries + filter (previous implementation)', () => {
        Object.fromEntries(Object.entries(state).filter(([key]) => !key.startsWith('set')))
      })
    )
  })

  test('setting a value without subscribers', async ({ bench }) => {
    const { useStore } = createStoreWith50Keys()
    let value = 0
    await bench('setter', () => {
      useStore.getState().setKey0!(value++)
    }).run()
  })

  test('setting a value with a useAllData subscriber', async ({ bench }) => {
    const { hooks, useStore } = createStoreWith50Keys()
    const { unmount } = renderHook(() => hooks.useAllData())
    let value = 0
    await bench('setter + render', () => {
      act(() => useStore.getState().setKey0!(value++))
    }).run()
    unmount()
  })

  test('setting a value with a single key subscriber', async ({ bench }) => {
    const { hooks, useStore } = createStoreWith50Keys()
    const { unmount } = renderHook(() => hooks.useKey0())
    let value = 0
    await bench('setter + render', () => {
      act(() => useStore.getState().setKey0!(value++))
    }).run()
    unmount()
  })
})
