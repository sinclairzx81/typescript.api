////////////////////////////////////////////////////////////////////
//
// Note: will build the TypeScript.Api for TypeScript 0.9 alpha
//
// 	requires: the tsc 0.9 command line compiler...
//
////////////////////////////////////////////////////////////////////

var path  = require('path');

var tools = require('./build/tools.js');

// variables
var src_dir                    = path.join( path.dirname( global.process.mainModule.filename ), "/src/");
var bin_dir           		   = path.join( path.dirname( global.process.mainModule.filename ), "/bin");
var compiler_input_filename    = path.join(src_dir, 'api/compiler.ts' );
var compiler_output_filename   = path.join(bin_dir, 'typescript.api.js');
var index_input_filename       = path.join(src_dir, 'api/index.ts' );
var index_output_directory     = bin_dir;
var typescript_input_filename  = path.join(src_dir, 'api/resx/typescript.js');
var typescript_output_filename = path.join(bin_dir, 'typescript.js');

// thing to run after the build..
var post_build_filename   = path.join( path.dirname( global.process.mainModule.filename ), "app.js")

// runs a build.
function build () {
	
	console.log('compiling typescript api');
	tools.builder.build_single([compiler_input_filename], compiler_output_filename , function() {
		  
		  console.log('compiling index');
		  tools.builder.build_modular([index_input_filename], index_output_directory, function() {
			  
			  console.log('copying dependencies');
			  tools.builder.copyfile(typescript_input_filename, typescript_output_filename, function(){
			  
				  console.log('running post build ');
				  tools.nodestart.start( post_build_filename );					
			  });
		  });			  
	});
}

// optional - run this to rebuild on source changes.
//tools.dirwatch.watch(src_dir, null, function() {
	//run_build();
//});

// run build on startup..
build();





