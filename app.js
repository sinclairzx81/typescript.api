var typescript = require("./bin/index.js");

typescript.resolve(['test/program.ts'], function(units){

	typescript.compile(units, function(compilation) {
		
		console.log(compilation);
		
		//typescript.run(compilation, null, function(context) {
			
			
			
		//});
		
		//typescript.reflect(compilation, function(reflection) {
		
			//var output = JSON.stringify(reflection, null, ' ');
		
			//console.log(output);
		
		//});
	
	});

});



















 
 
