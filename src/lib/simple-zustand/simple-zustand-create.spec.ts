import { simpleZustandCreate } from './simple-zustand-create'

describe('simpleZustandCreate', () => {
  it('should export getter and setter', () => {
    const { store } = simpleZustandCreate({
      foo: 1,
      bar: 2
    })
    expect(store.getState().foo).toBe(1)
    expect(store.getState().bar).toBe(2)
    store.getState().setFoo(3)
    expect(store.getState().foo).toBe(3)
  })
})
