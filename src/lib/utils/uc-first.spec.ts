import { ucFirst } from './uc-first'

describe('ucFirst', () => {
  it('should uppercase first character', () => {
    expect(ucFirst('test')).toEqual('Test')
  })
})
