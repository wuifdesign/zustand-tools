import { describe, test } from 'vitest'
import { render } from '@testing-library/react'
import { createSimpleContext } from './create-simple-context'

// run with `npm run bench`
const KEYS = 50
const defaultState = Object.fromEntries(Array.from({ length: KEYS }, (_, index) => [`key${index}`, index]))

describe(`Provider of a context with ${KEYS} keys`, () => {
  test('mounting', async ({ bench }) => {
    const { Provider } = createSimpleContext(defaultState)
    await bench.compare(
      bench('without initialValues', () => {
        render(<Provider>child</Provider>).unmount()
      }),
      bench('with initialValues', () => {
        render(<Provider initialValues={{ key0: 1, key1: 2 }}>child</Provider>).unmount()
      })
    )
  })
})
