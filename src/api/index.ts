//?
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
//

/////////////////////////////////////////////////////////////
// forward declarations
/////////////////////////////////////////////////////////////

declare var		 __filename : string; 
declare var		 __dirname  : string;
declare var 	 process    : any;
declare var 	 global     : any;
declare var 	 exports    : any;
declare var      console    : any;
declare function require (mod:string):any;

/////////////////////////////////////////////////////////////
// node modules.
/////////////////////////////////////////////////////////////
var _vm   = require("vm");
var _fs   = require("fs");
var _path = require("path");


/////////////////////////////////////////////////////////////
// compiler options..
/////////////////////////////////////////////////////////////

export var debug       : boolean = false;

export var allowRemote : boolean = true;

/////////////////////////////////////////////////////////////
// resolves all source for a compilation..
/////////////////////////////////////////////////////////////

export class units {
	
	public static create (filename:string, source:string): any {
		var api 	 = load_typescript_api();
		var unit 	 = new api.SourceUnit();
		unit.content = source;
		unit.path    = filename;
		unit.remote  = false;
		unit.error   = '';
		unit.load_references();
		return unit;
	}
	
	public static resolve (sources:string[], callback :{ (units:any[]): void; }) : void {
		var api = load_typescript_api();
		var async_io = new api.IOAsyncHost();
		var logger   = new api.NullLogger();
		if(exports.allowRemote) { async_io = new api.IOAsyncRemoteHost(); }
		if(exports.debug) { logger = new api.ConsoleLogger(); }
		var resolver = new api.CodeResolver( async_io, logger );
		resolver.resolve(sources, callback);		
	}
}

/////////////////////////////////////////////////////////////
// compiles these sources into javascript..
/////////////////////////////////////////////////////////////

export function compile(units:any[], callback :{ (compilation:any): void; }) : void {
	var api 	   = load_typescript_api();
	var typescript = load_typescript();
	var a = exports.units.create('lib.d.ts',  _fs.readFileSync( _path.join(__dirname, "decl/lib.d.ts") , "utf8" ) );
	var b = exports.units.create('node.d.ts', _fs.readFileSync( _path.join(__dirname, "decl/node.d.ts") , "utf8" ) );
	
	units.unshift(b);
	units.unshift(a);
	
	var logger = new api.NullLogger();
	if(exports.debug) { logger = new api.ConsoleLogger(); }
	var compiler = new api.Compiler( logger );
	compiler.compile(units, callback);
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
	
	var sandbox:any = { exports : null, 
		//console : console // for debugging..
	};
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

