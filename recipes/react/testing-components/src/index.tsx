// this code is part of the simplux recipe "testing my React components":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-component

import React from 'react'
import { render } from 'react-dom'
import { Counter } from './counter'

render(<Counter />, document.getElementById('root'))
