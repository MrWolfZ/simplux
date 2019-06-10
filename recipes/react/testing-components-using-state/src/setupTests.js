import '@simplux/core-testing'
import '@simplux/immer'
import '@simplux/react'
import '@simplux/react-testing'
import '@simplux/selectors'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })
