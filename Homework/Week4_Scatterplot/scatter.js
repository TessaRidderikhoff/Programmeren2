/*
Tessa Ridderikhoff
10759697
4-5-2018

scatter.js
This javascript file creates a scatterplot from API's on scatter.html.

Sources:
tooltips: http://bl.ocks.org/Caged/6476579
*/

window.onload = function() {

	// request API from OECD
	var unemploymentPercentage = "http://stats.oecd.org/SDMX-JSON/data/DUR_I/AUS+AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+JPN+LVA+LUX+NLD+NZL+POL+PRT+SVN+ESP+SWE+GBR+LTU.MW.900000.UN1+UN2+UN3+UN4+UN5.A/all?startTime=2010&endTime=2013&dimensionAtObservation=allDimensions"
	var discouragedWorkers = "http://stats.oecd.org/SDMX-JSON/data/DW_I/AUS+AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+JPN+LVA+LUX+NLD+NZL+POL+PRT+SVN+ESP+SWE+GBR+LTU.MW.900000.YES.DISLF.A/all?startTime=2010&endTime=2013&dimensionAtObservation=allDimensions"
	var unemploymentAmount = "http://stats.oecd.org/SDMX-JSON/data/DUR_D/AUS+AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+JPN+LVA+LUX+NLD+NZL+POL+PRT+SVN+ESP+SWE+GBR+LTU.MW.900000.UN1+UN2+UN3+UN4+UN5.A/all?startTime=2010&endTime=2013&dimensionAtObservation=allDimensions"

	// create title
	d3.select("body")
		.append("h1")
		.text("Unemployed people for over 1 year and incidence of discouraged workers")

	// create explanation of graph
	d3.select("body")
		.append("p")
		.html("The x-axis shows the percentage of discouraged workers in a population. Discouraged workers are people who are able and desire to work, but feel like there is no work available."
			+ "<br> The y-axis shows the percentage of unemployed people in a population that has been unemployed for over 1 year."
			+ "<br> The size of the dot on the chart represents the amount of unemployed people in the population that have been unemployed for more than a year in total (not proportional)."
			+ "<br><br><strong>Name: </strong>Tessa Ridderikhoff <br> <strong>Studentnumber:</strong> 10759697"
			+ "<br><strong>Source: </strong>OECD Data ")

	// add sources of graph
	d3.select("p")
		.append("a")
		.attr("href", "https://www.oecd-ilibrary.org/employment/data/labour-market-statistics/unemployment-by-duration-incidence_data-00322-en")
		.html("<br>Unemployment by duration: incidence")
		.append("a")
		.attr("href", "https://www.oecd-ilibrary.org/employment/data/labour-market-statistics/unemployment-by-duration_data-00320-en")
		.html("<br>Unemployment by duration")
		.append("a")
		.attr("href", "https://www.oecd-ilibrary.org/employment/data/labour-market-statistics/discouraged-workers-incidence_data-00291-en")
		.html("<br>Discouraged workers: incidence")


	// wait until all data is succesfully requested, and then call the create data function
	d3.queue()
	.defer(d3.request, unemploymentPercentage)
	.defer(d3.request, discouragedWorkers)
	.defer(d3.request, unemploymentAmount)
	.awaitAll(createData);

}


// colour function (20 colours) source: http://bl.ocks.org/aaizemberg/78bd3dade9593896a59d
var c20 = d3.scale.category20();

