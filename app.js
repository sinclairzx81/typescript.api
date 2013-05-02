var typescript = require("./bin/index.js");

var unit = typescript.units.create("temp.ts", "export var value:number = 123;");

typescript.compile([unit], function(compilation) {
	typescript.run(compilation, null, function(context) { 
		console.log(context);
	});
});
 









 
 
