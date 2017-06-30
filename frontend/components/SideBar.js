import React, { Component, PropTypes } from 'react';
import './sidebar.less';

export default class SideBar extends Component {
  constructor(props) {
    super(props);
    this.onClickZone = this.props.onClickZone.bind(this);
  }

  render() {
    const zones = this.props.zones;
    return (
      <div className="sidebar">
        <table>
          <thead>
            <tr>
              <td>小区名称</td>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone._id} onClick={() => this.onClickZone(zone)}>
                <td>{zone.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

SideBar.propTypes = {
  zones: PropTypes.array.isRequired,
  onClickZone: PropTypes.func.isRequired,
};