function createData(error, response) {
/* 
This function parses the data to JSON files and loads the data in datasets, containing the right variables needed to make a graph.
*/

	// return error if data is not succesfully loaded
	if (error) throw error;

	// parse data to create JSON files
	var unemploymentPercentageJSON = JSON.parse(response[0].responseText);
	var discouragedJSON = JSON.parse(response[1].responseText);
	var unemployedAmountJSON = JSON.parse(response[2].responseText);
	
	// initiate data-list for each variable
	discouragedata = [];
	unemployeddata = [];
	numberunemployed = [];	
	
	// initiate list of countries
	countries = [];

	// loop through countries of data
	for (country = 0; country < 24; country++) { // landen
		
		// loop through years of data (2010 - 2014)
		for (year = 0; year < 4; year++) {
			
			// create arrays to get the correct data from JSON
			datapointdisc = country + ":" + year + ":0:0:0:0:0"
			datapointunem = country + ":" + year + ":0:0:4:0"

			// check if this year and country have data of discouraged workers
			if (datapointdisc in discouragedJSON.dataSets[0].observations) {
				discouragedata.push(discouragedJSON.dataSets[0].observations[datapointdisc][0]);
			}

			// check if this year and country have data of unemployment duration in percentage
			if (datapointunem in unemploymentPercentageJSON.dataSets[0].observations) {
				unemployeddata.push(unemploymentPercentageJSON.dataSets[0].observations[datapointunem][0]);
			}
			
			// check if this year and country have data of amount of people unemployed for more than a year
			if (datapointunem in unemployedAmountJSON.dataSets[0].observations) {
				numberunemployed.push(unemployedAmountJSON.dataSets[0].observations[datapointunem][0]);
			}

			// add country name to data
			countries.push(unemploymentPercentageJSON.structure.dimensions.observation[0].values[country]["name"])	
		}
	}
	// go to prepareData function
	prepareData()
}


function prepareData(year) {
/*
This function selects the data of the right year from the datasets, and creates one dataset containing all variables. 
*/
	
	// no year has been given as input of the function, set year to 2010
	if (!year){
		year = 0;
	}

	// initiate dataset
	dataset = [];

	// select right year from all data-lists by looping through data in steps of 4
	for (i = year; i <= discouragedata.length; i += 4) {
		
		// create datapoint to contain the 4 variables
		datapoint = [];
		datapoint.push(discouragedata[i]);
		datapoint.push(unemployeddata[i]);
		datapoint.push(numberunemployed[i]);
		datapoint.push(countries[i]);
		
		// check if all data is a number
		if (isNaN(discouragedata[i]) || isNaN(unemployeddata[i]) || isNaN(numberunemployed[i])) {
			continue;
		}
		
		// add datapoint (with 4 variables) to dataset
		dataset.push(datapoint);
	}

	// call function to make the graph
	makeGraph()
}

