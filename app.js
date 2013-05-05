var typescript = require("./bin/index.js");

function each(list, callback) {
	for(var n in list) {
		callback(list[n]);
	}
}

var level = 0;
function pad() {
	var buff = ''; for(var n = 0; n < level; n++) buff += '    ';
	return buff;
}

function print_type(type) {
	console.log(pad() + type.name);	
	each(type.arguments, function(argument) {
		level++;
		print_type(argument);
		level--;
	});
}


typescript.resolve(['test/program.ts'], function(units){

	typescript.compile(units, function(compilation) {
		
		typescript.reflect(compilation, function(reflection) {
			
			var json = JSON.stringify(reflection, null, ' ');
			
			console.log(json);
		});
	});
});



















 
 
