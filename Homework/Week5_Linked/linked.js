/*
Linked.js
Tessa Ridderikhoff 
10759697
18-5-2018

This script creates a world map, depicting the Gender Inequality Index in each country by colour.
It also creates a bar graph, displaying the average number of years of education men and women
receive in a country, which can be selected by pressing on the world map.

The GII can be updated for different years.

*/

window.onload = function() {

	// wait for all datasets to load
	d3.queue()
		.defer(d3.json, "MaleYearsOfSchooling.json")
		.defer(d3.json, "YearsOfSchooling.json")
		.defer(d3.json, "GII.json")
		.defer(d3.json, "custom.geo.json")
		.awaitAll(createMap);

	// create bar graph
    createBarGraph();
}

function createMap(error) {
/*
This function creates a map of the world and colours the countries based on the Gender Inequality Index
of that country.

The default year that is displayed is 2015.

*/
	// report error if data does not load succesfully
	if (error) throw error;

	// set map properties
	margin = {top: 20, right: 20, bottom: 20, left: 20}
	mapWidth = 800;
	mapHeight = 400;

	// select the mapsvg and set width and height
	mapsvg = d3.select(".mapsvg")
		.attr("width", mapWidth)
		.attr("height", mapHeight);

	// create projection to create map of the world
	var projection = d3.geo.mercator()
      .scale(120)
      .translate([mapWidth / 2, mapHeight / 2])

    // use projection to create path
    var path = d3.geo.path()
      .projection(projection);
    
    // use geo json of the world to create map
    d3.json("custom.geo.json", function(geojson) {

    	// append g element to svg to hold the map
    	countryGroup = mapsvg.append("g").attr("id", "map");

    	// create map
    	countries = countryGroup
    	.selectAll("path")
    	.data(geojson.features)
    	.enter()
    	.append("path")
    	.attr("d", path)
    	.attr("class", "country")

    	// set id of country to name of country (without spaces)
    	.attr("id", function(d) {
    		countryid = d.properties.admin;
    		countryid = countryid.replace(/\s+/g, "");
    		return countryid;
    	})

    	// colour country grey in case the country is not in GII dataset
    	.attr("fill", "rgb(211, 211, 211)")

    	// update bargraph when country is clicked
    	.on("click", function(d, i) {
    		updateBarGraph(d.properties.admin);
    	})

	    // use GII dataset to colour countries based on their Gender Inequality Index (GII)
	    d3.json("GII.json", function(GII) {

	    	// create colourscale that transforms the GII to a shade of red
	    	colourScale = d3.scale.linear()
	    					.domain([0, 1])
	    					.range([255, 0]);

	    	// loop through GII data
	    	for (i = 2; i < GII.length; i++) {
	    		
	    		// create id-string of country (no spaces)
	    		idcheck = String("#" + GII[i].Country);
	    		idcheck = idcheck.replace(/\s+/g, "");
	    		
	    		// select country in map (by id)
	    		d3.selectAll(idcheck)

	    			// colour selected country 
	    			.attr("fill", function(d) {

	    				// use colourscale if GII of country is known (yellow: GII = 0, red: GII = 1)
	    				if (GII[i].y2015) {
	    					return "rgb(255, " + colourScale(Number(GII[i].y2015)) + ",0)"
	    				}

	    				// if GII of country is not in dataset, colour country grey
	    				else {
	    					return "rgb(211, 211, 211)"
	    				}
	 				})
	 				// give country the GII as attribute
	 				.attr("GII", GII[i].y2015)
	    	}

	    	// create tooltip for countries containing country names and GII
	    	var tip = d3.tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function(d) {
					return "<strong>Country: </strong> <span>" + d.properties.admin + 
					"</span> <br> <strong>GII: </strong> <span>" + d3.select(this).attr('GII') + "</span>"
				})

			// call the tooltip
			mapsvg.call(tip);

			// show tooltip on mouseover, and hide on mouseout
			countries
				.on("mouseover", tip.show)
				.on("mouseout", tip.hide);

	    	// create defs to hold linear gradient function
	    	var defs = mapsvg.append("defs");

		    // set linear gradient direction for legend
		    var linearGradient = defs.append("linearGradient")
		    	.attr("id", "linear-gradient")
		    	.attr("x1", "0%")
		    	.attr("y1", "0%")
		    	.attr("x2", "100%")
		    	.attr("y2", "0%");

		    // define start of gradient for legend
		    linearGradient.append("stop")
		    	.attr("offset", "0%")
		    	.attr("stop-color", "rgb(255, " + colourScale(0) + ",0)");


		    // define end of gradient for legend
		    linearGradient.append("stop")
		    	.attr("offset", "100%")
		    	.attr("stop-color", "rgb(255, " + colourScale(1) + ",0)");

		    // create g-element to hold legend
		    var legend = mapsvg.append("g");
		    var legendwidth = 200;

			// create legend colourblock with colour gradient function
			legend.append("rect")
		    	.attr("width", legendwidth)
		    	.attr("height", 15)
		    	.attr("x", mapWidth/2 - legendwidth/2)
		    	.attr("y", mapHeight - 30)
		    	.style("fill", "url(#linear-gradient)");

		    // create grey legend block to display the no-data colour
		    legend.append("rect")
		    	.attr("width", 30)
		    	.attr("height", 15)
		    	.attr("x", mapWidth/2 + legendwidth/2 + 30) 
		    	.attr("y", mapHeight - 30)
		    	.style("fill", "rgb(211, 211, 211)")

		    // append text element to legend as a legend title
		    var legendtitle = legend.append("text")
		    	.attr("class", "legend-title")
		    	.text("Gender Inequality Index")

		    // get width of legend title
		    var textwidth = d3.select(".legend-title").node()
		    	.getBoundingClientRect()
		    	.width;

		    // display legend title in the middle of the map
		    legendtitle
		    	.attr("x", mapWidth/2 - (textwidth/2))
		    	.attr("y", mapHeight - 40)

		    // put values of GII at both ends of the legend
		    legend.append("text")
		    	.attr("x", mapWidth/2 - legendwidth/2 - 10)
		    	.attr("y", mapHeight - 20)
		    	.text("0");

		    legend.append("text")
		    	.attr("x", mapWidth/2 + legendwidth/2 + 5)
		    	.attr("y", mapHeight - 20)
		    	.text("1")

		    // put "no data" next to the no-data colour block
		    var nodatatitle = legend.append("text")
		    	.attr("class", "nodata-title")
		    	.text("No data")
		    	.attr("x", mapWidth/2 + (legendwidth/2) + 65)
		    	.attr("y", mapHeight - 20)

		    })    

    })

    
}

