// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

////////////////////////////////////////////////////////////////////
//
// Note: will build the TypeScript.Api for TypeScript 0.9 alpha
//
// 	requires: the tsc 0.9 command line compiler...
//
////////////////////////////////////////////////////////////////////

var path  = require('path');

var tools = require('./tools/tools.js');

// variables
var src_dir					   = path.join( path.dirname( global.process.mainModule.filename ), "/src/");
var bin_dir					   = path.join( path.dirname( global.process.mainModule.filename ), "/bin");
var compiler_input_filename    = path.join(src_dir, 'api/compiler.ts' );
var reflect_input_filename     = path.join(src_dir, 'api/reflect.ts' );
var compiler_output_filename   = path.join(bin_dir, 'typescript.api.js');
var index_input_filename       = path.join(src_dir, 'api/index.ts' );
var index_output_directory     = bin_dir;
var typescript_input_filename  = path.join(src_dir, 'api/resx/typescript.js');
var typescript_output_filename = path.join(bin_dir, 'typescript.js');
var node_decl_input_filename   = path.join(src_dir, 'api/decl/node.d.ts');
var node_decl_output_filename  = path.join(bin_dir, 'decl/node.d.ts');
var lib_decl_input_filename    = path.join(src_dir, 'api/decl/lib.d.ts');
var lib_decl_output_filename   = path.join(bin_dir, 'decl/lib.d.ts');
var package_input_filename     = path.join(src_dir, 'api/resx/package.json');
var package_output_filename    = path.join(bin_dir, 'package.json');
var readme_input_filename      = path.join(src_dir, '../README.md');
var readme_output_filename     = path.join(bin_dir, 'README.md');

// thing to run after the build..
var post_build_filename   = path.join( path.dirname( global.process.mainModule.filename ), "app.js")

// runs a build.

function build () {
	console.log('-------------------------------------------------------');
	tools.builder.prepare_directory(bin_dir);
	tools.builder.prepare_directory(bin_dir + '/decl');
	
	console.log('compiling typescript api....');
	tools.builder.build_single([compiler_input_filename, reflect_input_filename], compiler_output_filename , function() {
		  
		  console.log('compiling index....');
		  tools.builder.build_modular([index_input_filename], index_output_directory, function() {
			  
			  console.log('copying typescript.js....');
			  tools.builder.copyfile(typescript_input_filename, typescript_output_filename, function(){
				  
				  console.log('copying lib.d.ts....');
				  tools.builder.copyfile(lib_decl_input_filename, lib_decl_output_filename, function(){	
				  
					  console.log('copying node.d.ts....');
					  tools.builder.copyfile(node_decl_input_filename, node_decl_output_filename, function(){	
					  
						  console.log('copying package.json....');
						  tools.builder.copyfile(package_input_filename, package_output_filename, function(){	
						  
							  console.log('copying README.md....');
							  tools.builder.copyfile(readme_input_filename, readme_output_filename, function(){	
							  
								  console.log('running post build....');
								  console.log('-------------------------------------------------------');
								  tools.nodestart.start( post_build_filename );	
							  });
						  });
					  });
				  });
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





