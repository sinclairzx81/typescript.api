var typescript = require("./bin/binding.js");

var sources = ["test/program.ts"];

typescript.resolve(sources, false, function(sources) {
	
	typescript.compile(sources, false, function(sources){
		
		
		console.log(sources);
		
	});
	
});








 
 
