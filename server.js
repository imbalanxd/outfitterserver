var express = require('express');
var app = express();
var PythonShell = require('python-shell');
var schedule = require('node-schedule');

var itemparse = require("./controllers/itemparse");
var firebase = require("./controllers/firebase");
var data = require("./controllers/data");
var util = require('util');

app.listen(3001);
console.log('Listening on port 3001...');

function startItemParseScheduler() {
	console.log('Running ItemParse every 5 minutes');

	var rule = new schedule.RecurrenceRule();
	rule.minute = [0, 5, 10, 15, 20, 25, 30 ,35, 40, 45, 50, 55];
	schedule.scheduleJob(rule, function() {
		itemparse.runItemParse();
		updateData();
	});
}

function updateData() {
	util.log("Checking for data update");
	updateRequired( function(id) {
		util.log("Updating data to version " + id);
		var uploadData = data.getVersionDataHeroSort(id);
		firebase.recursiveUpdate("public-data/items", uploadData, function(error) {
			if(error == null) {
				util.log("Item data updated succesfully");
				var version = {};
				version["id"] = id;
				version["index"] = data.getIndexForVersion(id);
				firebase.update("private-data/versions", data.getIndexForVersion(id), version, 
					function(error) {
						if(error == null) {
							util.log("Data version " + version["index"] + " added (" + version["id"] + ")");
						}
						else {
							util.log("Error updating data version: " + error);
						}
						updateData();
					});
			}
			else {
				util.log("Error occured while updating item data: " + error);
				updateData();
			}
		});
	});
}

function updateRequired(func) {
	firebase.read("private-data/versions", "key", "last 1",
		function(snapshot) {
			if(!snapshot.hasChildren())
				func(data.getNextVersion(null));
			else {
				snapshot.forEach(function(child) {
				if(child.val().hasOwnProperty("id")) {
					var id = data.getNextVersion(child.val()["id"]);
					util.log("Data version is " + child.val()["id"] + ", latest version is " + id);
					if(id != null)
						func(id);
					else
						util.log("Data version up to date");
				}
				else 
					func(data.getNextVersion(null));
			});
			}
		});
}

startItemParseScheduler();