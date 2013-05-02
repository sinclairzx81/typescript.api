var typescript = require("./bin/binding.js");

typescript.api(function(api) {
	
	var writer   = new api.TextWriter();
	
	var ioHost   = new api.IOHost( writer, writer );
	
	var compiler = new api.Compiler( ioHost );

	var sources  = ['test/data.ts'];

	compiler.resolve(sources, function(files) {
		 
		 for(var n in files) {
		 
			console.log(files[n].path);
			
		 }
	});	
});







 
 
