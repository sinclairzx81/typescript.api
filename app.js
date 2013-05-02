var typescript = require("./bin/index.js");

var sources = ["test/program.ts"];

function has_errors(compilation) {
	
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
 









 
 
