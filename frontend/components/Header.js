import React, {
	Component,
	PropTypes
} from 'react';

require("./header.less")

var districts = ["徐汇", "静安", "浦东新区", "杨浦", "闵行", "普陀区", "长宁", "黄浦", "卢湾", "虹口", "闸北", "宝山", "松江", "嘉定", "青浦", "金山"];


export default class Header extends Component {

	constructor(props){
		super(props);
		this.state = {
			district : districts[0]
		};
		this.changeDistrict = this.changeDistrict.bind(this);
		this.search = this.search.bind(this);
		this.onSearchDistrict = props.onSearchDistrict;
	}

	render() {
		return (
			<div className="header">
				<label>选择区域</label>
				<select onChange= {this.changeDistrict} >
					{districts.map(district => (<option key={district} value={district}>{district}</option>))}				
				</select>
				<button onClick = {this.search}>查询</button>
			</div>
		);
	}

	changeDistrict(event) {
		this.setState({
			district : event.target.value
		})
	}

	search() {
		this.onSearchDistrict(this.state.district);
	}

}