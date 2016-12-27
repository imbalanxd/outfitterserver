var PythonShell = require('python-shell');
var util = require('../util');

module.exports = {
	runItemParse: function () {
		var updateState;

		var shell = new PythonShell('../dotaitems/ItemParse.py', { mode: 'json'});
		shell.on('message', function (message) {
	  		updateState = message;
	  		if(updateState.update)
	  			util.log('Updating Data');
		});

		shell.end(function (err) {
	  		if (err) throw err;
	  		if(!updateState.update)
	  			util.log("No Update Required");
	  		else
	  			util.log('Update Complete: ' + updateState.id);
		});
	}
}
