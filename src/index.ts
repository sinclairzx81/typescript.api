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

/// <reference path="Decl/typescript.d.ts" />
/// <reference path="Decl/typescript.api.d.ts" />

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

export var allowRemote 				: boolean = false;

export var debug       				: boolean = false;


/////////////////////////////////////////////////////////////
// check: checks to see if the units are ok..
/////////////////////////////////////////////////////////////

export function check (units : TypeScript.Api.Units.Unit[]) : boolean {
	
    for(var n in units)
	{
		if(units[n].hasError())
		{
			return false;
		}
	}
	
	return true;
}


/////////////////////////////////////////////////////////////
// register: registers the .ts extension so typescript can be 
// with require. note, using the IOSync to load.
/////////////////////////////////////////////////////////////

export function register () : void 
{
	require.extensions['.ts'] = function(_module) 
	{
        var output_diagnostics = (units:TypeScript.Api.Units.Unit[]) => {

	        for(var n in units)
	        {
		        for(var m in units[n].diagnostics)
		        {
			        console.log(units[n].diagnostics[m].toString());
		        }
	        }        
        };
        
		var api         = load_typescript_api();
		
		var io          = new api.IO.IOSync();
		
		var logger      = new api.Loggers.BufferedLogger();
		
		var resolver    = new api.Resolve.Resolver( io, logger );
		
		var diagnostics = [];
		
		resolver.resolve([_module.filename], (sourceUnits:TypeScript.Api.Units.SourceUnit[]) => {
			
            if(exports.check(sourceUnits)) {

				var compiler = new api.Compile.Compiler( logger );
				
				compiler.compile( include_declarations( sourceUnits ), ( compiledUnits : TypeScript.Api.Units.CompiledUnit[] ) =>  {
					
                    if( exports.check(compiledUnits) ) {

						exports.run(compiledUnits, null, function(context) {

							_module.exports = context;
						});
					}
					else {

						output_diagnostics(compiledUnits);
					}
				});
			} 
			else
			{
				output_diagnostics(sourceUnits);
			}
		});
	}
}

/////////////////////////////////////////////////////////////
// create: creates a new source unit
/////////////////////////////////////////////////////////////

export function create (path:string, content:string) : TypeScript.Api.Units.SourceUnit {

	var api = load_typescript_api();
	
	return new api.Units.SourceUnit(path, content, [], false );
}

/////////////////////////////////////////////////////////////
// resolve: resolves source units.
/////////////////////////////////////////////////////////////

export function resolve (sources:string[], callback :{ (units : TypeScript.Api.Units.SourceUnit[] ) : void; }) : void  {

    var getType = (obj:any):string => { return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase() };
    
    var _sources = [];

    switch( getType(sources) ) {
        case "string":
            _sources.push(sources);
            break;
        case "array":
            _sources = sources;
            break;
    }
    
	var api      = load_typescript_api();
	
	var io       = new api.IO.IOAsync();
	
	var logger   = new api.Loggers.NullLogger();
	
	if(exports.allowRemote) 			 { io = new api.IO.IORemoteAsync(); }
	
	if(exports.debug)       			 { logger = new api.Loggers.ConsoleLogger(); }
	
	var resolver = new api.Resolve.Resolver( io, logger );
	
	resolver.resolve(_sources, callback);
}

/////////////////////////////////////////////////////////////
// compile: compiles source units. outputs a compilation.
/////////////////////////////////////////////////////////////

export function compile (sourceUnits: TypeScript.Api.Units.SourceUnit[], callback : { (compiledUnit:TypeScript.Api.Units.CompiledUnit[] ): void; } ) : void {

	var api = load_typescript_api();

	var logger = new api.Loggers.NullLogger();
	
	if(exports.debug) { logger = new api.Loggers.ConsoleLogger(); }
	
	var compiler = new api.Compile.Compiler( logger );
	
	compiler.compile( include_declarations( sourceUnits ), callback);
}

/////////////////////////////////////////////////////////////
// reflect: reflects compilation AST.
/////////////////////////////////////////////////////////////

export function reflect(compiledUnits:TypeScript.Api.Units.CompiledUnit [], callback :{ ( reflection:TypeScript.Api.Reflect.Reflection ): void; }) : void  {

	var api = load_typescript_api();
	
    var reflection = new api.Reflect.Reflection();

    for(var n in compiledUnits)
    {
        var script = api.Reflect.Script.create(compiledUnits[n].path, compiledUnits[n].ast );

        reflection.scripts.push(script);
    
    }
	
	callback( reflection );
}

/////////////////////////////////////////////////////////////
// run: runs a compilation.
/////////////////////////////////////////////////////////////

export function run (compiledUnits:TypeScript.Api.Units.CompiledUnit[], sandbox:any, callback :{ (context:any): void; }) : void 
{
	try 
	{
		if(!sandbox) { sandbox = get_default_sandbox(); }
		
		var sources = [];
		
		for(var n in compiledUnits) 
		{
			sources.push(compiledUnits[n].content);
		}
		
		var script = _vm.createScript( sources.join('') , "typescript-compilation.js" );
		
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
	
	sandbox.require    = require;
	
	sandbox.process    = process;
	
	sandbox.console    = console;
	
	sandbox.global     = global;

    sandbox.__dirname  = _path.dirname(process.mainModule.filename);

    sandbox.__filename = _path.join(sandbox.__dirname, "typescript-compilation.js");
	
	sandbox.exports  = {};
	
	return sandbox;
}

/////////////////////////////////////////////////////////////
// attaches declarations to compilation units
/////////////////////////////////////////////////////////////

function include_declarations (units:any[]):any[] 
{
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
//
// TypeScript and TypeScript.API bindings
//
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// files
/////////////////////////////////////////////////////////////

var typescript_filename     = _path.join(__dirname, "typescript.js");
var typescript_api_filename = _path.join(__dirname, "typescript.api.js");

/////////////////////////////////////////////////////////////
// module caching variables..
/////////////////////////////////////////////////////////////

var _cache_typescript_namespace 	= null;
var _cache_typescript_api_namespace = null;


/////////////////////////////////////////////////////////////
// Runs the TypeScript.API module
/////////////////////////////////////////////////////////////
function load_typescript_api() : TypeScript.Api {
	
	if(_cache_typescript_api_namespace)  {
	
		return <TypeScript.Api>_cache_typescript_api_namespace;
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
	
	_cache_typescript_api_namespace = load_module(typescript_api_filename, sandbox, ["TypeScript"]).Api;
	
	return <TypeScript.Api>_cache_typescript_api_namespace;
}

/////////////////////////////////////////////////////////////
// Runs the TypeScript module
/////////////////////////////////////////////////////////////

function load_typescript() : TypeScript {

	if(_cache_typescript_namespace)  {
	
		return <TypeScript>_cache_typescript_namespace;
		
	}
	 	
	var sandbox:any = { 
		exports : null
		//, console : console 
	};
	_cache_typescript_namespace = load_module (typescript_filename, sandbox, ["TypeScript"]);
	
	return <TypeScript>_cache_typescript_namespace;
}

/////////////////////////////////////////////////////////////
// Runs a module
/////////////////////////////////////////////////////////////
function load_module(filename, sandbox, export_type_names) : any {

	var source = _fs.readFileSync(filename, 'utf8');
	
	for(var n in export_type_names) {
	
		source = source.concat('\n\nexports = ' + export_type_names[n] + ';'); 
		
	}
	
	var script = _vm.createScript( source, "typescript.js" );
	
	script.runInNewContext( sandbox );
	
	return sandbox.exports;
}