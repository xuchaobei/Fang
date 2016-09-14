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

render(<Main/>, document.getElementById('app'))