// this code is part of the simplux recipe "using hot module reloading in my React application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/using-hot-module-reloading

import { SimpluxProvider } from '@simplux/react'
import React from 'react'
import { render } from 'react-dom'
import { Counter } from './counter'

const App = () => (
  <SimpluxProvider>
    <Counter />
  </SimpluxProvider>
)

render(<App />, document.getElementById('root'))
