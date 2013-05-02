var typescript = require("./bin/index.js");

var sources = ["test/program.ts", "test/program.ts"];

//typescript.units.resolve(sources, function(units) {
	
	//typescript.compile(units, function(compilation) {
		
		//console.log(compilation);
		
	//});
//});

var fs = require('fs');

var unit = typescript.units.create("virtual.ts", fs.readFileSync(__dirname+ '/test/program.ts', 'utf8') );

console.log(unit);

typescript.compile([unit], function(compilation) {

	//console.log(compilation);

});








 
 
