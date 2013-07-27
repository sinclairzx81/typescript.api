// Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
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

/// <reference path="decl/typescript.d.ts" />
/// <reference path="decl/typescript.api.d.ts" />

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
// code to bind
/////////////////////////////////////////////////////////////

var typescript_filename     = _path.join(__dirname, "./node_modules/typescript/bin/typescript.js");

var typescript_api_filename = _path.join(__dirname, "typescript.api.js"); // typescript@0.9.0-1

/////////////////////////////////////////////////////////////
// compiler options..
/////////////////////////////////////////////////////////////

export var allowRemote 				: boolean;;

export var debug       				: boolean;

export var compiler                 : TypeScript.Api.Compiler;

export var languageVersion          : TypeScript.LanguageVersion;  // TypeScript.LanguageVersion.EcmaScript5;

export var moduleTarget             : TypeScript.ModuleGenTarget;  // TypeScript.ModuleGenTarget.Synchronous;

export var generateDeclarations     : boolean; // true

export var generateSourceMaps       : boolean; // true

/////////////////////////////////////////////////////////////
// initialize defaults.
/////////////////////////////////////////////////////////////

function initialize() {

    exports.allowRemote = false;

    exports.debug       = false;

    exports.compiler    = null;

    exports.languageVersion      = "EcmaScript5"; //typescript.LanguageVersion.EcmaScript5;

    exports.moduleTarget         = "Synchronous"; //typescript.ModuleGenTarget.Synchronous;

    exports.generateDeclarations = true;

    exports.generateSourceMaps   = true;

    exports.outputOption         = '';
    
}

initialize();

/////////////////////////////////////////////////////////////
// check: checks to see if the units are ok..
/////////////////////////////////////////////////////////////

export function check (units : TypeScript.Api.Unit[]) : boolean {
	
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
        var output_diagnostics = (units:TypeScript.Api.Unit[]) => {

	        for(var n in units)
	        {
		        for(var m in units[n].diagnostics)
		        {
			        console.log(_path.basename(units[n].path) + ':' + units[n].diagnostics[m].toString());
		        }
	        }        
        };
        
		var api         = <TypeScript.Api>load_typescript_api();
		
		var io          = new api.IOSync();
		
		var logger      = new api.BufferedLogger();
		
		var resolver    = new api.Resolver( io, logger );
		
		var diagnostics = [];
		
		resolver.resolve([_module.filename], (sourceUnits:TypeScript.Api.SourceUnit[]) => {
			
            if(exports.check(sourceUnits)) {

                var options = new api.CompilerOptions();

                options.moduleGenTarget          = exports.moduleTarget;

                options.generateDeclarationFiles = exports.generateDeclarations;

                options.mapSourceFiles           = exports.generateSourceMaps;

                options.languageVersion          = exports.languageVersion;

                options.logger                   = logger;

				var compiler = new api.Compiler( options );
				
				compiler.compile( sourceUnits, ( compiledUnits : TypeScript.Api.CompiledUnit[] ) =>  {
					
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
// reset: resets the compiler.
/////////////////////////////////////////////////////////////

export function reset() : void {

    var api = <TypeScript.Api>load_typescript_api();

    var logger = new api.NullLogger();

    var options = new api.CompilerOptions();

    options.moduleGenTarget          = exports.moduleTarget;

    options.generateDeclarationFiles = exports.generateDeclarations;

    options.mapSourceFiles           = exports.generateSourceMaps;

    options.languageVersion          = exports.languageVersion;

    options.logger                   = logger;

	exports.compiler = new api.Compiler( options );
}

/////////////////////////////////////////////////////////////
// create: creates a new source unit
/////////////////////////////////////////////////////////////

export function create (path:string, content:string) : TypeScript.Api.SourceUnit {

	var api = <TypeScript.Api>load_typescript_api();
	
	return new api.SourceUnit(path, content, [], false );
}

/////////////////////////////////////////////////////////////
// resolve: resolves source units.
/////////////////////////////////////////////////////////////

export function resolve (sources:string[], callback :{ (units : TypeScript.Api.SourceUnit[] ) : void; }) : void  {

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
	
	var io       = new api.IOAsync();
	
	var logger   = new api.NullLogger();
	
	if(exports.allowRemote) 			 { io = new api.IORemoteAsync(); }
	
	if(exports.debug)       			 { logger = new api.ConsoleLogger(); }
	
	var resolver = new api.Resolver( io, logger );
	
	resolver.resolve(_sources, callback);
}

/////////////////////////////////////////////////////////////
// sort: sorts source units into sequential order.
/////////////////////////////////////////////////////////////

export function sort(sourceUnits: TypeScript.Api.SourceUnit[]) : TypeScript.Api.SourceUnit[]
{
    var api = <TypeScript.Api>load_typescript_api();
    
    return api.Topology.sort(sourceUnits);
}

/////////////////////////////////////////////////////////////
// graph: returns a graph source units.
/////////////////////////////////////////////////////////////

export function graph(sourceUnits: TypeScript.Api.SourceUnit[]) :  TypeScript.Api.Node []
{
    var api = <TypeScript.Api>load_typescript_api();

    return api.Topology.graph(sourceUnits);
}

/////////////////////////////////////////////////////////////
// compile: compiles source units. outputs a compilation.
/////////////////////////////////////////////////////////////

export function compile (sourceUnits: TypeScript.Api.SourceUnit[], callback : { (compiledUnit:TypeScript.Api.CompiledUnit[] ): void; } ) : void {

	var api = <TypeScript.Api>load_typescript_api();

	var logger = new api.NullLogger();
	
	if(exports.debug) { logger = new api.ConsoleLogger(); }
	
    if(!exports.compiler)
    {
        var options = new api.CompilerOptions();

        options.moduleGenTarget          = exports.moduleTarget;

        options.generateDeclarationFiles = exports.generateDeclarations;

        options.mapSourceFiles           = exports.generateSourceMaps;

        options.languageVersion          = exports.languageVersion;

        options.logger                   = logger;

	    exports.compiler = new api.Compiler( options );
	}
    
    exports.compiler.compile(sourceUnits, (compiledUnits)=> {

        callback(compiledUnits);
    });
}

/////////////////////////////////////////////////////////////
// run: runs a compilation.
/////////////////////////////////////////////////////////////

export function run (compiledUnits:TypeScript.Api.CompiledUnit[], sandbox:any, callback :{ (context:any): void; }) : void 
{
	try 
	{
		if(!sandbox) { 

            sandbox = get_default_sandbox(); 

            var _require = (path:string) => {

                var primary_unit = compiledUnits[compiledUnits.length - 1];

                if(path.indexOf('/') != -1) {

                    var fullname = _path.resolve (primary_unit.path, './');

                    var dirname  = _path.dirname(fullname);

                    path = _path.resolve(dirname + '/' + path, './');
                }

                return require(path);
            }

            // snap in require override. ensure that
            // relative module loading happens from the 
            // primary ts unit, not the mainModule js
            // or node_module/typescript.api
            if(compiledUnits.length > 0) { 
        
                sandbox.require = _require;  
            }      
        }
		
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
//
// TypeScript and TypeScript.API bindings
//
/////////////////////////////////////////////////////////////

var cache:any               = {};

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
		
        exports     : null,

        setInterval : setInterval,

        setTimeout  : setTimeout
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