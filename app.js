var typescript = require("./bin/index.js");

var sources = ["test/program.ts"];

typescript.debug = false;
 
function diagnostics(compilation) {

	console.log(compilation.diagnostics);
}

typescript.units.resolve(sources, function(units) {
	
	typescript.compile(units, function(compilation) {
		
		diagnostics(compilation);
		
		typescript.run(compilation, null, function(context) {
			 
		});
	});
});
 









 
 
