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

require("./map.less")

var hotdistrict = ["徐汇", "静安", "浦东新区", "杨浦", "闵行", "普陀区", "长宁", "黄浦", "卢湾", "虹口", "闸北", "宝山", "松江", "嘉定", "青浦"]
var num = [1499, 965, 2990, 1347, 1298, 894, 1347, 750, 641, 1333, 956, 824, 809, 816, 409]

export default class Map extends Component {

	constructor(props) {
		super(props);
		this.id = props.id || 'allmap';
		this._allOverlays = [];
		this.onRefreshZones = props.onRefreshZones;
	}

	componentDidMount() {
		this._map = new BMap.Map(this.id);
		this._map.centerAndZoom('上海');
		this._map.addControl(new BMap.NavigationControl());
		var that = this;


		this._map.addEventListener("dragend", function() {
			var center = this.getCenter();
			console.log("地图中心点变更为：" + center.lng + ", " + center.lat);


			var bs = this.getBounds(); //获取可视区域
			var sw = bs.getSouthWest(); //可视区域左下角
			var ne = bs.getNorthEast(); //可视区域右上角
			var level = this.getZoom();

			console.log("ne", ne.lng, ne.lat);
			console.log("sw", sw.lng, sw.lat);
			console.log("dragend");
			//removeLabels(ne, sw);
			that.getNewMap(ne, sw, level);

			// getMapZones(ne,sw);
		});

		this._map.addEventListener("zoomend", function() { //放大缩小地图
			var level = this.getZoom();
			// alert("地图缩放至：" + level + "级");  
			var bs = this.getBounds(); //获取可视区域
			var sw = bs.getSouthWest(); //可视区域左下角
			var ne = bs.getNorthEast(); //可视区域右上角  

			// getMapZones(ne, sw);
			console.log("level=" + level);
			that.getNewMap(ne, sw, level);
		})

	}

	render() {
		return (
			<div className="map" id={this.id}>
			</div>
		);
	}



	getNewMap(ne, sw, level) {
		if (level < 16) {
			this.removeLabels();
			this.makeDistrictLabel(hotdistrict);
		} else if (level > 15) {
			this.removeLabels();
			this.getVisibleZones(ne, sw);
		}
	}