function createBarGraph() {
/*
This function creates a bar graph, displaying the average number of years females and males receive 
an education in a country, over the last 25 years (every 5 years).

The default country that is displayed is the Netherlands.

*/

	// set default country of bar graph to the Netherlands
	country = "Netherlands"

	// set properties of bar graph
	margin = {top: 20, right: 70, bottom: 70, left: 40}
	width = 430;
	height = 400;

	// set bar graph svg to bar graph properties	
	barsvg = d3.select(".barsvg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.bottom + margin.top);

	// create array of years for x-axis-scale
	var years = [0, 1, 2, 3, 4, 5, 6];

	// create x-axis-scale 
	xScale = d3.scale.ordinal()
		.domain(years)
		.rangePoints([margin.left, width]);

	// create x-axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")

	// call x-axis
	barsvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height) + ")")
        .call(xAxis)
        
        // remove text on x-axis
        .selectAll("text")
        .remove();

    // create x-axis title
    barsvg.append("g")
	    .append("text")
	    .attr("class", "axistitle")
	    .attr("y", height + 40)
	    .attr("x", width/2)
	    .text("Years");

	// create yScale (without domain, since this is not yet known)
	yScale = d3.scale.linear()
		.range([0, height]);

	// create scale for y-axis (without domain)
	yAxisScale = d3.scale.linear()
		.range([height, 0]);

	// create title of graph
	title = barsvg.append("text")
		.attr("class", "graphtitle")
		.text(country);

	// determine width of text of title to put title in the middle
	titlewidth = d3.select(".graphtitle").node()
		.getBoundingClientRect()
		.width;

	// place title
	title
		.attr("x", (width/2) - (titlewidth/2))
		.attr("y", 50);

    // create tooltip for bar graph with average years of schooling
    var bartip = d3.tip()
	.attr("class", "d3-tip")
	.offset([-10, 0])
	.html(function(d) {
		return "<strong>Average years of schooling: </strong> <span>" + d + "</span>"
	})

	// call tooltip
	barsvg.call(bartip)

	// create empty array to determine maximum value of data
	var allYears = [];

	// add all data points from years of schooling to allYears array
	d3.json("YearsOfSchooling.json", function(data) {
		for (i = 1; i < data.length; i++) {	
			allYears.push(data[i].y1990)
			allYears.push(data[i].y1995)
			allYears.push(data[i].y2000)
			allYears.push(data[i].y2005)
			allYears.push(data[i].y2010)
			allYears.push(data[i].y2015)
		}

		// determine maximum value from array
		maxYears = Math.max(...allYears);
		
		// determine domain of y-value scale based on maximum of data
		yScale
			.domain([0, maxYears]);

		// determine domain of y-axis scale based on maximum of data
		yAxisScale
			.domain([0, maxYears]);


		// create y-axis
		var yAxis = d3.svg.axis()
			.scale(yAxisScale)
			.orient("left")

		// add y-axis to svg
		barsvg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate("+ margin.left + ",0)")
            .call(yAxis);

        // add y-axis title (rotated)
        barsvg.append("g")
            .append("text")
            .attr("class", "axistitle")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", -margin.left)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Average years of schooling");


		// loop through data to find data of selected country (for women)
		for (i = 1; i < data.length; i++) {
			
			// remove spaces from country name to compare if this country is selected
			data[i].Country = data[i].Country.replace(/\s/g, "");
			
			// if this country is the selected country: create dataset
			if (data[i].Country == country) {

				// initiate empty dataset
				databargraph = [];

				// add data of all years
				databargraph.push(data[i].y1990)
				databargraph.push(data[i].y1995)
				databargraph.push(data[i].y2000)
				databargraph.push(data[i].y2005)
				databargraph.push(data[i].y2010)
				databargraph.push(data[i].y2015)

				// create bar graph of female data
				var barsFemale = barsvg.selectAll("#barsfemale")
					.data(databargraph)
					.enter()
					.append("rect")
					.attr("id", "barsfemale")
					.attr("class", "bars")
					.attr("x", function(d, i) {
						console.log(i)
						return xScale(i) + (width/databargraph.length)/10
					})
					.attr("y", function(d) {
						return (height) - yScale(d);
					})
					.attr("height", function(d) {
						return yScale(Number(d))
					})
					.attr("width", function(d) {
						console.log(databargraph.length)
						return width / (databargraph.length * 3)
					})
					.attr("fill", "red")


				// add invisible text element on bar (to display when hovered over legend)
				var bartextfemale = barsvg.selectAll(".bartextfemale")
					.data(databargraph)
					.enter()
					.append("text")
					.attr("class", "bartext bartextfemale")
					.text(function(d) {
						return d;
					})
					.attr("x", function(d, i) {
						return xScale(i) + (width/databargraph.length)/10
					})
					.attr("y", function(d) {
						return (height) - yScale(d) + 10;
					})
					.style("opacity", 0)

				// show tooltip when hovered over bar and decrease opacity of other bars
				barsFemale
					.on("mouseover", function(d) {
						bartip.show(d);
						var self = this;
						d3.selectAll(".bars").filter(function(d) {
							return self != this;
						})
						.transition().style("opacity", 0.2)
					})
					
					// restore settings when the mouse no longer hovers the bar
					.on("mouseout", function(d) {
						bartip.hide(d);
						d3.selectAll(".bars").transition().style("opacity", 1)
					});
			}
		}
	})

	// add male data to bar graph
	d3.json("MaleYearsOfSchooling.json", function(data) {

		// loop through data to find selected country
		for (i = 1; i < data.length; i++) {
			
			// remove spaces from country 
			data[i].Country = data[i].Country.replace(/\s/g, "");
			
			// if looped-through country is the same as the selected country: create dataset
			if (data[i].Country == country) {

				// add data of all years to empty dataset
				maledatabargraph = [];

				maledatabargraph.push(data[i].y1990)
				maledatabargraph.push(data[i].y1995)
				maledatabargraph.push(data[i].y2000)
				maledatabargraph.push(data[i].y2005)
				maledatabargraph.push(data[i].y2010)
				maledatabargraph.push(data[i].y2015)

				// create bar graph of male education data
				var barsMale = barsvg.selectAll("#barsmale")
					.data(maledatabargraph)
					.enter()
					.append("rect")
					.attr("id", "barsmale")
					.attr("class", "bars")
					.attr("x", function(d, i) {
						return xScale(i) + ((width/maledatabargraph.length)/10) * 5
					})
					.attr("y", function(d) {
						return (height) - yScale(d);
					})
					.attr("height", function(d) {
						return yScale(Number(d))
					})
					.attr("width", function(d) {
						return width / (maledatabargraph.length * 3)
					})
					.attr("fill", "steelblue");

				// create invisible text-element with the value of the bar, to be displayed when hovered over legend
				var bartextmale = barsvg.selectAll(".bartextmale")
					.data(maledatabargraph)
					.enter()
					.append("text")
					.attr("class", "bartext bartextmale")
					.text(function(d) {
						return d;
					})
					.attr("x", function(d, i) {
						return xScale(i) + ((width/maledatabargraph.length)/10) * 5
					})
					.attr("y", function(d) {
						return (height) - yScale(d) + 10;
					})
					.style("opacity", 0);

				// show tooltip on hover, and decrease opacity of other bars
				barsMale
					.on("mouseover", function(d) {
						bartip.show(d);
						var self = this;
						d3.selectAll(".bars").filter(function(d) {
							return self != this;
						})
						.transition().style("opacity", 0.2)
					})
					
					// restore to original settings
					.on("mouseout", function(d) {
						bartip.hide(d);
						d3.selectAll(".bars").transition().style("opacity", 1)
					});
			}
		}
	})

	// define categories for the legend
	categories = ["Male", "Female"]
	
	// create g-element to hold legend
	legend = barsvg.selectAll(".legend")
		.data(categories)
		.enter()
		.append("g")
		.attr("class", "legend")
		
	// add colourblock to legend to display the colours of the categories
	legend.append("rect")
		.attr("class", "legend")
		.attr("x", width + margin.left)
		.attr("y", function(d, i) {
			return margin.top + (i * 15)
		})
		.attr("height", 10)
		.attr("width", 20)
		.attr("fill", function(d) {
			
			// fill legend with blue for males
			if (d == "Male") {
				return "steelblue";
			}
			
			// fill legend with red for females
			else {
				return "red";
			}
		});

	// add text to legend with the categories
	legend.append("text")
		.attr("x", width + margin.left + 25)
		.attr("y", function(d, i) {
			return margin.top + 10 + (i * 15)
		})
		.text(function(d) {
			return d
		});		

	// display values of bar of category when hovered over legend category
	legend
		.on("mouseover", function(d) {
			if (d == "Male") {
				
				// decrease opacity of female data
				d3.selectAll("#barsfemale").transition().style("opacity", 0.2)

				// show text-element of values of the male data
				d3.selectAll(".bartextmale").transition().style("opacity", 1)
			}
			else {
				
				// decrease opacity of male data
				d3.selectAll("#barsmale").transition().style("opacity", 0.2)

				// show text-element of values of the female data
				d3.selectAll(".bartextfemale").transition().style("opacity", 1)
			}
		})
		
		// on mouseout, return opacity of all bars to 1 and hide all text-elements
		.on("mouseout", function(d) {
			d3.selectAll(".bars").transition().style("opacity", 1)
			d3.selectAll(".bartext").transition().style("opacity", 0)
		})
}


