var spawn = require('child_process').spawn;



var node = null;

exports.start = function(filename) {

	if(node) {

		node.kill();
	}
	
	node = spawn('node', [filename], { stdio: 'inherit' });

};