	//获取当前可见范围的所有小区
	getVisibleZones(ne, sw) {
		var xy = JSON.stringify({
			"leftX": ne.lat,
			"leftY": ne.lng,
			"rightX": sw.lat,
			"rightY": sw.lng
		});
		var that = this;
		$.ajax({
			url: 'mockdata/getVisibleZones',
			type: "GET",
			data: xy,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				//生成地图标注
				console.log(data)
					//console.log('data........',data);	
				that.makeLabel(data.zones);

				//go on.........willion  create list on index.html

				// sort by priceRate
				data.zones.sort(function(a, b) {
					return b.priceRate - a.priceRate;
				}); // 排序, 倒序

				that.onRefreshZones(data.zones);

				//在移动地图时，移除先前产生的table
				//$('tr').not('#first').remove();
				// 	生成table
				/*for (var x = 0; x < data.zones.length; x++) {
					var td1 = data.zones[x].name;
					var _item = $("<tr></tr>").html(td1).click(function() {
						var num = ($(this).index() - 1)
							//console.log(num)
						var graph_data = data.zones[num];
						//console.log(data.zones[num])
						//console.log(graph_data)
						pop_chart(graph_data._id, graph_data.name);
					});

					$('#data').append(_item);
				}*/
			}
		})
	}



	//点击tr弹出曲线图
	pop_chart(zoneId, content) {
		// console.logf(content);


		$.ajax({
			url: 'getPrices',
			type: "POST",
			data: JSON.stringify({
				"id": zoneId,
				"name": content
			}),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(result) {
				//生成地图标注
				//						var data =  eval ("(" + data + ")");
				labels = [];
				data = [];

				var tempDateTime = "";
				result.zoneprices.forEach(function(price) {

					// var date = new Date(Number(price.time));

					// var dateTime = date.getFullYear()+"/"+date.getMonth();

					// if(dateTime != tempDateTime){
					// 	labels.push(dateTime);
					//     data.push(price.price);
					//     tempDateTime = dateTime;
					// }
					// console.log(price.time, price.price);
					labels.push(price.time);
					data.push(price.price);


				})

				$('#myModal').modal();

				var ctx = $("#myChart");

				var modalData = {
					labels: labels,
					datasets: [{
						label: "房价曲线",
						fill: false,
						lineTension: 0.1,
						backgroundColor: "rgba(75,192,192,0.4)",
						borderColor: "rgba(75,192,192,1)",
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: "rgba(75,192,192,1)",
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "rgba(75,192,192,1)",
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: data,
						spanGaps: false,
						scaleOverride: true
					}]
				}


				new Chart(ctx, {
					type: 'line',
					data: modalData,
					options: {
						responsive: true
					}
				});

				$("#myModalLabel").html(result.name);
			}
		})
	}

	makeLabel(zones) {
		var size = zones.length;
		for (var i = 0; i < size; i++) {
			let p = i;
			var point = new BMap.Point(zones[p].y, zones[p].x);
			var ratioYear = zones[p].xqdata.ratio_year;
			var mouseoverText = zones[p].name + " " + ratioYear + "%";
			var fontColor = "";
			if (ratioYear >= 50) {
				fontColor = "red";
			} else if (ratioYear < 50 && ratioYear >= 20) {
				fontColor = "blue";
			} else if (ratioYear < 20 && ratioYear >= 0) {
				fontColor = "green";
			} else {
				fontColor = "black";
			}
			// var percent = zones[x]*100 + "%"

			//complexXQLabel(point, zones[p].name, mouseoverText, fontColor, zones[p]);
			var myCompOverlay = new ComplexZoneOverlay(point, zones[p].name, mouseoverText, fontColor, zones[p]);
			this._map.addOverlay(myCompOverlay);
			this._allOverlays.push(myCompOverlay);
		}

		/*var x = 0;
		async.whilst(
			function() {
				return x < zones.length;
			},
			function(xqcallback) {
				// console.log(zones[x]._id)

				var point = new BMap.Point(zones[x].y, zones[x].x);
				var ratioYear = zones[x].xqdata.ratio_year;
				var mouseoverText = zones[x].name + " " + ratioYear + "%";
				var fontColor = "";
				if (ratioYear >= 50) {
					fontColor = "red";
				} else if (ratioYear < 50 && ratioYear >= 20) {
					fontColor = "blue";
				} else if (ratioYear < 20 && ratioYear >= 0) {
					fontColor = "green";
				} else {
					fontColor = "black";
				}
				// var percent = zones[x]*100 + "%"

				complexXQLabel(point, zones[x].name, mouseoverText, fontColor, zones[x]);
				x++;
				xqcallback();
			},
			function(err) {

			}
		)*/
	}

	//清除标注
	removeLabels() {
		var that = this;
		this._allOverlays.forEach(function(label) {
			that._map.removeOverlay(label);
		})

	}

	//划区
	makeDistrictLabel(list) {
		var myGeo = new BMap.Geocoder();
		var size = list.length;
		var that = this;
		for (var i = 0; i < size; i++) {
			let p = i;
			myGeo.getPoint(list[p], function(point) {
				var txt = list[p];
				var count = num[p];
				var mouseoverTxt = txt + " " + count + "套";
				var myCompOverlay = new ComplexCustomOverlay(point, txt, mouseoverTxt, that._map);
				that._map.addOverlay(myCompOverlay);
				that._allOverlays.push(myCompOverlay);

			}, "上海市");
		}



		/*var myGeo = new BMap.Geocoder();
		var x = 0;

		async.whilst(
			function() {
				return x < list.length;
			},
			function(callback) {
				//在行政区上做标记
				myGeo.getPoint(list[x], function(point) {
					var txt = list[x];
					var count = num[x]
					var mouseoverTxt = txt + " " + count + "套";

					Complexlabel(point, list[x], mouseoverTxt)
					x++;
					callback();

				}, "上海市");
			},
			function(err) {}
		)*/

	}

}

