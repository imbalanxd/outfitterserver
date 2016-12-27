var admin = require("firebase-admin");
var serviceAccount = require("../../secrets/serviceAccountKey.json");
var util = require('../util');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dota2outfitter.firebaseio.com",
  databaseAuthVariableOverride: {
    uid: "d2o-server"
  }
});
var db = admin.database();

function setData(dest, child, data, func) {
	var ref = db.ref(dest);
	var usersRef = ref.child(child);
	usersRef.set(data, function(error) {
			if(func != null)
				func(error);
		});
}

function updateData(dest, child, data, func) {
	var ref = db.ref(dest);
	var usersRef = ref.child(child);
	usersRef.update(data, function(error) {
			if(func != null)
				func(error);
		});
}

function readData(dest, orderBy, count, func) {
	var ref = db.ref(dest);

	if(orderBy != null) {
		if(orderBy == "key")
			ref = ref.orderByKey();
		else
			ref = ref.orderByChild(orderBy);
	}
	if(count != null) {
		count = (count+"").split(" ");
		if(count.length == 1 || count[0] == "first")
			ref = ref.limitToFirst(count.length == 1 ? parseInt(count[0]) : parseInt(count[1]));
		else if(count[0] == "last")
			ref = ref.limitToLast(parseInt(count[1]));

	}
	ref.once("value", func, 
		function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
}

function writeDataRecursive(dest, data, func, iteration) {
	var keys = Object.keys(data).sort();
	updateData(dest, keys[iteration], data[keys[iteration]], function(error) {
		if(error != null) {
			func(error);
		}
		else {
			util.log("Updated "+dest+"/"+keys[iteration] + " with " + Object.keys(data[keys[iteration]]).length +" items");
			if(iteration < keys.length - 1)
				writeDataRecursive(dest, data, func, iteration+1);
			else
				func(null);
		}
	});
}

module.exports = {
	recursiveUpdate:function(dest, data, func) {
		if(Object.keys(data).length > 0)
			writeDataRecursive(dest, data, func, 0);
		else
			func(null);
	},

	set:function(dest, child, data, func) {
		setData(dest, child, data, func);
	},

	update:function(dest, child, data, func) {
		updateData(dest, child, data, func);
	},

	read: function(dest, func) {
		readData(dest, null, null, func);
	},

	read: function(dest, orderBy, func) {
		readData(dest, orderBy, null, func);
	},

	read: function(dest, orderBy, count, func) {
		readData(dest, orderBy, count, func);
	}
}