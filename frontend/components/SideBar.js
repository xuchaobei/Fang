import React, {
	Component,
	PropTypes
} from 'react';

require("./sidebar.less")

export default class SideBar extends Component {

	constructor(props) {
		super(props);
		this.onClickZone = this.props.onClickZone.bind(this);
	}


	render() {
		const zones = this.props.data;
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
							return (<tr key={zone._id} onClick={() => this.onClickZone(zone)}>
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

SideBar.PropTypes={
	zones : React.PropTypes.array.isRequired,
	onClickZone : React.PropTypes.func.isRequired
}