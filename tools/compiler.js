var node = {

    path  : require('path'),

    fs    : require('fs'),

    spawn : require('child_process').spawn
}

exports.build = function(sources, arguments , output_filename , callback) {

    sources.unshift("--out", output_filename);

    for(var n in arguments) {

        sources.push(arguments[n]);
    }
	
	var tsc = require("child_process").spawn('tsc', sources, { stdio: 'inherit' });
	
	tsc.on('close', function() {
		
	    setTimeout(function() {
            
            callback();

	    }, 250);
	});	
}