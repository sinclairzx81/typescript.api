// Acid Frameworks.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/////////////////////////////////////////////////////////////
// forward declarations
/////////////////////////////////////////////////////////////

declare var		 __filename : string; 
declare var		 __dirname  : string;
declare var 	 process    : any;
declare var 	 global     : any;
declare var 	 exports    : any;
declare var      console    : any;
declare var      require    : any;

/////////////////////////////////////////////////////////////
// node modules.
/////////////////////////////////////////////////////////////
var _vm   = require("vm");
var _fs   = require("fs");
var _path = require("path");

/////////////////////////////////////////////////////////////
// compiler options..
/////////////////////////////////////////////////////////////

export var include_lib_declaration  : boolean = false;

export var include_node_declaration : boolean = false;

export var debug       				: boolean = false;

export var allowRemote 				: boolean = true;

export var async      				: boolean = true;

/////////////////////////////////////////////////////////////
// creates a new compilation unit
/////////////////////////////////////////////////////////////
export function create (filename:string, source:string): any {
	var api 	 = load_typescript_api();
	var unit 	 = new api.SourceUnit();
	unit.content = source;
	unit.path    = filename;
	unit.remote  = false;
	unit.error   = '';
	unit.load_references();
	return unit;
}

/////////////////////////////////////////////////////////////
// resolves units.
/////////////////////////////////////////////////////////////	
export function resolve (sources:string[], callback :{ (units:any[]): void; }) : void {
	var api      = load_typescript_api();
	var io       = new api.IOAsyncHost();
	var logger   = new api.NullLogger();
	if(exports.allowRemote) { io = new api.IOAsyncRemoteHost(); }
	if(!exports.async)      { io = new api.IOSync(); }
	if(exports.debug)       { logger = new api.ConsoleLogger(); }
	var resolver = new api.CodeResolver( io, logger );
	resolver.resolve(sources, callback);		
}
 

/////////////////////////////////////////////////////////////
// registers the .ts extension so typescript can be with require.
// note, using the IOSyncHost to load.
/////////////////////////////////////////////////////////////

export function register () : void {
	require.extensions['.ts'] = function(_module) {
		var api         = load_typescript_api();
		var io          = new api.IOSyncHost();
		var logger      = new api.BufferedLogger();
		var resolver    = new api.CodeResolver( io, logger );
		var diagnostics = [];
		resolver.resolve([_module.filename], (units) => {
			var compiler = new api.Compiler( logger );
			compiler.compile( include_declarations(units), (compilation) => {
				diagnostics = compilation.diagnostics;
				if(compilation.diagnostics.length > 0) {
					_module.exports = null;
				} else {
					exports.run(compilation, null, function(context) {
						_module.exports = context;
					});
				}			
			});	
		});
		
		if(diagnostics.length > 0) {
			console.log('[TYPESCRIPT ERROR]');
			console.log(logger.ToString());
			throw new Error("[TYPESCRIPT ERROR]");
		}
	}
}

/////////////////////////////////////////////////////////////
// compiles these sources into javascript..
/////////////////////////////////////////////////////////////

export function compile(units:any[], callback :{ (compilation:any): void; }) : void {
	var api = load_typescript_api();
	var typescript = load_typescript();
	var logger = new api.NullLogger();
	if(exports.debug) { logger = new api.ConsoleLogger(); }
	var compiler = new api.Compiler( logger );
	compiler.compile( include_declarations(units), callback);
}
/////////////////////////////////////////////////////////////
// provides reflection information about a compilation.
/////////////////////////////////////////////////////////////

export function reflect(compilation:any, callback :{ (reflection:any): void; }) : void {
	var api = load_typescript_api();
 	var reflector = new api.Reflector(); // todo: add logger here...
	callback( reflector.reflect(compilation) );
}

/////////////////////////////////////////////////////////////
// runs a compilation
/////////////////////////////////////////////////////////////

export function run (compilation:any, sandbox:any, callback :{ (context:any): void; }) : void {
	try {
		if(!sandbox) { sandbox = get_default_sandbox(); }
		var source = compilation.scripts.join('');
		var script = _vm.createScript( source, "compilation.js" );
		script.runInNewContext( sandbox );
		callback( sandbox.exports );
	} catch(e) {
		// can i do source mapping here?
		callback( null );
		console.log(e);
	}
}


/////////////////////////////////////////////////////////////
// runs a compilation
/////////////////////////////////////////////////////////////
function get_default_sandbox(): any {
	var sandbox:any = {};
	if (!sandbox) {
		sandbox = {};
		for (var n in global) {
			sandbox[n] = global[n];
		}
	}
	sandbox.require  = require;
	sandbox.process  = process;
	sandbox.console  = console;
	sandbox.global   = global;
	sandbox.exports  = {};
	return sandbox;
}

/////////////////////////////////////////////////////////////
// attaches declarations to compilation units
/////////////////////////////////////////////////////////////
function include_declarations (units:any[]):any[] {
	
	// snap in lib.d.ts
	if(exports.include_lib_declaration) {
		var lib_decl  = exports.create('lib.d.ts',  _fs.readFileSync( _path.join(__dirname, "decl/lib.d.ts") , "utf8" ) );
		units.unshift(lib_decl);
	}	
	
	// snap in node.d.ts
	if(exports.include_node_declaration) {
		var node_decl = exports.create('node.d.ts', _fs.readFileSync( _path.join(__dirname, "decl/node.d.ts"), "utf8" ) );
		units.unshift(node_decl);		
	}
	
	return units;
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

// js files to bind..
var typescript_filename     = _path.join(__dirname, "typescript.js");
var typescript_api_filename = _path.join(__dirname, "typescript.api.js");

// namespace cache...
var _cache_typescript_namespace 	= null;
var _cache_typescript_api_namespace = null;

function load_typescript_api() : any {
	
	if(_cache_typescript_api_namespace)  
		return _cache_typescript_api_namespace;
	 
	
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
	_cache_typescript_api_namespace = load_module(typescript_api_filename, sandbox, ["TypeScript"]).Api;
	
	return _cache_typescript_api_namespace;
}

// loads typescript..
function load_typescript() : any {
	if(_cache_typescript_namespace)  
		return _cache_typescript_namespace;
	 	
	var sandbox:any = { 
		exports : null
		//, console : console // for debugging..
	};
	_cache_typescript_namespace = load_module (typescript_filename, sandbox, ["TypeScript"]);
	return _cache_typescript_namespace;
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

