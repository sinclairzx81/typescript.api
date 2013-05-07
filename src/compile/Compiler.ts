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
/// <reference path="../loggers/NullLogger.ts" />
/// <reference path="../units/Diagnostic.ts" />
/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../units/CompiledUnit.ts" />
/// <reference path="Emitter.ts" />

module TypeScript.Api.Compile 
{
	export class Compiler 
	{
		public compiler : TypeScript.TypeScriptCompiler;
		
		public logger   : TypeScript.ILogger;
		
		constructor(logger:TypeScript.ILogger)  
		{
			this.logger = logger;
			
			// settings...
			
			var settings = new TypeScript.CompilationSettings();
			
			settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
			
			settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
			
			settings.disallowBool = true;
			
			// the compiler...
			
			this.compiler = new TypeScript.TypeScriptCompiler(new TypeScript.Api.Loggers.NullLogger(), settings, TypeScript.diagnosticMessages);
			
			this.compiler.logger = new TypeScript.Api.Loggers.NullLogger(); 
		}
		
		private addSourceUnit ( sourceUnit : TypeScript.Api.Units.SourceUnit ) : void 
		{
			// do not compile units with errors.
			if( !sourceUnit.hasError() ) 
			{
				var snapshot = TypeScript.ScriptSnapshot.fromString( sourceUnit.content );
			
				var references = TypeScript.getReferencedFiles(sourceUnit.path, snapshot);
				
				this.compiler.addSourceUnit(sourceUnit.path, snapshot, 0, false, references);
			}
		}
		
		private syntaxCheck (sourceUnit:TypeScript.Api.Units.SourceUnit) : TypeScript.Api.Units.Diagnostic [] 
		{
			var result:TypeScript.Api.Units.Diagnostic[] = [];
		
			var _diagnostics = this.compiler.getSyntacticDiagnostics(sourceUnit.path);
			
			for(var n in _diagnostics) 
			{
				var diagnostic = new TypeScript.Api.Units.Diagnostic("syntax", _diagnostics[n].fileName(), _diagnostics[n].text(), _diagnostics[n].message());
				
				diagnostic.computeLineInfo(sourceUnit.content, _diagnostics[n].start());
				
				result.push( diagnostic );
			}

			return result;
		 
		}
		
		private typeCheck(sourceUnit:TypeScript.Api.Units.SourceUnit) : TypeScript.Api.Units.Diagnostic [] 
		{
			var result:TypeScript.Api.Units.Diagnostic[] = [];
		
			this.compiler.pullTypeCheck();
			
			var _diagnostics = this.compiler.getSemanticDiagnostics(sourceUnit.path);
			
			for(var n in _diagnostics) 
			{
				var diagnostic = new TypeScript.Api.Units.Diagnostic("typecheck", _diagnostics[n].fileName(), _diagnostics[n].text(), _diagnostics[n].message());

				diagnostic.computeLineInfo(sourceUnit.content, _diagnostics[n].start());
				
				result.push( diagnostic );
			}
			
			return result;
		 	
		}		

		private emitUnits( sourceUnits: TypeScript.Api.Units.SourceUnit [] ) : TypeScript.Api.Units.CompiledUnit []
		{
			// store a map of the input and output.
			
			var emitter_io_map = [];
			
			var emitter = new TypeScript.Api.Compile.Emitter();
			
			this.compiler.emitAll(emitter, (inputFile: string, outputFile: string) : void => 
			{
				emitter_io_map[outputFile] = inputFile;
			});
			
			var result:TypeScript.Api.Units.CompiledUnit[] = [];
			
			// foreach emitted file....
			
			for(var file in emitter.files) 
			{
				var document  = this.compiler.getDocument( emitter_io_map [ file ] );
				
				// if located emitted source document..
				
				if(document)
				{
					// locate corrosponding source unit.
					
					var sourceUnit : TypeScript.Api.Units.SourceUnit;
					
					for(var n in sourceUnits)
					{
						if(sourceUnits[n].path == emitter_io_map[ file ] )
						{
							sourceUnit = sourceUnits[n];
						}
					}
					
					// if sourceUnit, outout compiledUnit, add diagnostics to compiled unit also.
					
					if(sourceUnit)
					{
						// parameters...
						
						var path 		= sourceUnit.path;
					
						var content 	= emitter.files[file].toString();
						
						var diagnostics = sourceUnit.diagnostics;
						
						var ast 		= document.script;
						
						result.push( new TypeScript.Api.Units.CompiledUnit(path, content, diagnostics, ast) );
					}
				}
			}
			
			return result;
		}
		
		public compile(sourceUnits:TypeScript.Api.Units.SourceUnit[], callback: { (compiledUnits : TypeScript.Api.Units.CompiledUnit [] ) : void;} ) : void 
		{  
			// add source units...
			for(var n in sourceUnits)
			{
				this.addSourceUnit ( sourceUnits[n] );
			}
			
			// syntaxcheck
			for(var n in sourceUnits) 
			{
				var syntax_diagnostics = this.syntaxCheck(sourceUnits[n]);
				
				for(var m in syntax_diagnostics)
				{
					sourceUnits[n].diagnostics.push( syntax_diagnostics );
				}
			}
			
			// typecheck
			for(var n in sourceUnits) 
			{
				var typecheck_diagnostics = this.typeCheck( sourceUnits[n] );
				
				for(var m in typecheck_diagnostics)
				{
					sourceUnits[n].diagnostics.push( typecheck_diagnostics );
				}				
			}
			
			// emit and return...
			
			var compiledUnits = this.emitUnits( sourceUnits );
			
			callback(  compiledUnits );
		}
	}
}