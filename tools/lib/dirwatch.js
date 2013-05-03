// watches a directory, returns on change. 

var fs    = require("fs");

var path  = require("path");

var state = {

	root        : '',
	
	last_event  : new Date(),
	
	directories : [],
	
	extensions  : [],
	
	onchange    : function() {}
};

function build_directories(directory) {

	state.directories.push(directory);
	
	var contents = fs.readdirSync(directory); 
	
	for(var n in contents) {
			
		 var dir = path.join (directory, contents[n]);
			
		 stat = fs.lstatSync(dir);
		 
		 if(stat.isDirectory()) {
			
			build_directories(dir);
		 }
	}
}


exports.watch = function(root, extensions, recursive, onchange) {
	
	state.root       = root;
	
	state.onchange   = onchange;
	
	state.extensions = extensions;
	
	if(recursive){
	
		build_directories( state.root );
		
	} else {
	
		state.directories = [state.root];
	}
	
	for(var n in state.directories) {
		
		fs.watch(state.directories[n], function(type, filename) {
			 
			
			 
			 if(filename) {
			 	
				var ext = path.extname(filename);
				
				
				
				if(state.extensions) {
				
					console.log(state.extensions);
				
					for(var m in state.extensions) {
					
						if(state.extensions[m] == ext) {
						
							var millisecond_offset = new Date().getTime() - state.last_event.getTime();
						
							if(millisecond_offset > 1000) { // 1 second delay...
						
								if(state.onchange) {
							
									state.onchange(type, filename);

									state.last_event = new Date();
								}
							}					
								
						}
					}
					
					return;
				}
				else {
					
					
					
					var millisecond_offset = new Date().getTime() - state.last_event.getTime();
				
					if(millisecond_offset > 1000) { // 1 second delay...
				
						if(state.onchange) {
					
							state.onchange(type, filename);

							state.last_event = new Date();
						}
					}					
					
				}
 
			}
		
		});
	}
}