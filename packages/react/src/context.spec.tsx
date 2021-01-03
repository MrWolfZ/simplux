import {
  SimpluxModule,
  SIMPLUX_MODULE,
  _InternalReduxStoreProxy,
} from '@simplux/core'
import { cleanup, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import React, { useEffect } from 'react'
import { useSimpluxContext, useSimpluxSubscription } from './context'

describe('context', () => {
  let moduleState = { count: 0 }
  let moduleState2 = { value: '' }
  let subscriber: () => void = () => void 0
  let getModuleStateMock: jest.Mock<typeof moduleState, []>
  let getModuleStateMock2: jest.Mock<typeof moduleState2, []>
  let getModulesStateMock: jest.Mock<
    { test: typeof moduleState; test2: typeof moduleState2 },
    []
  >

  let unsubscribeMock: jest.Mock<void, []>
  let subscribeToReduxStoreProxyMock: jest.Mock<() => void, [() => void]>
  let subscribeToModuleMock: jest.Mock

  let moduleMock: SimpluxModule<typeof moduleState>
  let moduleMock2: SimpluxModule<typeof moduleState2>
  let reduxStoreProxyMock: _InternalReduxStoreProxy

  beforeEach(() => {
    moduleState = { count: 10 }
    moduleState2 = { value: 'foo' }

    unsubscribeMock = jest.fn()

    getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
    getModuleStateMock2 = jest.fn().mockImplementation(() => moduleState2)

    getModulesStateMock = jest
      .fn()
      .mockImplementation(() => ({ test: moduleState, test2: moduleState2 }))

    subscribeToReduxStoreProxyMock = jest.fn().mockImplementation((s) => {
      subscriber = s
      return unsubscribeMock
    })

    subscribeToModuleMock = jest
      .fn()
      .mockImplementation(() => ({ unsubscribe: () => void 0 }))

    moduleMock = {
      state: getModuleStateMock as any,
      setState: undefined!,
      subscribeToStateChanges: subscribeToModuleMock,
      $simplux: {
        name: 'test',
        mutations: {},
        dispatch: undefined!,
        getReducer: undefined!,
        getState: getModuleStateMock,
      },
      [SIMPLUX_MODULE]: undefined!,
    }

    moduleMock2 = {
      state: getModuleStateMock2 as any,
      setState: undefined!,
      subscribeToStateChanges: subscribeToModuleMock,
      $simplux: {
        name: 'test2',
        mutations: {},
        dispatch: undefined!,
        getReducer: undefined!,
        getState: getModuleStateMock2,
      },
      [SIMPLUX_MODULE]: undefined!,
    }

    reduxStoreProxyMock = {
      id: 0,
      getState: getModulesStateMock,
      dispatch: undefined!,
      subscribe: subscribeToReduxStoreProxyMock,
      subscribers: [],
      actionsToDispatchOnStoreChange: [],
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

    it('only notifies module handlers if the state for the module changed', () => {
      const handler = jest.fn()
      const handler2 = jest.fn()

      const Comp = () => {
        const value = useSimpluxSubscription(() => reduxStoreProxyMock)
        useEffect(() => {
          const unsub1 = value.subscribeToModuleStateChanges(
            moduleMock,
            handler,
          )
          const unsub2 = value.subscribeToModuleStateChanges(
            moduleMock2,
            handler2,
          )
          return () => {
            unsub1()
            unsub2()
          }
        }, [])
        return <div />
      }

      render(<Comp />)

      expect(handler).toHaveBeenCalledWith({ count: 10 }, { count: 10 })
      expect(handler2).toHaveBeenCalledWith({ value: 'foo' }, { value: 'foo' })

      handler.mockClear()
      handler2.mockClear()

      moduleState = { count: 11 }
      subscriber()

      expect(handler).toHaveBeenCalledWith({ count: 11 }, { count: 10 })
      expect(handler2).not.toHaveBeenCalled()

      handler.mockClear()
      handler2.mockClear()

      moduleState2 = { value: 'bar' }
      subscriber()

      expect(handler).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledWith({ value: 'bar' }, { value: 'foo' })
    })
  })
})
