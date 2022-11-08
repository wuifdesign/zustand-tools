import { filterObjectByKey } from './filter-object-by-key'

describe('filterObjectByKey', () => {
  it('should filter keys', () => {
    expect(filterObjectByKey({ test: 1, setTest: () => null }, (key) => !key.startsWith('set'))).toEqual({ test: 1 })
  })
})
