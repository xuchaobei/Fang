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

	constructor(props) {
		super(props);
		this.state = {
			zones : [{'_id':1, 'name':"白杨小区"},{'_id':2, 'name':'花木小区'}]
		}
	}

	render() {
		return (
			<div>
				<Header/>
				<SideBar data={this.state.zones}/>
				<Map onRefreshZones = {this.onRefreshZones.bind(this)}/>
			</div>
		);
	}

	onRefreshZones(zones) {
		this.setState({zones: zones});
	}

}

Main.propTypes = {
	zones : React.PropTypes.array
}