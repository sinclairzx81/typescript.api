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

/// <reference path='decl/typescript.d.ts' />
/// <reference path='textwriter.ts' />
/// <reference path='diagnostics.ts' />
/// <reference path='resolver.ts' />
/// <reference path='emitter.ts' />


/// <reference path='reflect.ts' />

module TypeScript.Api {
	
	///////////////////////////////////////////////////////////////////////
	// Compilation : What a compiler outputs.
	///////////////////////////////////////////////////////////////////////	
	
	export class CompilationUnit {
		public ast      : TypeScript.AST;
		public filename : string;
		public content  : string;
	}
	
	export class Compilation {
		public units       : CompilationUnit[];
		public diagnostics : TypeScript.Api.Diagnostic[];
		constructor() {
			this.units 	     = [];
			this.diagnostics = [];
		}
	}
	
	///////////////////////////////////////////////////////////////////////
	// Compiler : Api Compiler
	///////////////////////////////////////////////////////////////////////	

	export class Compiler {
		
		public compiler : TypeScript.TypeScriptCompiler;
		public logger   : ILogger;
		
		constructor(logger:TypeScript.ILogger)  {
			
			this.logger = logger;
			
			// settings...might be better to make these available to caller?
			var settings = new TypeScript.CompilationSettings();
			settings.codeGenTarget                  = TypeScript.LanguageVersion.EcmaScript5;
			settings.moduleGenTarget                = TypeScript.ModuleGenTarget.Synchronous;
			settings.disallowBool                   = true;
			
			// the compiler...
			this.compiler = new TypeScript.TypeScriptCompiler(new TypeScript.Api.NullLogger(), settings, TypeScript.diagnosticMessages);
			this.compiler.logger = new TypeScript.Api.NullLogger(); 
		} 
		
		public compile(units:SourceUnit [], callback: { (compilation:Compilation) : void;} ) : void {  
			
			var compilation = new Compilation();
			
			// add source units
			for(var n in units) {
				var unit = units[n];
				var snapshot   = TypeScript.ScriptSnapshot.fromString( unit.content );
				var references = TypeScript.getReferencedFiles(unit.path, snapshot);
				var document   = this.compiler.addSourceUnit(unit.path, snapshot, 0, false, references);		
			}
			
			
			// syntax check
			for(var n in units) {
				var unit = units[n];
				var diagnostics = this.compiler.getSyntacticDiagnostics(unit.path);
				for(var m in diagnostics) {
					compilation.diagnostics.push( Diagnostic.create("syntax", unit, diagnostics[m]) );
				}					 
			}		
			
			// type check...
			this.compiler.pullTypeCheck();
			var keys = this.compiler.fileNameToDocument.getAllKeys();
			for(var n in keys) {
				var key = keys[n];
				var diagnostics = this.compiler.getSemanticDiagnostics(key);
				for(var m in diagnostics){
					compilation.diagnostics.push( Diagnostic.create("typecheck", unit, diagnostics[m]) );
				}
			}
			
			 // output any errors.
			for(var n in compilation.diagnostics) {
				this.logger.log('[compiler] ' + compilation.diagnostics[n].toString());
			}
			 
			
			// emit the source code...
			var emitter = new TypeScript.Api.Emitter();
			this.compiler.emitAll(emitter, (inputFile: string, outputFile: string) : void => {
				this.logger.log('[emitting] ' + outputFile);
			});
			
			// push ast and scripts on compilation..
			var scripts:TypeScript[] = this.compiler.getScripts();
			var idx = 0;
			for(var filename in emitter.files) {
				var unit      = new CompilationUnit();
				unit.ast      = scripts[idx];
				unit.filename = filename;
				unit.content  = emitter.files[filename].ToString();
				compilation.units.push( unit );
				idx++; // bit loose...
			}
			
			// return..
			callback(compilation);
		}
	}
	
}




 
 




