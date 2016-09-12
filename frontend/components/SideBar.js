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
		return (
			<div className="sidebar">
				<label>小区：</label>
			</div>
		);
	}

}