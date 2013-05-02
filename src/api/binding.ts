// forward declarations...
declare var		 __filename : string; 
declare var		 __dirname  : string;
declare var 	 process    : any;
declare var 	 global     : any;
declare function require (mod:string):any;

// node modules.
var _vm   = require("vm");
var _fs   = require("fs");
var _path = require("path");

// js files to bind..
var typescript_filename     = _path.join(__dirname, "typescript.js");
var typescript_api_filename = _path.join(__dirname, "typescript.api.js");

// load the api
export function api(callback:{(ns:any):void;}) : void  {
	
	load_typescript_api(callback);
	
}

// async typescript.api loading...
export function load_typescript_api(callback:{(ns:any):void;}) : void  {
	
	load_typescript(function(ns) {
	
		var sandbox = {
			__filename  : __filename,
			__dirname   : __dirname,		
			global	    : global,
			process     : process,
			require     : require,	
			TypeScript  : ns,
			exports     : null
		};
		
		load_module(typescript_api_filename, sandbox, ["TypeScript"], (ns:any) => {
		
			callback(ns.Api);
		});
	});
}

// async typescript loading...
function load_typescript(callback:{(ns:any):void;}) : void {
	
	var sandbox:any = { exports : null  };
	
	load_module (typescript_filename, sandbox, ["TypeScript"], callback);
}

// async module loading...
function load_module(filename, sandbox, export_type_names, callback:{(ns:any):void;} ) : void {
	
	_fs.readFile(filename, 'utf8', (err, source) => {

		for(var n in export_type_names) {
		
			source = source.concat('\n\nexports = ' + export_type_names[n] + ';'); 
			
		}
		
		var script = _vm.createScript( source, "typescript.js" );
		
		script.runInNewContext( sandbox );

		callback( sandbox.exports );
	});
}

