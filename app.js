var typescript = require("typescript.api");

var unit = typescript.units.create("temp.ts", "export var value:number = 123;");

typescript.compile([unit], function(compilation) {
	typescript.run(compilation, null, function(context) { 
		console.log(context);
	});
});
 









 
 
