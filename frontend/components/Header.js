import React, { Component, PropTypes } from 'react';
import './header.less';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      district: this.props.districtList[0],
    };
    this.changeDistrict = this.changeDistrict.bind(this);
    this.search = this.search.bind(this);
  }

  changeDistrict(event) {
    this.setState({
      district: event.target.value,
    });
  }

  search() {
    this.props.onSearchDistrict(this.state.district);
  }

  render() {
    return (
      <div className="header">
        <span>选择区域</span>
        <select value={this.state.value} onChange={this.changeDistrict}>
          {this.props.districtList.map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
        <button onClick={this.search}>查询</button>
      </div>
    );
  }
}

Header.propTypes = {
  districtList: PropTypes.array,
  onSearchDistrict: PropTypes.func,
};

