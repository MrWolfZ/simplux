import { createModule, moduleExtensions, registerModuleExtension, removeModule } from './module'

describe('registering extension', () => {
  it('stores the extension', () => {
    const unregister = registerModuleExtension(() => ({}))
    expect(moduleExtensions.length).toBe(1)
    unregister()
  })

  it('returns unregister function', () => {
    const unregister = registerModuleExtension(() => ({}))
    unregister()
    expect(moduleExtensions.length).toBe(0)
  })
})

describe('created module', () => {
  afterEach(() => removeModule('test'))

  describe(`getState`, () => {
    it('returns initial state', () => {
      const initialState = { test: 'test' }
      const { getState } = createModule({
        name: 'test',
        initialState,
      })

      expect(getState()).toBe(initialState)
    })
  })

  describe(`setState`, () => {
    it('replaces the whole state', () => {
      const replacedState = { test: 'updated' }
      const { getState, setState } = createModule({
        name: 'test',
        initialState: { test: 'test' },
      })

      setState(replacedState)
      expect(getState()).toBe(replacedState)
    })
  })
})
