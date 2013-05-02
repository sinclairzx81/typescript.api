var typescript = require("./bin/index.js");

var sources = ["test/program.ts"];

typescript.units.resolve(sources, function(units) {
	
	typescript.compile(units, function(compilation) {
		
		console.log(compilation);
		
	});
});









 
 
