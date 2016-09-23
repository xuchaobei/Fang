import React, {
	Component,
	PropTypes
} from 'react';

require("./popchart.less")

export default class PopChart extends Component {

	constructor(props) {
		super(props);
		this.onClose = this.onClose.bind(this);
		this.setChartDisplay = this.props.setChartDisplay;
	}


	shouldComponentUpdate(nextProps, nextState) {
		return this.props !== nextProps;
	}

	componentDidUpdate() {
		if (this.props.data && this.props.visibility) {
			const zone = this.props.data;
			this.drawChart(zone);
		}
	}


	render() {
		const visibility = this.props.visibility == true ? 'block' : 'none';

		return this.props.visibility ?
			(
			  <div style={{'display': visibility}} className="modal" id="myModal" tabIndex="-1">

			  <div className="modal-dialog" role="document">
			    <div className="modal-content">
			      <div className="modal-header">
			        <h4 className="modal-title" id="myModalLabel"></h4>
			      </div>
			      <div className="modal-body">
			        <canvas id="myChart"></canvas>
			      </div>
			      <div className="modal-footer">
			        <button type="button" id="clear" onClick={this.onClose}>Close</button>
			      </div>
			    </div>
			  </div>
			</div>
			) : (<div style={{'display': visibility}} className="modal" id="myModal" tabIndex="-1"></div>)

	}

	onClose() {
		this.setChartDisplay(false);
	}

	drawChart(zone) {
		const labels = zone.xqdata.month_list;
		const data = zone.xqdata.avg_price_list;
		const name = zone.name;

		$("#myModalLabel").html(name);
		const ctx = $("#myChart");
		const modalData = {
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
				pointBorderWidth: 5,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "rgba(75,192,192,1)",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				scaleOverride: true,
				data: data,
				spanGaps: false
			}]
		}

		new Chart(ctx, {
			type: 'line',
			data: modalData,
			options: {
				responsive: true
			}
		});
	}

}

PopChart.propTypes = {
	data: React.PropTypes.object,
	visibility: React.PropTypes.bool.isRequired,
	setChartDisplay: React.PropTypes.func.isRequired
}