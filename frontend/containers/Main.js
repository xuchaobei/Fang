import React, {
	Component,
	PropTypes
} from 'react';
import {
	render
} from 'react-dom';

import {
	Link
} from 'react-router';
import Header from "../components/Header.js"
import SideBar from "../components/SideBar.js"
import Map from "../components/Map.js"

export default class Main extends Component {

	render() {
		return (
			<div>
				<Header/>
				<SideBar/>
				<Map/>
			</div>
		);
	}

}