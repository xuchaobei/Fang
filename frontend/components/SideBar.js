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

require("./sidebar.less")

export default class SideBar extends Component {


	render() {
		const zones = this.props.data;
		console.log(zones);
		return (
			<div className="sidebar">
				<table>
					<thead>
						<tr>
							<td>小区名称</td>
						</tr>
					</thead>
					<tbody>
					{
						zones.map(zone => {
							return (<tr key={zone._id}>
										<td>{zone.name}</td>
									</tr>)
						})
					}
					
					</tbody>
				</table>
			</div>
		);
	}

}