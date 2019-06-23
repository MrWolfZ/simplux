// this code is part of the simplux recipe "testing my React components that read and change state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state

import React from 'react'
import { render } from 'react-dom'
import { Counter } from './counter'

render(<Counter />, document.getElementById('root'))
