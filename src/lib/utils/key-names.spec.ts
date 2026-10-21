import { getKeyNames } from './key-names'

describe('getKeyNames', () => {
  it('should derive hook and setter name from the key', () => {
    expect(getKeyNames('foo')).toEqual({ hookName: 'useFoo', setterName: 'setFoo' })
    expect(getKeyNames('fooBar')).toEqual({ hookName: 'useFooBar', setterName: 'setFooBar' })
    expect(getKeyNames('FooBar')).toEqual({ hookName: 'useFooBar', setterName: 'setFooBar' })
    expect(getKeyNames('snake_case')).toEqual({ hookName: 'useSnake_case', setterName: 'setSnake_case' })
  })

  it('should compute the names only once per key', () => {
    expect(getKeyNames('cached')).toBe(getKeyNames('cached'))
  })
})
