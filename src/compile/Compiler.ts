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

/// <reference path="../decl/typescript.d.ts" />

/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../units/CompiledUnit.ts" />
/// <reference path="../loggers/NullLogger.ts" />
/// <reference path="CompilerOptions.ts" />
/// <reference path="CompilerCache.ts" />
/// <reference path="CompilerEmitter.ts" />

module TypeScript.Api {

	export class Compiler  
	{
		public compiler    : TypeScript.TypeScriptCompiler;

		public logger      : TypeScript.ILogger;

		public cache       : TypeScript.Api.CompilerCache;

        public emitter     : TypeScript.Api.CompilerEmitter;

		constructor(public options:TypeScript.Api.CompilerOptions)  
		{
			this.logger = options.logger;

			// settings...

            var settings = new TypeScript.CompilationSettings();

            settings.codeGenTarget            = options.languageVersion; //TypeScript.LanguageVersion.EcmaScript5;

            settings.moduleGenTarget          = options.moduleGenTarget; //TypeScript.ModuleGenTarget.Synchronous;
            
            settings.generateDeclarationFiles = options.generateDeclarationFiles;
            
            settings.mapSourceFiles           = options.mapSourceFiles;

            settings.disallowBool             = true;

            settings.outputOption             = '';

			// the compiler...
            
			this.compiler = new TypeScript.TypeScriptCompiler(new TypeScript.Api.NullLogger(), settings, TypeScript.diagnosticMessages);

			this.compiler.logger = new TypeScript.Api.NullLogger(); 

			// compiler unit cache

			this.cache   = new TypeScript.Api.CompilerCache(this.compiler);

            this.emitter = new TypeScript.Api.CompilerEmitter(this.compiler, this.cache);
		}


        private passes:number = 0;

		public compile(sourceUnits:TypeScript.Api.SourceUnit[], callback: { (compiledUnits : TypeScript.Api.CompiledUnit [] ) : void;} ) : void {  

            if(this.passes == 0) {

                // due to a unusual bug in the ts compiler, the '_this' was 
                // not being emitted from lambda expressions on referenced 
                // source units on first compile, in fact, it would require 
                // an addiional resolve() with file changes to get it to 
                // emit the '_this' back in. 
                //
                // as such, have updated the source unit to include a clone() 
                // method and introduced this functionality on 'first pass'. 
                // Essentially. we send the cache manager clones of the input 
                // source units, then force a reevalution on referenced source 
                // files by changing the content.
                //
                // next we update the cache with the 'actual' source units, 
                // which will trigger the update logic required to kick the 
                // compiler into gear.

                this.cache.update( sourceUnits.map ( (unit)=> { return unit.clone(); }));

                this.cache.reevaluate_references();

                this.cache.update( sourceUnits );

		        var compiled = this.emitter.emit();

                callback( compiled );
           
                this.passes = 1;
                
                return;
            }

            this.cache.update(sourceUnits);

		    var compiled = this.emitter.emit();
            
			callback(  compiled );
		}
	}
}