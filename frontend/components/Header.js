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

require("./header.less")

export default class Header extends Component {

	render() {
		return (
			<div className="header">
				<label>区域：</label>
				<select>
					<option>浦东</option>
					<option>长宁</option>
					<option>徐汇</option>
				</select>
				<button>查询</button>
			</div>
		);
	}

}