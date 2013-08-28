/*--------------------------------------------------------------------------

Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

--------------------------------------------------------------------------*/

/// <reference path="references.ts" />

//--------------------------------------------------
// IO
//--------------------------------------------------

/// <reference path="io/Buffer.ts" />
/// <reference path="io/IOFile.ts" />
/// <reference path="io/IIO.ts" />
/// <reference path="io/IOSync.ts" />
/// <reference path="io/IORemoteAsync.ts" />
/// <reference path="io/IOASync.ts" />

//--------------------------------------------------
// TextWriter
//--------------------------------------------------

/// <reference path="writers/TextWriter.ts" />

//--------------------------------------------------
// Loggers
//--------------------------------------------------

/// <reference path="loggers/BufferedLogger.ts" />
/// <reference path="loggers/ConsoleLogger.ts" />
/// <reference path="loggers/NullLogger.ts" />

//--------------------------------------------------
// Resolver
//--------------------------------------------------

/// <reference path="resolve/Topology.ts" />
/// <reference path="resolve/Resolver.ts" />

//--------------------------------------------------
// Reflection
//--------------------------------------------------

/// <reference path="reflect/ReflectedType.ts" />
/// <reference path="reflect/Type.ts" />
/// <reference path="reflect/Variable.ts" />
/// <reference path="reflect/Parameter.ts" />
/// <reference path="reflect/Method.ts" />
/// <reference path="reflect/Interface.ts" />
/// <reference path="reflect/Class.ts" />
/// <reference path="reflect/Import.ts" />
/// <reference path="reflect/Module.ts" />
/// <reference path="reflect/Script.ts" />
/// <reference path="reflect/TypeResolver.ts" />


//--------------------------------------------------
// Units
//--------------------------------------------------

/// <reference path="units/Unit.ts" />
/// <reference path="units/SourceUnit.ts" />
/// <reference path="units/CompiledUnit.ts" />
/// <reference path="units/Diagnostic.ts" />

//--------------------------------------------------
// Compiler
//--------------------------------------------------

/// <reference path="compile/Options.ts" />
/// <reference path="compile/Input.ts" />
/// <reference path="compile/Output.ts" />
/// <reference path="compile/Processor.ts" />
/// <reference path="compile/Compiler.ts" />

//--------------------------------------------------
// api
//--------------------------------------------------

module.exports = typescript

module.exports.Api = TypeScript.Api;

//--------------------------------------------------
// check()
//--------------------------------------------------

module.exports.check = (units: TypeScript.Api.Unit[]): boolean => {

    for(var n in units) {

        if(units[n].hasError()) {

            return false;
        }
    }

    return true;
}

//--------------------------------------------------
// resolve()
//--------------------------------------------------

module.exports.resolve = (filename: string,callback: (resolved: TypeScript.Api.SourceUnit[]) => void): void => {

    var param: any = null;

    if((typeof filename) === 'string') {

        param = [filename]

    }

    if(Object.prototype.toString.call(filename) === '[object Array]') {

        param = filename;
    }

    if(!param) {
    
        throw Error('resolve() filename must be of string or array of string.')
    }


    var io = new TypeScript.Api.IOAsync();

    var resolver = new TypeScript.Api.Resolver(io);

    resolver.resolve(param, callback);
}

//--------------------------------------------------
// reset()
//--------------------------------------------------

var compiler = null;

module.exports.reset = (options?: TypeScript.Api.ICompilerOptions): void => {

    compiler = new TypeScript.Api.Compiler(options);
}

//--------------------------------------------------
// create()
//--------------------------------------------------

module.exports.create = (path: string, content: string): TypeScript.Api.SourceUnit => {

    return new TypeScript.Api.SourceUnit(path,content, [], false);
}

//--------------------------------------------------
// compile()
//--------------------------------------------------

module.exports.compile=(resolved: TypeScript.Api.SourceUnit[],callback: (compiled: TypeScript.Api.CompiledUnit[]) => void): void => {

    if(Object.prototype.toString.call(resolved) !== '[object Array]') {
    
        throw Error('typescript.api : the compile() expects an array of source units.')
    }

    if(!compiler) {

        module.exports.reset();
    }

    compiler.compile(resolved,(compiledUnits) => {

        callback(compiledUnits);
    });
}

