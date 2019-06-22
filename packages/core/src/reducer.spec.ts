import { createModuleReducer } from './reducer'

describe(`reducer`, () => {
  const reducer = createModuleReducer('test', 10, {
    increment: c => c + 1,
  })

  it('updates the state', () => {
    const result = reducer(undefined, {
      type: '@simplux/test/mutation/increment',
      mutationName: 'increment',
      args: [],
    })
    expect(result).toBe(11)
  })

  it('throws if the mutation does not exist', () => {
    expect(() =>
      reducer(undefined, {
        type: '@simplux/test/mutation/doesNotExist',
        mutationName: 'doesNotExist',
        args: [],
      }),
    ).toThrowError(/does not exist/)
  })

  it('ignores unknown actions', () => {
    const result = reducer(undefined, { type: 'foo' })
    expect(result).toBe(10)
  })

  it('returns state if it gets mutated without getting returned', () => {
    const mutatingReducer = createModuleReducer(
      'test',
      { test: 'test' },
      {
        update: state => {
          state.test = 'updated'
          return undefined!
        },
      },
    )

    const result = mutatingReducer(undefined, {
      type: '@simplux/test/mutation/update',
      mutationName: 'update',
      args: [],
    })
    expect(result).toEqual({ test: 'updated' })
  })

  it('freezes the state if feature flag is set', () => {
    const freezingReducer = createModuleReducer(
      'test',
      {
        test: 'test',
      },
      {
        update: state => {
          state.test = 'updated'
          return state
        },
      },
    )

    expect(() =>
      freezingReducer(
        undefined,
        {
          type: '@simplux/test/mutation/update',
          mutationName: 'update',
          args: [],
        },
        () => true,
      ),
    ).toThrowError(/Cannot assign to read only property/)
  })
})
