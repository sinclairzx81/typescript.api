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
/// <reference path="../writers/TextWriter.ts" />
/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../units/CompiledUnit.ts" />
/// <reference path="../reflect/TypeResolver.ts" />
/// <reference path="CompilerCache.ts" />

module TypeScript.Api {

	export class Emitter {
		
        public files : string[];

		constructor() 
		{
			this.files = [];
		}

        public writeFile(fileName: string, contents: string, writeByteOrderMark: boolean) : void {
            
			this.files[fileName] = contents;

			return this.files[fileName];
        }

		public directoryExists(path: string): boolean {

			return true;
		}

		public fileExists(path: string): boolean {

			return true;
		}

		public resolvePath(path: string): string {

			return '/';
		}
	}

    export class CompilerEmitter {

        public emitter : TypeScript.Api.Emitter;

        constructor(public compiler: TypeScript.TypeScriptCompiler, public cache : TypeScript.Api.CompilerCache) { 
        
            this.emitter = new Emitter();
        }

        // returns the javascript content emitted by the compiler.
        private get_content(unit:TypeScript.Api.SourceUnit) : string {
        
            var path = unit.path.replace(/\\/g, '/').replace(/.ts$/, '.js');

            for(var filename in this.emitter.files)
            {
                if(filename.replace(/\\/g, '/') == path)
                {
                    return this.emitter.files[filename];
                }
            }                        
            return '';
        }


        // returns the typescript declaration content emitted by the compiler.
        private get_declararion(unit:TypeScript.Api.SourceUnit) : string {
        
            var path = unit.path.replace(/\\/g, '/').replace(/.ts$/, '.d.ts');

            for(var filename in this.emitter.files)
            {
                if(filename.replace(/\\/g, '/') == path)
                {
                    return this.emitter.files[filename];
                }
            }                        
            return '';            
        }


        // gets the source map emitted by the compiler.
        private get_source_map(unit:TypeScript.Api.SourceUnit) : string {
        
            var path = unit.path.replace(/\\/g, '/').replace(/.ts$/, '.js.map');

            for(var filename in this.emitter.files)
            {
                if(filename.replace(/\\/g, '/') == path)
                {
                    return this.emitter.files[filename];
                }
            }                        
            return '';           
        }

        // gets the reflection for this unit.
        private get_reflection(unit:TypeScript.Api.SourceUnit, ast:TypeScript.Script) : TypeScript.Api.Script {
            
            var _script = TypeScript.Api.Script.create(unit.path, ast);

            return _script;
        }

		public emit () : TypeScript.Api.CompiledUnit []
		{
			// store a map of the input and output.

			var emitter_io_map = [];

			this.compiler.emitAll(this.emitter, (inputFile: string, outputFile: string) : void => 
			{
				emitter_io_map[outputFile] = inputFile;
			});            

            // note: due to unknown complications with the TS 0.9
            // compiler, the emitAllDeclarations method fails for
            // reasons unknown. Have left it out of the compiled
            // units, and will instead rely on the tsc.
            // this.compiler.emitAllDeclarations();

			var compiled : TypeScript.Api.CompiledUnit [] = [];

			for(var file in this.emitter.files) {

				var document  = this.compiler.getDocument( emitter_io_map [ file ] );

				if(document) {

					var sourceUnit = this.cache.get_cached_unit( emitter_io_map[ file ] );

					if(sourceUnit) {

                        var ast 		= document.script;

                        var path        = sourceUnit.path.replace(/\\/g, '/');

                        var content     = this.get_content      ( sourceUnit );

                        var sourcemap   = this.get_source_map   ( sourceUnit );

                        var _script     = this.get_reflection   ( sourceUnit, ast );
    
						var diagnostics = sourceUnit.diagnostics;

                        var references  = sourceUnit.references();
                        
						compiled.push( new TypeScript.Api.CompiledUnit(path, content, diagnostics, ast, sourcemap, _script, references ) );
					}
				}
			}

            // resolve type references on scripts.
            TypeScript.Api.TypeResolver.resolve( compiled.map((unit) => {
            
                return unit.script;
            }));

			return compiled;
		}
    }
}