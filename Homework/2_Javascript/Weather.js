	weatherdata = document.getElementById("rawdata");
	weatherdata = weatherdata.innerHTML.split("\n");
	for (i = 0; i < weatherdata.length; i++) {
		weatherdata[i] = weatherdata[i].split(",");
	}
	date = [];
	temp = [];
	for (i = 0; i < weatherdata.length; i++) {
		date[i] = weatherdata[i][0];
		temp[i] = weatherdata[i][1];
	}
	console.log(temp[4])