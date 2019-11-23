import { InternalReduxStoreProxy, SimpluxModule } from '@simplux/core'
import { cleanup, render } from '@testing-library/react'
import React, { useEffect } from 'react'
import { renderHook } from 'react-hooks-testing-library'
import { useSimpluxContext, useSimpluxSubscription } from './context'

describe('context', () => {
  let moduleState = { count: 0 }
  let subscriber: () => void = () => void 0
  let getModuleStateMock: jest.Mock<typeof moduleState, []>
  let getModulesStateMock: jest.Mock<{ test: typeof moduleState }, []>

  let unsubscribeMock: jest.Mock<void, []>
  let subscribeToReduxStoreProxyMock: jest.Mock<() => void, [() => void]>
  let subscribeToModuleMock: jest.Mock<
    any,
    [(state: typeof moduleState, previousState: typeof moduleState) => void]
  >

  let moduleMock: SimpluxModule<typeof moduleState>
  let reduxStoreProxyMock: InternalReduxStoreProxy

  beforeEach(() => {
    moduleState = { count: 10 }

    unsubscribeMock = jest.fn()

    getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
    getModulesStateMock = jest
      .fn()
      .mockImplementation(() => ({ test: moduleState }))

    subscribeToReduxStoreProxyMock = jest.fn().mockImplementation(s => {
      subscriber = s
      return unsubscribeMock
    })

    subscribeToModuleMock = jest
      .fn()
      .mockImplementation(() => ({ unsubscribe: () => void 0 }))

    moduleMock = {
      getState: getModuleStateMock,
      setState: undefined!,
      subscribeToStateChanges: subscribeToModuleMock,
      $simpluxInternals: {
        name: 'test',
        mockStateValue: undefined,
        mutations: {},
        mutationMocks: {},
        selectors: {},
        dispatch: undefined!,
        getReducer: undefined!,
      },
    }

    reduxStoreProxyMock = {
      id: 0,
      getState: getModulesStateMock,
      dispatch: undefined!,
      subscribe: subscribeToReduxStoreProxyMock,
      subscribers: [],
    }

    jest.clearAllMocks()
  })

  afterEach(cleanup)

  describe(useSimpluxContext.name, () => {
    it('returns the default value', () => {
      const { result } = renderHook(useSimpluxContext)
      result.current.subscribeToModuleStateChanges(moduleMock, jest.fn())
      expect(result.current.getModuleState(moduleMock)).toEqual({ count: 10 })
      expect(subscribeToModuleMock).toHaveBeenCalled()
    })
  })

  describe(useSimpluxSubscription.name, () => {
    it('returns a value that allows accessing the state of a module', () => {
      const { result } = renderHook(() =>
        useSimpluxSubscription(() => reduxStoreProxyMock),
      )

      expect(result.current.getModuleState(moduleMock)).toEqual({ count: 10 })
    })

    it('returns a value that allows subscribing to module changes', () => {
      const handler = jest.fn()

      const Comp = () => {
        const value = useSimpluxSubscription(() => reduxStoreProxyMock)
        useEffect(
          () => value.subscribeToModuleStateChanges(moduleMock, handler),
          [],
        )
        return <div />
      }

      render(<Comp />)

      expect(handler).toHaveBeenCalledWith({ count: 10 }, { count: 10 })

      handler.mockClear()

      moduleState = { count: 11 }
      subscriber()

      expect(handler).toHaveBeenCalledWith({ count: 11 }, { count: 10 })

      handler.mockClear()

      moduleState = { count: 12 }
      subscriber()

      expect(handler).toHaveBeenCalledWith({ count: 12 }, { count: 11 })
    })
  })
})
