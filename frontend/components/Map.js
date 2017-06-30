import React, { Component, PropTypes } from 'react';
import fetch from 'isomorphic-fetch';
import './map.less';

class ComplexDistrictOverlay extends BMap.Overlay {
  constructor(point, text, mouseoverText) {
    super();
    this._point = point;
    this._text = text;
    this._overText = mouseoverText;
  }

  initialize(map) {
    this._map = map;
    const div = (this._div = document.createElement('div'));
    div.style =
      'border-radius:50px; width:80px; height:80px; border:3px solid #BC3B3A;';
    div.style.position = 'absolute';
    div.style.backgroundColor = '#EE5D5B';
    div.style.color = 'black';
    div.style.textAlign = 'center';
    div.style.padding = '2px';
    div.style.lineHeight = '80px';
    div.style.whiteSpace = 'nowrap';
    div.style.MozUserSelect = 'none';
    div.style.fontSize = '20px';
    const span = (this._span = document.createElement('span'));
    div.appendChild(span);
    span.appendChild(document.createTextNode(this._text));
    const that = this;

    div.onmouseover = function mouseout() {
      this.style.zIndex = 1;
      this.style.backgroundColor = '#6BADCA';
      this.style.borderColor = '#0000ff';
      this.getElementsByTagName('span')[0].innerHTML = that._overText;
    };

    div.onmouseout = function mouseout() {
      this.style.zIndex = 0;
      this.style.backgroundColor = '#EE5D5B';
      this.style.borderColor = '#BC3B3A';
      this.getElementsByTagName('span')[0].innerHTML = that._text;
    };

    div.addEventListener('click', () => {
      that.hide();
      map.centerAndZoom(that._point, 17);
    });

    map.getPanes().labelPane.appendChild(div);

    return div;
  }

  draw() {
    const map = this._map;
    const pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x - 45 + 'px';
    this._div.style.top = pixel.y - 45 + 'px';
  }
}

class ComplexZoneOverlay extends BMap.Overlay {
  constructor(point, text, mouseoverText, fontColor, zone, onClickZone) {
    super();
    this._point = point;
    this._text = text;
    this._overText = mouseoverText;
    this._fontColor = fontColor;
    this._zone = zone;
    this._onClickZone = onClickZone;
  }

  initialize(map) {
    this._map = map;
    const div = (this._div = document.createElement('div'));
    div.style =
      'border-radius:30px; width:150px; height:30px; border:3px solid #666;';
    div.style.position = 'absolute';
    div.style.backgroundColor = '#FFFFFF';
    div.style.color = this._fontColor;
    div.style.textAlign = 'center';
    div.style.height = '10px';
    div.style.padding = '2px';
    div.style.lineHeight = '10px';
    div.style.whiteSpace = 'nowrap';
    div.style.MozUserSelect = 'none';
    div.style.fontSize = '10px';
    const span = (this._span = document.createElement('span'));
    div.appendChild(span);
    span.appendChild(document.createTextNode(this._text));
    const that = this;

    div.onmouseover = function mouserover() {
      this.style.backgroundColor = '#FFFFFF';
      this.style.borderColor = '#0000ff';
      this.getElementsByTagName('span')[0].innerHTML = that._overText;
    };

    div.onmouseout = function mouseout() {
      this.style.backgroundColor = '#FFFFFFF';
      this.style.borderColor = '#666';
      this.getElementsByTagName('span')[0].innerHTML = that._text;
    };

    div.addEventListener('click', () => {
      that._onClickZone(that._zone);
    });

    map.getPanes().labelPane.appendChild(div);

    return div;
  }

