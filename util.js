
module.exports = {
	log: function(message) {
		console.log("["+(new Date())+"] " + message);
	},
	formatKey: function(key) {
	return key.replace(".","").replace("#","").replace("$","").replace("/","").replace("[","").replace("]","");
	}
}