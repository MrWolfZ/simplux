// this code is part of the simplux recipe "testing my React components that read and change state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state

// we import all the simplux extension packages we are going to use
import '@simplux/immer'
import '@simplux/react'
import '@simplux/selectors'
import React from 'react'
import { render } from 'react-dom'
import { Counter } from './counter'

render(<Counter />, document.getElementById('root'))
