// this code is part of the simplux recipe "using lazy loaded React components/code splitting":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/using-lazy-loading-code-splitting

import { SimpluxProvider } from '@simplux/react'
import React, { lazy, Suspense, useState } from 'react'
import { render } from 'react-dom'
import { Counter } from './counter'

const LazyCounter = lazy(() => import('./lazyCounter'))

const App = () => {
  const [lazyCounterIsVisible, setLazyCounterIsVisible] = useState(false)
  const makeLazyCounterVisible = () => setLazyCounterIsVisible(true)

  return (
    <SimpluxProvider>
      <Counter />
      <br />
      {renderLazyCounterOrButton()}
    </SimpluxProvider>
  )

  function renderLazyCounterOrButton() {
    if (lazyCounterIsVisible) {
      return (
        <Suspense fallback='Loading lazy counter...'>
          <LazyCounter />
        </Suspense>
      )
    }

    return <button onClick={makeLazyCounterVisible}>Load lazy counter</button>
  }
}

render(<App />, document.getElementById('root'))
