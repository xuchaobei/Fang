import React from 'react'
import {
	render
} from 'react-dom'
import {
	Router,
	Route,
	hashHistory
} from 'react-router'
import Main from './containers/Main'
import Test from './containers/Test'
import Test2 from './containers/Test2'

render(<Main/>, document.getElementById('app'))