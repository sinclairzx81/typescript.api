# typescript.api

The typescript.api is a lightweight api that enables nodejs developers to compile 
and run typescript source code. 

## Example 

The following is an example of using the api to compile the source file 'program.ts'. 

The process will first resolve 'program.ts' and all its reference sources. The resolved 
sources (units) are then passed to the compiler for compilation. The compilation object
is then sent to be run.

```javascript
var typescript = require("typescript.api");

var sources = ["test/program.ts"];

function has_errors(compilation) {
	
	// errors can be listed on the compilation.diagnostics array.
	
	return compilation.diagnostics.length > 0; 
}

typescript.units.resolve(sources, function(units) {
	
	typescript.compile(units, function(compilation) {
		
		if(!has_errors (compilation) ) {
			
			typescript.run(compilation, null, function(context) {
				 
				 // exported members available on the context...
				 
			});
		}
	});
});