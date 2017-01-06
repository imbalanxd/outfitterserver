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
		itemparse.runItemParse(function(updateState, err) {
			if(err != null) {
				util.log("Error occured during update: " + err);
			}
			else {
				if(!updateState.update)
	  				util.log("No Update Required");
	  			else
	  				util.log('Update Complete: ' + updateState.id)
				updateData();
			}
		});
	});
}

function updateData() {
	util.log("Checking Firebase data version");
	updateRequired( function(id) {
		util.log("Updating Firebase data to version " + id);
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
							util.log("Firebase data version " + version["index"] + " added (" + version["id"] + ")");
						}
						else {
							util.log("Error updating data version: " + error);
						}
						util.log("");
						updateData();
					});
			}
			else {
				util.log("Error occured while updating item data: " + error);
				util.log("");
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
					// util.log("Data version is " + child.val()["id"] + ", latest version is " + id);
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