function updateBarGraph(country) {
/*
This function updates the bar graph that displays the average number of years men and women receive 
education in a country, to display the data of a selected country.

*/

	// select female data
	d3.json("YearsOfSchooling.json", function(data) {
		
		// loop through countries to find the selected country in the dataset
		for (i = 1; i < data.length; i++) {
				
				// remove spaces in country name to compare countries
				data[i].Country = data[i].Country.replace(/\s/g, "");
				
				if (data[i].Country == country) {

					// create new dataset array to hold female education data of the selected country
					var databarfemale = [];

					databarfemale.push(data[i].y1990)
					databarfemale.push(data[i].y1995)
					databarfemale.push(data[i].y2000)
					databarfemale.push(data[i].y2005)
					databarfemale.push(data[i].y2010)
					databarfemale.push(data[i].y2015)

					// select all bars from bar graph and change data to data of selected country
					newgraph = barsvg.selectAll(".bars")
						.data(databarfemale);

					// change the data displayed in the graph (using a transition)
					newgraph.transition()
						.duration(750)
						.attr("y", function(d) {
							return (height) - yScale(d);
						})
						.attr("height", function(d) {
							return yScale(d)
						})

					// change the invisible text-element with the value of the bars
					barsvg.selectAll(".bartextfemale")
						.data(databarfemale)
						.text(function(d) {
							return d;
						})
						.attr("y", function(d) {
							return (height) - yScale(d) + 10;
						})
				}
		}
	})

	// repeat for male data
	d3.json("MaleYearsOfSchooling.json", function(data) {
		
		// loop through data to find the selected country in the dataset
		for (i = 1; i < data.length; i++) {
				
				// remove spaces from country name
				data[i].Country = data[i].Country.replace(/\s/g, "");
				if (data[i].Country == country) {

					// create new dataset for male data of selected country
					var databarmale = [];

					databarmale.push(data[i].y1990)
					databarmale.push(data[i].y1995)
					databarmale.push(data[i].y2000)
					databarmale.push(data[i].y2005)
					databarmale.push(data[i].y2010)
					databarmale.push(data[i].y2015)

					// select the male bars and change the dataset to new dataset of selected country
					newgraph = barsvg.selectAll("#barsmale")
						.data(databarmale);

					// change the data displayed to new data (using a transition)
					newgraph.transition()
						.duration(750)
						.attr("y", function(d) {
							return (height) - yScale(d);
						})
						.attr("height", function(d) {
							return yScale(d)
						})

					// change invisible text element to new data
					barsvg.selectAll(".bartextmale")
						.data(databarmale)
						.text(function(d) {
							return d;
						})
						.attr("y", function(d) {
							return (height) - yScale(d) + 10;
						})
				}
		}
	})

	// update title of graph to selected country
	newtitle = barsvg.selectAll(".graphtitle")
		.text(country)

	// calculate new title width
	newtitlewidth = d3.select(".graphtitle").node()
		.getBoundingClientRect()
		.width;

	// place title
	newtitle
		.attr("x", (width/2) - (newtitlewidth/2));
}

function updateMap(year) {
/*
This function updates the world map displaying the GII to display the GII of a selected year.

*/
	// loop through GII data to find selected year
	d3.json("GII.json", function(GII) {

		// create string to select correct year
		selectyear = "GII[i]." + year;

    	for (i = 2; i < GII.length; i++) {
    		
    		// create string to select each country by id
    		idcheck = String("#" + GII[i].Country);
    		idcheck = idcheck.replace(/\s+/g, "");
    		
    		// select each country
    		d3.selectAll(idcheck)
    			
    			// change colour by transition
    			.transition()
    			
    			// fill country with GII score of that year
    			.attr("fill", function(d) {
    				
    				// use eval() to use string as variable
    				if (eval(selectyear)) {
    					return "rgb(255, " + colourScale(Number(eval(selectyear))) + ", 0)"
    				}
    				
    				// if no data is available of that year of that country, colour country grey
    				else {
    					return "rgb(211, 211, 211)"
    				}
 				})

 				// give the GII as an attribute to the country (to display in tooltip)
 				.attr("GII", eval(selectyear))
    	}
	})
}


