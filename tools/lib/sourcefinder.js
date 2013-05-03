var path = require('path');

var fs   = require('fs');

var sources    = [];

var extensions = [];


function find_sources (directory, extensions) {
	
	var contents = fs.readdirSync(directory); 

	for(var n in contents) {
			
		 var _path = path.join( directory, contents[n] );
			
		 stat = fs.lstatSync(_path);
		 
		 if(stat.isDirectory()) 
		 {
			
			find_sources (_path, extensions);
		 } 
		 else 
		 {
			if(extensions) {
			
				var ext = path.extname(_path);
				
				for(var m in extensions) {
				
					if(ext == extensions[m]) {
						
						if(_path.indexOf('.d.ts') == -1) {
						
							sources.push(_path);
							
						}
					}
				}
			}
			else{
				sources.push(_path);
			}
		 }
	}
}

exports.locate = function(directory, extensions) {
	
	sources = [];
	
	find_sources(directory, extensions);
	
	return sources;
}