//--------------------------------------------------
// sort()
//--------------------------------------------------

module.exports.sort = (sourceUnits: TypeScript.Api.SourceUnit[]) : any[]=> {

    return TypeScript.Api.Topology.sort(sourceUnits);
}

//--------------------------------------------------
// run()
//--------------------------------------------------

function default_sandbox(): any {

    var sandbox: any = {};

    for(var n in global) {

        sandbox[n] = global[n];

    }

    return sandbox;
}

declare var exports;

module.exports.run = (compiled: TypeScript.Api.CompiledUnit[], sandbox: any, callback: (context: any) => void): void => {

    if(Object.prototype.toString.call(compiled) !== '[object Array]') {
    
        throw Error('typescript.api : the run() expects an array of compiled units.')
    }

    // tsapi require override. note: because code 
    // executing in a vm is run from the tsapi 
    // node_module path, this method intercepts paths
    // and attempts to resolve them from the parent
    // ts files path. 
    var tsapi_require = (path: string) => {

        var primary_unit = compiled[compiled.length-1];

        if(path.indexOf('/') != -1) {

            var fullname = node.path.resolve(primary_unit.path, './');

            var dirname = node.path.dirname(fullname);

            path = node.path.resolve(dirname + '/' + path, './');
        }

        return require(path);
    }

    // initialize the sandbox. aside from the 
    // default sandbox, the following code snaps 
    // in other additional properties on the module. 
    // notibly the tsapi_require method. (see above)
    sandbox = (sandbox != null) ? sandbox : default_sandbox();

    sandbox.console = console;

    sandbox.process = process;

    sandbox.require = tsapi_require;
    
    sandbox.module  = {};

    sandbox.exports = {};

    if(compiled.length > 0) {

        sandbox.__dirname = node.path.dirname(compiled[compiled.length-1].path);

        sandbox.__filename = (compiled.length > 0) ? compiled[compiled.length-1].path : sandbox.__dirname + '/compiled.js'

    } else {

        sandbox.__filename = process.mainModule.filename

        sandbox.__dirname = node.path.dirname(sandbox.__filename)
    }

    // run the code in a vm. the default behaviour here
    // is to join all the compiled source and fire it off
    // for the vm to time. if any errors happen during 
    // this process, output the error to the console
    // and return null to the caller.

    try {

        var sources = [];

        for(var i = 0; i < compiled.length; i++) {

            sources.push(compiled[i].content);
        }

        var script = node.vm.createScript(sources.join(''), sandbox.__filename);

        script.runInNewContext(sandbox);

        callback(sandbox.exports);

    }
    catch(e) {

        callback(null);

        console.log(e);
    }
}

//--------------------------------------------------
// register()
//--------------------------------------------------

module.exports.register = () => {

    require.extensions['.ts'] = function(_module) {

        var output_diagnostics = (units: TypeScript.Api.Unit[]) => {

            for(var n in units) {

                for(var m in units[n].diagnostics) {

                    console.log(node.path.basename(units[n].path) + ':' + units[n].diagnostics[m].toString());
                }
            }
        };

        var io = new TypeScript.Api.IOSync();

        var logger = new TypeScript.Api.BufferedLogger();

        var resolver = new TypeScript.Api.Resolver(io);

        var diagnostics = [];

        if(!compiler) {

            module.exports.reset();
        }

        resolver.resolve([_module.filename], (resolved: TypeScript.Api.SourceUnit[]) => {

            if(module.exports.check(resolved)) {

                compiler.compile(resolved,(compiled: TypeScript.Api.CompiledUnit[]) => {

                    if(module.exports.check(compiled)) {

                        module.exports.run(compiled,null,function(context) {

                            _module.exports=context;
                        });
                    }
                    else {

                        output_diagnostics(compiled);
                    }
                });
            }
            else {

                output_diagnostics(resolved)
            }
        });
    }
}
