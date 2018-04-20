/*
Tessa Ridderikhoff
20-04-2018
weather.js

This script creates a weather graph in the canvas of weatherdata.html, and draws
the crosshair to view the dates and temperatures individually.
*/

// define canvas size
var cWidth = 1200;
var cHeight = 800;

// define graph size
var graphHeight = 600;
var graphWidth = 1095;

// define axis size
var axisWidth = 105;
var axisHeigth = 200;

// number of days this year
const daysthisyear = 365;

// select canvasses from html
var canvas = document.getElementById('weatherGraph'); 
var ctx = canvas.getContext('2d');
var topcanvas = document.getElementById("crosshair");
var ctx2 = topcanvas.getContext('2d');

function drawGraph() {
	/* 
	This function gets the KNMI data, and draws the data in the graph.
	*/
	// get data from txt file and split per new row
	var weatherdata = this.responseText;
	weatherdata = weatherdata.split("\n");

	// split data in dates and temperatures
	for (i = 0; i < weatherdata.length - 1; i++) {
		weatherdata[i] = weatherdata[i].split(",");
	}
	// create arrays to store dates and temperatures separately
	date = [];
	temp = [];
	
	// loop through data and add dates and temperatures to their arrays
	for (i = 0; i < weatherdata.length - 1; i++) {
		date[i] = weatherdata[i][0];
		temp[i] = Number(weatherdata[i][1]);

		// remove spaces from dates
		date[i] = date[i].replace(/\s/g, '');

		// add ticks ('-') to dates 
		date[i] = [date[i].slice(0, 4), '-', date[i].slice(4)].join('');
		date[i] = [date[i].slice(0, 7), '-', date[i].slice(7)].join('');

		// transform date into JavaScript format
		date[i] = new Date(date[i])
	}

	// select canvas to draw graph on
	var canvas = document.getElementById('weatherGraph'); 
	var ctx = canvas.getContext('2d');

	// select lowest and highest temperatures from temperature array
	lowesttemp = Math.min(...temp);
	highesttemp = Math.max(...temp);

	// create function to transform the temperature to pixels in graph
	var tempTransform = createTransform([lowesttemp, highesttemp], [graphHeight, 0])

	// transform all temperatures to pixels
	temptrans = [];
	for (i = 0; i < temp.length; i++) {
		temptrans[i] = tempTransform(temp[i]);
	}

	// transform dates to miliseconds
	datems = [];
	for (i = 0; i < date.length; i++) {
		datems[i] = date[i].getTime();
	}

	// create function to transform the dates (in ms) to pixels in graph
	var dateTransform = createTransform([datems[0], datems[364]], [axisWidth, cWidth])

	// transform dates (in ms) to pixels in graph
	datetrans = [];
	for (i = 0; i < date.length; i++) {
		datetrans[i] = dateTransform(datems[i]);
	}

	// draw x- and y-axis
	ctx.beginPath();
	ctx.moveTo(cWidth, graphHeight);
	ctx.lineTo(axisWidth, graphHeight);
	ctx.lineTo(axisWidth, 0);
	ctx.stroke();

	// draw data in graph
	ctx.beginPath();
	ctx.moveTo(datetrans[0], temptrans[0]);
	for (i = 1; i < date.length; i++) {
		ctx.lineTo(datetrans[i], temptrans[i]);
	}
	ctx.stroke();

	// create vector for temperatures to display on y-axis
	axistemps = [];
	var numberofticks = 10;
	for (i = 0; i <= numberofticks; i++) {
		// create vector with 10 temperature values from lowest to highest temperature
		axistemps[i] = (lowesttemp + ((highesttemp - lowesttemp) / numberofticks) * i)/numberofticks;
		// make sure every value on the y-axis will have one decimal
		axistemps[i] = axistemps[i].toFixed(1);
	}

	// create y-axis ticks with values 
	tick = 0;
	ctx.beginPath();
	for (i = graphHeight; i >= 0; i -= (graphHeight/numberofticks)) {
		// draw ticks
		ctx.moveTo(axisWidth, i);
		ctx.lineTo((axisWidth - 20), i);
		// draw temperatures on y-axis
		ctx.font = "15px arial";
		ctx.fillText(axistemps[tick] + " \u00B0C", (axisWidth - 70), i + 15);
		tick += 1;
	}
	ctx.stroke();

	// draw title of y-axis (rotated)
	ctx.save();
	ctx.translate(axisWidth, 0);
	ctx.rotate((Math.PI / 180) * - 90);
	ctx.font = "20px arial"
	ctx.fillText("Temperature", -340, -80);
	ctx.restore();

	// select dates that are the first of the month
	month = 0;
	dateaxis = [];
	for (i = 0; i < date.length; i++) {
		if (String(date[i]).substr(8, 2) == "01") {
			// save number of date in array
			dateaxis[month] = i;
			month += 1;
		}
	}

	// draw ticks on x-axis and with date
	month = 0;
	counter = 0;
	ctx.beginPath();
	// loop through all dates (transformed) on x-axis
	for (i = axisWidth; i <= cWidth; i += (graphWidth / daysthisyear)) {
		// if date is first of the month (from array): draw tick and date
		if (counter == dateaxis[month]){
			ctx.moveTo(i, graphHeight);
			ctx.lineTo(i, (graphHeight + 20));
			ctx.font = "15px arial"
			// draw only part of date on graph (for readability)
			datepoint = String(date[dateaxis[month]]).substr(4, 6);
			ctx.fillText(datepoint, i, (graphHeight + 40));
			month += 1;
		}
		counter += 1;
	}
	ctx.stroke();

	// draw title of x-axis
	ctx.font = "20px arial";
	ctx.fillText("Months of 2017", 1000, 680);

}

