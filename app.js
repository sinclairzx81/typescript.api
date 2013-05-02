var typescript = require("./bin/index.js");

var sources = ["test/program.ts", "test/program.ts"];

var unit    = typescript.units.create("ads.ts", "var a = 10;");

typescript.units.resolve(sources, function(units) {
	
	typescript.compile(units, function(compilation) {
		
		console.log(compilation);
		
	});
});

var unit = typescript.units.create("virtual", "var a = 10;");

typescript.compile([unit], function(compilation) {

	console.log(compilation);

});








 
 
