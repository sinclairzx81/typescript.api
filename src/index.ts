// Copyright (c) sinclair 2013.  All rights reserved.
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

export var allowRemote 				: boolean = false;

export var debug       				: boolean = false;

export var compiler                 : TypeScript.Api.Compile.Compiler;

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
			        console.log(_path.basename(units[n].path) + ':' + units[n].diagnostics[m].toString());
		        }
	        }        
        };
        
		var api         = <TypeScript.Api>load_typescript_api();
		
		var io          = new api.IO.IOSync();
		
		var logger      = new api.Loggers.BufferedLogger();
		
		var resolver    = new api.Resolve.Resolver( io, logger );
		
		var diagnostics = [];
		
		resolver.resolve([_module.filename], (sourceUnits:TypeScript.Api.Units.SourceUnit[]) => {
			
            if(exports.check(sourceUnits)) {

				var compiler = new api.Compile.Compiler( logger );
				
				compiler.compile( sourceUnits, ( compiledUnits : TypeScript.Api.Units.CompiledUnit[] ) =>  {
					
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

	var api = <TypeScript.Api>load_typescript_api();
	
	return new api.Units.SourceUnit(path, content, [], false );
}

/////////////////////////////////////////////////////////////
// resolve: resolves source units.
/////////////////////////////////////////////////////////////

export function resolve (sources:string[], callback :{ (units : TypeScript.Api.Units.SourceUnit[] ) : void; }) : void  {

    var getType = (obj:any):string => { return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase() };
    
    var _sources = [];

    switch( getType(sources) ) 
    {
        case "string":

            _sources.push(sources);

            break;

        case "array":

            _sources = sources;

            break;
    }
    
	var api      = <TypeScript.Api>load_typescript_api();
	
	var io       = new api.IO.IOAsync();
	
	var logger   = new api.Loggers.NullLogger();
	
	if(exports.allowRemote) 			 { io = new api.IO.IORemoteAsync(); }
	
	if(exports.debug)       			 { logger = new api.Loggers.ConsoleLogger(); }
	
	var resolver = new api.Resolve.Resolver( io, logger );
	
	resolver.resolve(_sources, callback);
}

/////////////////////////////////////////////////////////////
// sort: sorts source units into sequential order.
/////////////////////////////////////////////////////////////

export function sort(sourceUnits: TypeScript.Api.Units.SourceUnit[]) : TypeScript.Api.Units.SourceUnit[]
{
    var api = <TypeScript.Api>load_typescript_api();
    
    return api.Resolve.Topology.sort(sourceUnits);
}

/////////////////////////////////////////////////////////////
// graph: returns a graph source units.
/////////////////////////////////////////////////////////////

export function graph(sourceUnits: TypeScript.Api.Units.SourceUnit[]) :  TypeScript.Api.Resolve.Node []
{
    var api = <TypeScript.Api>load_typescript_api();

    return api.Resolve.Topology.graph(sourceUnits);
}

/////////////////////////////////////////////////////////////
// compile: compiles source units. outputs a compilation.
/////////////////////////////////////////////////////////////

export function compile (sourceUnits: TypeScript.Api.Units.SourceUnit[], callback : { (compiledUnit:TypeScript.Api.Units.CompiledUnit[] ): void; } ) : void {

	var api = <TypeScript.Api>load_typescript_api();

	var logger = new api.Loggers.NullLogger();
	
	if(exports.debug) { logger = new api.Loggers.ConsoleLogger(); }
	
    if(!exports.compiler)
    {
	    exports.compiler = new api.Compile.Compiler( logger );
	}
	exports.compiler.compile( sourceUnits , callback);
}

/////////////////////////////////////////////////////////////
// reset: resets the compiler.
/////////////////////////////////////////////////////////////

export function reset() : void {

    var api = <TypeScript.Api>load_typescript_api();

    var logger = new api.Loggers.NullLogger();

    exports.compiler = new api.Compile.Compiler( logger );
}

/////////////////////////////////////////////////////////////
// reflect: reflects compilation AST.
/////////////////////////////////////////////////////////////

export function reflect(compiledUnits:TypeScript.Api.Units.CompiledUnit [], callback :{ ( reflection:TypeScript.Api.Reflect.Reflection ): void; }) : void  {

	var api = <TypeScript.Api>load_typescript_api();
	
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
// build: builds and produces a declaration for the given input.
/////////////////////////////////////////////////////////////

export function build (filenames:string[], callback :{ (diagnostics:TypeScript.Api.Units.Diagnostic[], source:string, declaration:string ): void; }) : void {

    var get_diagnostics = (sourceUnits:TypeScript.Api.Units.Unit[]) : TypeScript.Api.Units.Diagnostic[] => {
        
        var result:TypeScript.Api.Units.Diagnostic[] = [];

	    for(var n in sourceUnits) {

		    for(var m in sourceUnits[n].diagnostics) {

			    result.push(sourceUnits[n].diagnostics[m]);
		    }
	    }

        return result;   
    };
    
    exports.resolve(filenames, (sourceUnits:TypeScript.Api.Units.SourceUnit[]) => {

        if(!exports.check(sourceUnits)) {

            callback(get_diagnostics(sourceUnits), null, null);

            return;
        }

        exports.compile(sourceUnits, (compiledUnits:TypeScript.Api.Units.CompiledUnit[]) => {

            if(!exports.check(sourceUnits)) {

                callback(get_diagnostics(sourceUnits), null, null);

                return;
            }
            
            var source_buffer:string[] = [];

            for(var n in compiledUnits) {

                source_buffer.push('////////////////////////////////////////\n');
                
                source_buffer.push('// ' + _path.basename(compiledUnits[n].path) + '\n');
                
                source_buffer.push('////////////////////////////////////////\n');
                
                source_buffer.push(compiledUnits[n].content + '\n\n');
            }

            var declaration_buffer:string[] = [];

            for(var n in compiledUnits) {

                declaration_buffer.push('////////////////////////////////////////\n');
                
                declaration_buffer.push('// ' + _path.basename(compiledUnits[n].path) + '\n');
                
                declaration_buffer.push('////////////////////////////////////////\n');
                
                declaration_buffer.push(compiledUnits[n].declaration + '\n\n');
            }

            callback(null, source_buffer.join(''), declaration_buffer.join('') );
        });
    });
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
//
// TypeScript and TypeScript.API bindings
//
/////////////////////////////////////////////////////////////

var cache:any               = {};

var typescript_filename     = _path.join(__dirname, "typescript.js");

var typescript_api_filename = _path.join(__dirname, "typescript.api.js");

function load_typescript_api() : any
{	
	if(cache.typescript_api)  
    {
		return <TypeScript.Api>cache.typescript_api;
	}
	 
    var sandbox = 
    {
        TypeScript  : <TypeScript>load_typescript(),
		
        __filename  : __filename,
		
        __dirname   : __dirname,		
		
        global	    : global,
		
        process     : process,
		
        require     : require,	
		
        console     : console,
		
        exports     : null
    };
	
	cache.typescript_api = load_module(typescript_api_filename, sandbox, ["TypeScript"]).Api;
	
	return <TypeScript.Api>cache.typescript_api;
}

function load_typescript() : any
{
    if(cache.typescript)  
    {
        return <TypeScript>cache.typescript;
    }
    var sandbox:any = 
    { 
        exports : null
    };

    cache.typescript = load_module (typescript_filename, sandbox, ["TypeScript"]);
	
    return <TypeScript>cache.typescript;
}

function load_module(filename, sandbox, export_type_names) : any 
{
    var source = _fs.readFileSync(filename, 'utf8');
	
    for(var n in export_type_names) 
    {
        source = source.concat('\n\nexports = ' + export_type_names[n] + ';'); 	
    }
	
    var script = _vm.createScript( source, _path.basename(filename) );
	
    script.runInNewContext( sandbox );
	
    return sandbox.exports;
}