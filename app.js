const csv = require('csv-parser')
let fs = require('fs')
let path = require('path');
let csvDir = path.join('csse_covid_19_data', 'csse_covid_19_daily_reports');
var dataCopy = {};
var worldWideData = {"Confirmed": 0, "Deaths": 0, "Recovered": 0, "Active": 0};
var worldWideDataFile = "";

function setOutputData(data, k) {
	if (dataCopy[data[k].Country_Region] == null) {
	    dataCopy[data[k].Country_Region] = {"Confirmed": data[k].Confirmed, "Deaths": data[k].Deaths, "Recovered": data[k].Recovered, "Active": data[k].Active};
	}
	else {
		dataCopy[data[k].Country_Region].Confirmed = +dataCopy[data[k].Country_Region].Confirmed + +data[k].Confirmed;
		dataCopy[data[k].Country_Region].Deaths = +dataCopy[data[k].Country_Region].Deaths + +data[k].Deaths;
		dataCopy[data[k].Country_Region].Recovered = +dataCopy[data[k].Country_Region].Recovered + +data[k].Recovered;
		dataCopy[data[k].Country_Region].Active = +dataCopy[data[k].Country_Region].Active + +data[k].Active;
	}
}

fs.readdir(csvDir, (err, files) => {
  files.sort();
  files.forEach(fileName => {
	var lastFile = fileName == files[files.length-2];
	console.log(files[files.length-2]);
	fileName = path.join(csvDir, fileName);
	if (path.parse(fileName).ext == '.csv') {
	  
      let fileOutputName = path.join('daily_cases_json', path.parse(fileName).name + '.json');
	  let worldWideDataFile = path.join('worldwide_cases', path.parse(fileName).name + '.json');
	  var data = [];
	  fs.createReadStream(fileName)
		.pipe(csv())
		.on('data', (myData) => data.push(myData))
		.on('end', () => {	  
	      dataCopy = {};
		  for (let k = 0; k < data.length; k++) {
			setOutputData(data, k);
			  if (lastFile) {
				worldWideData['Confirmed'] = +worldWideData['Confirmed'] + +data[k].Confirmed;
				worldWideData['Deaths'] = +worldWideData['Deaths'] + +data[k].Deaths;
				worldWideData['Recovered'] = +worldWideData['Recovered'] + +data[k].Recovered;
				worldWideData['Active'] = +worldWideData['Active'] + +data[k].Active;
			  }
		  }
		  fs.writeFile(fileOutputName, JSON.stringify(dataCopy, null, '  '), function(err) {
			if (err) {
			}
		  });
	      
		  if (lastFile) {
			fs.writeFile(worldWideDataFile, JSON.stringify(worldWideData, null, '  '), function(err) {
		      if (err) {
				console.log(err);
			  }
			});
		  }
		});
    }
  });
});
