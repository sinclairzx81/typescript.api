

// resolves all source for a compilation..
export function resolve(sources:string[], allowRemote:boolean, callback:Function) : void {
	
	var api = load_typescript_api();
	
	var async_io = new api.IOAsyncHost();
	
	if(allowRemote) {
	
		async_io = new api.IOAsyncRemoteHost();
	}
	
	var resolver = new api.CodeResolver( async_io, new api.ConsoleLogger() );
	
	resolver.resolve(sources, callback);		
}
// compiles these sources into javascript..
export function compile(sources:any[], debug:boolean, callback:Function) : void {
	
	var api = load_typescript_api();
	
	var logger = new api.NullLogger();
	
	if(debug) {
	
		logger = new api.ConsoleLogger();
	}
	
	var compiler = new api.Compiler( logger );
	
	compiler.compile(sources, callback);

}

/////////////////////////////////////////////////////////////
// loads the TypeScript.Api namespace
/////////////////////////////////////////////////////////////

export function api_namespace() : any {

	return load_typescript_api();
	
}
/////////////////////////////////////////////////////////////
// loads the TypeScript namespace
/////////////////////////////////////////////////////////////
export function typescript_namespace() : any {

	return load_typescript();
}

/////////////////////////////////////////////////////////////
// retro binding hack to load in typescript and api.
/////////////////////////////////////////////////////////////

// forward declarations...
declare var		 __filename : string; 
declare var		 __dirname  : string;
declare var 	 process    : any;
declare var 	 global     : any;
declare var 	 exports    : any;
declare function require (mod:string):any;

// node modules.
var _vm   = require("vm");
var _fs   = require("fs");
var _path = require("path");

// js files to bind..
var typescript_filename     = _path.join(__dirname, "typescript.js");
var typescript_api_filename = _path.join(__dirname, "typescript.api.js");

// namespace cache...
var __typescript__namespace = null;
var __typescript__api__namespace = null;

function load_typescript_api() : any {
	
	if(__typescript__api__namespace) {
		return __typescript__api__namespace;
	}
	
	var sandbox = {
		TypeScript  : load_typescript(),
		__filename  : __filename,
		__dirname   : __dirname,		
		global	    : global,
		process     : process,
		require     : require,	
		console     : console,
		exports     : null
	};
	__typescript__api__namespace = load_module(typescript_api_filename, sandbox, ["TypeScript"]).Api;
	
	return __typescript__api__namespace;
}

// loads typescript..
function load_typescript() : any {
	
	if(__typescript__namespace) {
		return __typescript__namespace;
	}	
	
	var sandbox:any = { exports : null  };
	__typescript__namespace = load_module (typescript_filename, sandbox, ["TypeScript"]);
	return __typescript__namespace;
}

// loads a module..
function load_module(filename, sandbox, export_type_names) : any {
	var source = _fs.readFileSync(filename, 'utf8');
	for(var n in export_type_names) {
		source = source.concat('\n\nexports = ' + export_type_names[n] + ';'); 
	}
	var script = _vm.createScript( source, "typescript.js" );
	script.runInNewContext( sandbox );
	return sandbox.exports;
	 
}