class ComplexCustomOverlay extends BMap.Overlay {
	constructor(point, text, mouseoverText, map) {
		super()
		this._point = point;
		this._text = text;
		this._overText = mouseoverText;
		this._oldMap = map;
	}

	initialize(map) {
		this._map = map;
		console.log(this._oldMap === this._map);
		var div = this._div = document.createElement("div");
		div.style = "border-radius:50px; width:80px; height:80px; border:3px solid #BC3B3A;";
		div.style.position = "absolute";
		div.style.backgroundColor = "#EE5D5B";
		div.style.color = "black";
		div.style.textAlign = "center"
		div.style.padding = "2px";
		div.style.lineHeight = "80px";
		div.style.whiteSpace = "nowrap";
		div.style.MozUserSelect = "none";
		div.style.fontSize = "20px"
		var span = this._span = document.createElement("span");
		div.appendChild(span);
		span.appendChild(document.createTextNode(this._text));
		var that = this;

		div.onmouseover = function() {
			this.style.zIndex = 1;
			this.style.backgroundColor = "#6BADCA";
			this.style.borderColor = "#0000ff";
			this.getElementsByTagName("span")[0].innerHTML = that._overText;
			console.log("mouseouver =");
			console.log(that._oldMap === that._map);


		}

		div.onmouseout = function() {
			this.style.zIndex = 0;
			this.style.backgroundColor = "#EE5D5B";
			this.style.borderColor = "#BC3B3A";
			this.getElementsByTagName("span")[0].innerHTML = that._text;
		}
		div.addEventListener("click", function() {
			that.hide();
			map.centerAndZoom(that._point, 17);

		})

		map.getPanes().labelPane.appendChild(div);

		return div;
	}

	draw() {
		var map = this._map;
		var pixel = map.pointToOverlayPixel(this._point);
		this._div.style.left = pixel.x - 45 + "px";
		this._div.style.top = pixel.y - 45 + "px";
	}


}

class ComplexZoneOverlay extends BMap.Overlay {
	constructor(point, text, mouseoverText, fontColor, zone) {
		super()
		this._point = point;
		this._text = text;
		this._overText = mouseoverText;
		this._fontColor = fontColor;
		this._zone = zone;
	}

	initialize(map) {
		this._map = map;
		var div = this._div = document.createElement("div");
		div.style = "border-radius:30px; width:150px; height:30px; border:3px solid #666;";
		div.style.position = "absolute";
		div.style.backgroundColor = "#FFFFFF";
		div.style.color = this._fontColor;
		div.style.textAlign = "center"
		div.style.height = "10px";
		div.style.padding = "2px";
		div.style.lineHeight = "10px";
		div.style.whiteSpace = "nowrap";
		div.style.MozUserSelect = "none";
		div.style.fontSize = "10px"
		var span = this._span = document.createElement("span");
		div.appendChild(span);
		span.appendChild(document.createTextNode(this._text));
		var that = this;

		div.onmouseover = function() {

			this.style.backgroundColor = "#FFFFFF";
			this.style.borderColor = "#0000ff";
			this.getElementsByTagName("span")[0].innerHTML = that._overText;
		}

		div.onmouseout = function() {

			this.style.backgroundColor = "#FFFFFFF";
			this.style.borderColor = "#0000ff";
			this.getElementsByTagName("span")[0].innerHTML = that._text;
		}
		div.addEventListener("click", function() {

		})

		map.getPanes().labelPane.appendChild(div);

		return div;
	}

	draw() {
		var map = this._map;
		var pixel = map.pointToOverlayPixel(this._point);
		this._div.style.left = pixel.x - 80 + "px";
		this._div.style.top = pixel.y - 20 + "px";
	}

}