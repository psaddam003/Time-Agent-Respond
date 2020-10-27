var ctx = document.getElementById('myChart').getContext('2d');
var sprintColor = 'green';
var competitorColor = 'red';

var pricing = {
	"0-5": [30, 40, 50, 60, 70, 75,70, 80, 50, 40, 75, 65],
	"5-10": [70, 80, 50, 40, 75, 65,30, 40, 50, 60, 70, 75,],
	"10-15": [44, 50, 55, 75, 95, 60,43, 40, 60, 80, 75, 56],
	"15-20 min": [17, 40, 75, 65, 30,35,34, 40, 47, 30, 34,25],
	"20-25 min": [44, 50, 30, 20, 10,38,17, 40, 75, 65, 30,35],
	"25-30 min": [43, 40, 60, 80, 75, 56,44, 50,  80, 50, 40, 70],

	"30-35 min": [26, 30, 35, 45, 55,50,63, 70,90, 90, 90, 90],
	"35-40 min": [34, 40, 47, 30, 34,35,34, 40, 47, 30, 34,45],
	"40-45 min": [63, 70,90, 90, 90, 90,34, 40, 47, 30, 34,25],
	"45-50 min": [36, 40, 70, 30, 60,55,17, 40, 75, 65, 30,35],
	"50-55 min": [17, 13, 15, 35, 35,40 ,45, 55,50,63, 70,90 ],
	"55-60 min": [44, 50,  80, 50, 40, 70,30, 20, 10,38,17, 40]
}

var dataSets = [];
var max;
function buildDataSet(){
	dataSets = [];
	max = 0;
	// if we use the for loop we'll have the ability to compare datasets through the legend
	//for (x=1; x <= pricing[Object.keys(pricing)[0]].length; x++){
		var dataVals = [];
		var colVals = [];
		var x = dataSetIndex;
		var priceIndex = x - 1;
		
		$.each(pricing, function(i){
			dataVals.push(pricing[i][priceIndex]);
			var col = (i == "0-5" || "5-10" || "10-15")  ?  competitorColor : sprintColor ;
			colVals.push(col);
			if (pricing[i][priceIndex] > max) max = pricing[i][priceIndex];
		});	
		dataSets.push({
			label: (priceIndex + 1) + " Line" + (priceIndex > 0 ? 's' : ''),
			backgroundColor: colVals,
			borderColor: 'transparent',
			data: dataVals,
			hidden: (x == dataSetIndex ? false : true)
		});
	//}
	// if using for loop
	var newmax = (Math.ceil(max/50) * 50);
	max = (newmax == max) ? newmax+50 : newmax;
	return dataSets;
}
var dataSetIndex = 1;

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: Object.keys(pricing),
        datasets: buildDataSet()
    },
    options: {
			showAllTooltips: true,
			legend: {
				labels: {
					boxWidth: 0
				},
				// toggle display labels - allows side by side viewing of datasets
				display: false
			},
			animation: {
				onComplete: function(chart){
				}
			},
			tooltips: {
				mode: 'point',
				titleFontSize: 14,
				titleFontFamily: 'Helvetica',
				titleFontStyle: 'normal',
				titleMarginBottom: 2,
				cornerRadius: 0,
				backgroundColor: 'rgb(0,0,0)',
				xPadding: 24,
				yAlign: 'bottom',
				xAlign: 'center',
				callbacks: {
					title: function(tooltipItem){
						return '' + tooltipItem[0].yLabel;
					},
					label: function(tooltipItem, data){
						return false;
					},
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						min: 0,
						max: max,
						callback: function(value, index, values) {
							return '' + value;
						}
					}
				}]
			}
		}
});


// the plugin to enable persistant tooltips
Chart.pluginService.register({
	beforeRender: function (chart) {
		if (chart.config.options.showAllTooltips) {
			// create an array of tooltips
			// we can't use the chart tooltip because there is only one tooltip per chart
			chart.pluginTooltips = [];
			chart.config.data.datasets.forEach(function (dataset, i) {
				chart.getDatasetMeta(i).data.forEach(function (sector, j) {
					chart.pluginTooltips.push(new Chart.Tooltip({
						_chart: chart.chart,
						_chartInstance: chart,
						_data: chart.data,
						_options: chart.options.tooltips,
						_active: [sector]
					}, chart));
				});
			});

			// turn off normal tooltips
			chart.options.tooltips.enabled = false;
		}
	},
	afterDraw: function (chart, easing) {
		if (chart.config.options.showAllTooltips) {
			// we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
			if (!chart.allTooltipsOnce) {
				if (easing !== 1)
					return;
				chart.allTooltipsOnce = true;
			}

			// turn on tooltips
			chart.options.tooltips.enabled = true;
			Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
				tooltip.initialize();
				tooltip.update();
				// we don't actually need this since we are not animating tooltips
				tooltip.pivot();
				tooltip.transition(easing).draw();
			});
			chart.options.tooltips.enabled = false;
		}
	}
});

// hack to get the tooltips to invoke on 1st load 
setTimeout(function(){
	$('#toggler').val(1).change();
}, 1);

$('#toggler').change(function(){
	dataSetIndex = parseInt($(this).val());
	myChart.data.datasets = buildDataSet(dataSetIndex);
	myChart.options.scales.yAxes[0].ticks.max = max;
	myChart.update();
});

$('.update-range').click(function(e){
	e.preventDefault();
	$('#toggler').val(parseInt($(this).val())).change();
});