  draw() {
    const map = this._map;
    const pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x - 80 + 'px';
    this._div.style.top = pixel.y - 20 + 'px';
  }
}

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.id = props.id || 'allmap';
    this._allOverlays = [];
    this.getNewMap = this.getNewMap.bind(this);
    this.onRefreshZones = props.onRefreshZones;
    this.onClickZone = props.onClickZone;
    this._district = props.data;
    this._center = null;
    this._zoomLevel = 0;
  }

  componentDidMount() {
    this._map = new BMap.Map(this.id);
    this._map.centerAndZoom('上海');
    this._map.addControl(new BMap.NavigationControl());
    const that = this;

    // moveend，初次加载时，会响应多次，原因待查？
    this._map.addEventListener('moveend', that.getNewMap);
    this._map.addEventListener('zoomend', that.getNewMap);
  }

  componentDidUpdate() {
    if (this.props.data && this._district !== this.props.data) {
      this._district = this.props.data;
      this._map.centerAndZoom(this._district, 17);
    }
  }

  getNewMap() {
    const level = this._map.getZoom();
    const center = this._map.getCenter();

    /*
		* 根据地图中心点和缩放级别判断是否需要重新请求数据，解决百度api moveend 事件多次执行问题
		*/
    if (level === this._level && center === this._center) {
      return;
    }
    this._level = level;
    this._center = center;

    const bs = this._map.getBounds(); // 获取可视区域
    const sw = bs.getSouthWest(); // 可视区域左下角
    const ne = bs.getNorthEast(); // 可视区域右上角

    if (level < 16) {
      this.removeLabels();
      this.makeDistrictLabel(this.props.districtList);
      this.onRefreshZones([]); // 清空左边栏数据
    } else if (level > 15) {
      this.removeLabels();
      this.getVisibleZones(ne, sw);
    }
  }

  // 获取当前可见范围的所有小区
  getVisibleZones(ne, sw) {
    const that = this;
    const params = `?swx=${sw.lng}&swy=${sw.lat}&nex=${ne.lng}&ney=${ne.lat}`;
    fetch(`/getVisibleZones${params}`).then((response) => {
      return response.json();
    }).then((data) => {
      that.makeLabel(data.zones);

      // 按年增长率倒序
      data.zones.sort((a, b) => {
        return b.xqdata.ratio_year - a.xqdata.ratio_year;
      });
      that.onRefreshZones(data.zones);
    });
  }

  makeLabel(zones) {
    const size = zones.length;
    for (let i = 0; i < size; i++) {
      const point = new BMap.Point(zones[i].x, zones[i].y);
      const ratioYear = zones[i].xqdata.ratio_year;
      const mouseoverText = zones[i].name + ' ' + ratioYear + '%';
      let fontColor = '';
      if (ratioYear >= 20) {
        fontColor = 'red';
      } else if (ratioYear < 20 && ratioYear >= 10) {
        fontColor = 'blue';
      } else if (ratioYear < 10 && ratioYear >= 0) {
        fontColor = 'green';
      } else {
        fontColor = 'black';
      }
      const myCompOverlay = new ComplexZoneOverlay(
        point,
        zones[i].name,
        mouseoverText,
        fontColor,
        zones[i],
        this.onClickZone
      );
      this._map.addOverlay(myCompOverlay);
      this._allOverlays.push(myCompOverlay);
    }
  }

  // 清除标注
  removeLabels() {
    const that = this;
    this._allOverlays.forEach((label) => {
      that._map.removeOverlay(label);
    });
  }

  // 划区
  makeDistrictLabel(list) {
    const myGeo = new BMap.Geocoder();
    const size = list.length;
    const that = this;
    for (let i = 0; i < size; i++) {
      myGeo.getPoint(
        list[i],
        (point) => {
          const txt = list[i];
          const count = that.props.num[i];
          const mouseoverTxt = txt + ' ' + count + '套';
          const myCompOverlay = new ComplexDistrictOverlay(
            point,
            txt,
            mouseoverTxt
          );
          that._map.addOverlay(myCompOverlay);
          that._allOverlays.push(myCompOverlay);
        },
        '上海市'
      );
    }
  }

  render() {
    return <div className="map" id={this.id} />;
  }

}

Map.propTypes = {
  id: PropTypes.string,
  data: PropTypes.string,
  onRefreshZones: PropTypes.func.isRequired,
  onClickZone: PropTypes.func.isRequired,
  district: PropTypes.string,
  districtList: PropTypes.array,
  num: PropTypes.array,
};

