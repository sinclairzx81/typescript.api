var _path = require('path');
var _fs   = require('fs');

// creates a directory if it does not exist.
exports.prepare_directory = function(directory) {
	if(!_fs.existsSync(directory)){
		 _fs.mkdirSync(directory);	
	}
}

// just copies...
exports.copyfile = function(input_filename, output_filename, callback) {

	// copies input to output.

	var readstream = _fs.createReadStream( input_filename );

	var writestream = _fs.createWriteStream( output_filename );

	readstream.pipe(writestream);
	
	callback();

}
// just copies...
exports.cutpastefile = function(input_filename, output_filename, callback) {

	// copies input to output.

	var readstream = _fs.createReadStream( input_filename );

	var writestream = _fs.createWriteStream( output_filename );

	readstream.pipe(writestream);
	
	_fs.unlinkSync(input_filename);
	
	callback();

}

// compiles source into single output.
exports.build_single = function(sources, arguments , output_filename , callback) {
	
    

    sources.unshift("--out", output_filename);

    //sources.unshift("--nolib");

    for(var n in arguments)
    {
        sources.push(arguments[n]);
    }
	
	var tsc = require("child_process").spawn('tsc', sources, { stdio: 'inherit' });
	
	tsc.on('close', function() {
		
		callback();
	});	
}

// compiles modular source and copies to output directory.
exports.build_modular = function(sources, output_directory, callback) {

	var tsc = require("child_process").spawn('tsc', sources, { stdio: 'inherit' });
		
	tsc.on('close', function() {
		
		// copy to output_directory.
		
		for(var n in sources) {
			
			var input_directory = _path.dirname(sources[n]);
			
			var input_filename  = _path.basename(sources[n]).replace('.ts', '.js');
			
			var output_filename = _path.join(output_directory, input_filename);
			
			input_filename      = _path.join(input_directory, input_filename);
			
			// copy output into bin directory,
			
			exports.copyfile (input_filename, output_filename, function(){
			
				// delete
				
				_fs.unlinkSync( input_filename );			
			
			});
		}
		
		callback();
	});		
}


