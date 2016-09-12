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

export default class Map extends Component {

	constructor(props) {
		super(props);
		this.id = props.id || 'allmap';
	}

	componentDidMount() {
		this._map = new BMap.Map(this.id);
		this._map.centerAndZoom('上海');
		this._map.addControl(new BMap.NavigationControl());

		this._local = new BMap.LocalSearch(this._map, {
			renderOptions: {
				map: this._map
			},
			onInfoHtmlSet: poi => {
				if (typeof this.props.onSelect === 'function') {
					this.props.onSelect(poi.marker.getPosition());
				}
			}
		});
	}

	render() {
		return (
			<div className="map" id={this.id}>
			</div>
		);
	}


	//获取当前可见范围的所有小区
	getVisibleZones(ne, sw) {
		var xy = JSON.stringify({
			"leftX": ne.lat,
			"leftY": ne.lng,
			"rightX": sw.lat,
			"rightY": sw.lng
		});
		$.ajax({
			url: 'getMapZones',
			type: "POST",
			data: xy,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				//生成地图标注
				console.log(data)
					//console.log('data........',data);	
				makeLabel(data.zones);

				//go on.........willion  create list on index.html

				// sort by priceRate
				data.zones.sort(function(a, b) {
					return b.priceRate - a.priceRate;
				}); // 排序, 倒序

				//在移动地图时，移除先前产生的table
				$('tr').not('#first').remove();
				// 	生成table
				for (var x = 0; x < data.zones.length; x++) {
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
				}
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
		var x = 0;
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
		)
	}

}