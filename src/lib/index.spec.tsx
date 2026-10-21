import * as lib from './index'

describe('public api', () => {
  it('should export createSimple and createSimpleContext', () => {
    expect(Object.keys(lib).sort()).toEqual(['createSimple', 'createSimpleContext'])
    expect(typeof lib.createSimple).toBe('function')
    expect(typeof lib.createSimpleContext).toBe('function')
  })
})