function makeGraph(year){
/*
This function creates a scatterplot from the dataset, and adds a legend explaining the colours of the graph.
*/
	
	// remove last graph if another year is selected
	d3.select("svg").remove();

	// specify margin-sizes of svg
	margin = {top: 40, left: 50, bottom: 40, right: 300}

	// specify graph-height and -width
	graphHeight = 400 - margin.top - margin.bottom;
	graphWidth = 1000 - margin.left - margin.right;

	// create new svg
	var svg = d3.select("body")
		.append("svg")
		.attr("width", graphWidth + margin.left + margin.right)
		.attr("height", graphHeight + margin.top + margin.bottom);

	// determine maximum values of x- and y-values (first initiate arrays to hold x- and y-data seperately)
	maxXFinder = [];
	maxYFinder = [];

	// loop through data to create arrays of only the x- and y-values, 
	// to find the maximum of x and y
	for (i = 0; i < dataset.length; i++) {
		maxXFinder.push(dataset[i][0]);
		maxYFinder.push(dataset[i][1]);
	}
	
	// determine maximum x- and y-values
	maxX = Math.max(...maxXFinder);
	maxY = Math.max(...maxYFinder);

	// create function to transform x-variable to location on graph
	var xScale = d3.scale.linear()
					.domain([0, maxX])
					.range([margin.left, graphWidth + margin.left]);

	// create function to transform y-variable to location on graph
	var yScale = d3.scale.linear()
					.domain([0, maxY])
					.range([graphHeight + margin.bottom, margin.bottom]);

	// create tooltip (source: http://bl.ocks.org/Caged/6476579)
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Country: </strong> <span style='color:red'>" + d[3] + 
			"</span>" + "<br>" + "<strong> Discouraged workers: </strong>" + 
			d[0].toFixed(1) + "%" + "<br>" + "<strong> Percentage unemployed for >1 year: </strong>" + 
			d[1].toFixed(1) + "%" + "<br>" + "<strong> Number of people unemployed for >1 year: </strong>" + 
			d[2].toFixed(1) + " thousand"

		})

	// call the tooltip
	svg.call(tip);

	// create dots to represent the data
	var dot = svg.selectAll("circle")
		.data(dataset)
		.enter()
		.append("circle")
		
		// id of dot is name of the country
		.attr("id", function(d) {
			return d[3];
		})
		.attr("class", "dot")
		.attr("cx", function(d) {
			return xScale(d[0]);
		})
		.attr("cy", function(d) {
			return yScale(d[1]);
		})
		
		// radius of the dot is dependent on number of unemployed people in country (not proportional)
		.attr("r", function(d) {
			if (d[2] < 50) {
				return 3;
			}
			else if (d[2] < 100) {
				return 6;
			}
			else if (d[2] < 500) {
				return 9;
			}
			else if (d[2] < 1000) {
				return 12;
			}
			else {
				return 15;
			}
		})
		// colour the dot, using the colour function
		.attr("fill", function(d, i) {
			return c20(i);
		});


	// show tooltip on mouseover, and lower opacity of other datapoints
	dot.on("mouseover", function(d) {
		tip.show(d);
		var self = this;
		d3.selectAll(".dot").filter(function(d) {
			return self != this;
		})
		.style("opacity", 0.2)

	});

	// return values when mouse no longer hovers dot
	dot.on("mouseout", function(d) {
		tip.hide(d);
		d3.selectAll(".dot").style("opacity", 1)
	});

	// create element to hold legend element for each datapoint
	var legendcolour = svg.selectAll("g")
		.data(dataset)
		.enter()
		.append("g")

	// append rectangle of colour of country
	legendcolour.append("rect")
		.attr("class", "legend")
		.attr("x", graphWidth + margin.left + 20)
		
		// lower rectangle for every legend element
		.attr("y", function(d, i) {
			return margin.bottom + (i * 15)
		})
		.attr("height", 10)
		.attr("width", 20)
		
		// fill rectangle with colour of country
		.attr("fill", function(d, i) {
			return c20(i);
		});

	// append name of country to legend
	legendcolour.append("text")
		.attr("x", graphWidth + margin.left + 45)
		.attr("y", function(d, i) {
			return margin.bottom + (i * 15) + 10
		})
		.text(function(d) {
			return d[3]
		});

	// on mouseover of legend, decrease opacity of dots, except of corresponding dot
	legendcolour.on("mouseover", function(d) {
		d3.selectAll(".dot").style("opacity", 0.2);
		d3.selectAll("#" + d[3]).style("opacity", 1);
	});

	// change all dot-opacities back to 1 on mouseout
	legendcolour.on("mouseout", function(d) {
		d3.selectAll(".dot").style("opacity", 1)
	})

	// create x-axis
	var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom");

	// create y-axis
	var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left");

	// y-axis title
	svg.append("g")
            .append("text")
            .attr("class", "axistitle")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", -margin.left)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Unemployed > 1 year (% of all unemployees)");

    // x-axis title
    svg.append("g")
        .append("text")
        .attr("class", "axistitle")
        .attr("y", graphHeight + margin.bottom + 30)
        .attr("x", graphWidth/2)
        .text("Incidence of discouraged workers (%)");

	// call x-axis 
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0, " + (margin.top + graphHeight) + ")")
		.call(xAxis);

	// call y-axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + margin.left + ", 0)")
		.call(yAxis);

}

function updateGraph(value) {
/*
This functions responds to changes of the dropdown button to select another year,
 and calls the prepareData function to update the graph.
*/
	
	// convert value from string to integer
	value = Number(value);

	// call prepareData
	prepareData(value);
}

// global variables
var discouragedata;
var unemployeddata;
var dataset;
var unemploymentPercentageJSON;
var discouragedJSON;
var unemployedAmountJSON;
var margin;
var graphWidth;
var graphHeight;
var svg;




