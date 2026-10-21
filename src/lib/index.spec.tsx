describe('public api', () => {
  it('should export createSimple and createSimpleContext', async () => {
    const lib = await import('./index')
    expect(Object.keys(lib).sort()).toEqual(['createSimple', 'createSimpleContext'])
    expect(typeof lib.createSimple).toBe('function')
    expect(typeof lib.createSimpleContext).toBe('function')
  })
})
