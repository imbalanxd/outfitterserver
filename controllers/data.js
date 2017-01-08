var fs = require('fs');
var path = require('path');
var dataFolder = path.join(__dirname, '../../dotaitems/');
var versionIndexFileName = dataFolder + "index.json";
var util = require('../util');

module.exports = {
	getFirstVersion: function() {
		return getVersionForIndex(1);
	},
	getLatestVersion: function() {
		delete require.cache[versionIndexFileName];
		versionIndex = JSON.parse(fs.readFileSync(versionIndexFileName, 'utf8'));
		var max = 1;
		for (var index in versionIndex) {
			if (versionIndex.hasOwnProperty(index) && max < index) {
		    	max = index;
		  	}
		}
		return versionIndex[index].id;
	},
	getNextVersion: function(currentVersion) {
		if(currentVersion == null)
			return getVersionForIndex(1);
		return getVersionForIndex(parseInt(getIndexForVersion(currentVersion)) + 1);
	},
	getVersionData: function(version) {
		getDataForVersion(version);
	},
	getIndexForVersion: function(version) {
		return getIndexForVersion(version);
	},
	getVersionDataHeroSort: function(version) {
		return sortData(getDataForVersion(version), "used_by_heroes");
	}
}

function getIndexForVersion(version) {
	delete require.cache[versionIndexFileName];
	versionIndex = JSON.parse(fs.readFileSync(versionIndexFileName, 'utf8'));
	for (var index in versionIndex) {
	  if (versionIndex.hasOwnProperty(index) && (versionIndex[index].id == version)) {
	    return index;
	  }
	}
}

function getVersionForIndex(index) {
	delete require.cache[versionIndexFileName];
	versionIndex = JSON.parse(fs.readFileSync(versionIndexFileName, 'utf8'));
	if(versionIndex.hasOwnProperty(index))
		return versionIndex[index].id;
	else
		return null;
}

function getDataForVersion(version) {
	var data = null;
	try {
		data = require(dataFolder + "itemdata/" + version + "/newitemlist.json");
	}
	catch (err) {}
	if(data == null)
		data = require(dataFolder + "itemdata/" + version + "/itemlist.json");
	return data;
}

function sortData(data, sortBy) {
	var sortedData = {};
	for(var key in data) {
		for(var name in data[key]) {
			if(data[key][name].hasOwnProperty("used_by_heroes")) {
				for(var hero in data[key][name]["used_by_heroes"]) {
					if(sortedData[hero] == null)
						sortedData[hero] = {};
					sortedData[hero][util.formatKey(name)] = data[key][name];
				}
			}
		}
	}
	return sortedData;
}