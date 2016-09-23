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
import PopChart from "../components/PopChart"

export default class Main extends Component {

	constructor(props) {
		super(props);
		this.state = {
			zones: [],
			district: "",
			currentZone: null,
			chartVisibility: false
		}
		this.onRefreshZones = this.onRefreshZones.bind(this);
		this.onClickZone = this.onClickZone.bind(this);
		this.setChartDisplay = this.setChartDisplay.bind(this);
		this.selectDistrict = this.selectDistrict.bind(this);
	}

	render() {
		return (
			<div>
				<Header onSearchDistrict = {this.selectDistrict}/>
				<SideBar data= {this.state.zones} onClickZone = {this.onClickZone}/>
				<Map data= {this.state.district} onRefreshZones = {this.onRefreshZones} onClickZone = {this.onClickZone}/>
				<PopChart data = {this.state.currentZone} visibility={this.state.chartVisibility} setChartDisplay={this.setChartDisplay}/>
			</div>
		);
	}

	onRefreshZones(zones) {
		this.setState({
			zones: zones,
		});
	}

	onClickZone(zone) {
		this.setState({
			currentZone: zone,
			chartVisibility: true
		});
	}

	setChartDisplay(visibility) {
		this.setState({
			chartVisibility: visibility 
		})
	}

	selectDistrict(district) {
		this.setState({
			district: district
		})
	}

}
