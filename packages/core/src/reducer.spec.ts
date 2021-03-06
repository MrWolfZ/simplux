import { createModuleReducer } from './reducer.js'

describe(`reducer`, () => {
  let nodeEnv: string | undefined

  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv
  })

  const reducer = createModuleReducer('test', 10, {
    incrementBy: (c, amount: number) => c + amount,
  })

  it('updates the state', () => {
    const result = reducer(undefined, {
      type: '@simplux/test/mutation/incrementBy',
      mutationName: 'incrementBy',
      args: [5],
    })
    expect(result).toBe(15)
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

  it('does not throw if the mutation does not exist in production', () => {
    process.env.NODE_ENV = 'production'

    expect(() =>
      reducer(undefined, {
        type: '@simplux/test/mutation/doesNotExist',
        mutationName: 'doesNotExist',
        args: [],
      }),
    ).not.toThrowError(/does not exist/)
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
        update: (state) => {
          state.test = 'updated'
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
})