function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}



function getMouseLocation(e) {
	/*
	This function creates the crosshair on the graph at the location of the mouse,
	and displays the selected date and temperature of that date in the corner of 
	the graph.
	*/

	// create function to transform temperatures to pixels on graph
	var tempTransform = createTransform([lowesttemp, highesttemp], [graphHeight, 0]);

	// create function to transform pixel of x-axis to date
	var getDatePoint = createTransform([axisWidth, cWidth], [date[0], date[364]]);
	
	// get coordinates of canvas on entire page
	var weathercanvas = canvas.getBoundingClientRect();
    
	// clear top canvas (if another crosshair was drawn before)
    ctx2.clearRect(0, 0, 1200, 800);

    // get x-coordinate of mouse on canvas
    var mouseX = e.clientX - weathercanvas.left;

    // get miliseconds of date of that x-coordinate
    var milisecDate = getDatePoint(mouseX);
    
    // determine which date that is
    var clickeddate = new Date(milisecDate);

	// draw vertical line of crosshair at x-coordinate
	ctx2.beginPath();
	ctx2.moveTo(mouseX, graphHeight);
	ctx2.lineTo(mouseX, 0);
	ctx2.stroke();

	// initialize closest date with very big number 
	closestDate = 10000000000000000;

	// calculate which date is closest to number of miliseconds that corresponds 
	// to x-coordinate of mouse
	for (i = 0; i < date.length; i++) {
		difDate = Math.abs(milisecDate - datems[i]);
		// if date is closer to x-coordinate-date than previous closest date in miliseconds:
		// update closestdate 
		if (difDate < closestDate) {
			closestDate = difDate;
			// save number of date of closest date
			var thisDate = i;
		}
	}
	// determine temperature of x-coordinate-date
	thisTemp = temp[thisDate];
	
	// transform temperature of x-coordinate-date to pixel on graph
	thisTempTrans = tempTransform(thisTemp);

	// draw horizontal line of crosshair at height of temperature of x-coordinate-date
	ctx2.beginPath();
	ctx2.moveTo(axisWidth, thisTempTrans);
	ctx2.lineTo(cWidth, thisTempTrans);
	ctx2.stroke();

	// make crosshair blue to stand out from graph
	ctx2.strokeStyle = 'blue';

	// draw circle at middle of crosshair
	ctx2.ellipse(mouseX, thisTempTrans, 10, 10, 0, 0, 2 * Math.PI);
	ctx2.stroke();

	// draw information of x-coordinate-date in corner of graph
	tempInfo = "Temp: " + (thisTemp/10) + " \u00B0C";
	dateInfo = "Date: " + String(clickeddate).substr(0, 15);
	ctx2.font = "15px arial";
	ctx2.fillText(dateInfo, axisWidth + 10, 20);
	ctx2.fillText(tempInfo, axisWidth + 10, 50);
}

// get XMLHTTPRequest
var txtFile = new XMLHttpRequest();
txtFile.addEventListener("load", drawGraph);
txtFile.open("GET", "https://raw.githubusercontent.com/TessaRidderikhoff/Programmeren2/master/Homework/2_Javascript/KNMI_20180101.txt");
txtFile.send();
