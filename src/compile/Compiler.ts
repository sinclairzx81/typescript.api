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

/// <reference path="../decl/typescript.d.ts" />
/// <reference path="../loggers/NullLogger.ts" />
/// <reference path="../units/Diagnostic.ts" />
/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../units/CompiledUnit.ts" />
/// <reference path="Emitter.ts" />

module TypeScript.Api.Compile {

	export class Compiler  
	{
		public compiler    : TypeScript.TypeScriptCompiler;

		public logger      : TypeScript.ILogger;

		public sourceUnits : TypeScript.Api.Units.SourceUnit [];

		constructor(languageVersion:TypeScript.LanguageVersion, moduleTarget:TypeScript.ModuleGenTarget, logger:TypeScript.ILogger)  
		{
			this.logger = logger;

			// source Units

			this.sourceUnits = [];

			// settings...

			var settings = new TypeScript.CompilationSettings();

			settings.codeGenTarget   = languageVersion; //TypeScript.LanguageVersion.EcmaScript5;

			settings.moduleGenTarget = moduleTarget; //TypeScript.ModuleGenTarget.Synchronous;

			settings.disallowBool    = true;

            settings.generateDeclarationFiles = true;

			// the compiler...

			this.compiler = new TypeScript.TypeScriptCompiler(new TypeScript.Api.Loggers.NullLogger(), settings, TypeScript.diagnosticMessages);

			this.compiler.logger = new TypeScript.Api.Loggers.NullLogger(); 
		}

		private isSourceUnitInCache(sourceUnit:TypeScript.Api.Units.SourceUnit) : boolean 
		{
			for(var n in this.sourceUnits)
			{
				if(this.sourceUnits[n].path == sourceUnit.path)
				{
					return true;
				}
			}
			return false;
		}

		private isSourceUnitUpdated(sourceUnit:TypeScript.Api.Units.SourceUnit) : boolean 
		{
			for(var n in this.sourceUnits)
			{
				if(this.sourceUnits[n].path == sourceUnit.path)
				{
					if(this.sourceUnits[n].content != sourceUnit.content)
					{
						return true;
					}
				}
			}
			return false;
		}
        
		private addSourceUnit ( sourceUnit : TypeScript.Api.Units.SourceUnit ) : void 
		{
			if( !sourceUnit.hasError() ) 
			{
				var snapshot   = TypeScript.ScriptSnapshot.fromString( sourceUnit.content );

				var references = TypeScript.getReferencedFiles(sourceUnit.path, snapshot);

			    if( !this.isSourceUnitInCache(sourceUnit) )
			    {
                    sourceUnit.syntaxChecked = false;

                    sourceUnit.typeChecked   = false;

				    this.compiler.addSourceUnit(sourceUnit.path, snapshot, 1 /*ByteOrderMark.Utf8*/, 0, false, references);

                    this.sourceUnits.push(sourceUnit);
				    
				    return;
			    }
                
                if(this.isSourceUnitUpdated(sourceUnit))
                {
                    sourceUnit.syntaxChecked = false;

                    sourceUnit.typeChecked   = false;

                    var oldSourceUnit        = null;

                    for(var n in this.sourceUnits)
                    {
                        if(this.sourceUnits[n].path == sourceUnit.path)
                        {
                            oldSourceUnit = this.sourceUnits[n];
                        }
                    }

                    var textSpan:TypeScript.TextSpan = new TypeScript.TextSpan(0, oldSourceUnit.content.length);

                    var textChange:TypeScript.TextChangeRange = new TypeScript.TextChangeRange(textSpan, sourceUnit.content.length );

				    this.compiler.updateSourceUnit(sourceUnit.path, snapshot, 0, false, textChange);
                    
                    for(var n in this.sourceUnits) // update the existing source unit.
                    {
                        if(this.sourceUnits[n].path == sourceUnit.path)
                        {
                            this.sourceUnits[n] = sourceUnit;
                        }
                    }

                    return;
                }
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

            // emit declarations

            this.compiler.emitAllDeclarations();

			var result:TypeScript.Api.Units.CompiledUnit[] = [];

			// foreach emitted file....

			for(var file in emitter.files) 
			{
				var document  = this.compiler.getDocument( emitter_io_map [ file ] );
                
				// if located emitted source document..

				if(document)
				{
					// locate corrosponding source unit.

					var sourceUnit : TypeScript.Api.Units.SourceUnit = null;

					for(var n in sourceUnits)
					{
						if(sourceUnits[n].path == emitter_io_map[ file ] )
						{       
							sourceUnit = sourceUnits[n];
						}
					}

					// if sourceUnit, output compiledUnit, add diagnostics to compiled unit also.

					if(sourceUnit)
					{
						// parameters...

                        var get_source = (sourceUnitPath : string, emitter : Emitter) : string => {

                            sourceUnitPath    = sourceUnitPath.replace(/\\/g, '/').replace(/.ts$/, '.js');

                            var content = '';
                        
                            for(var filename in emitter.files)
                            {
                                if(filename.replace(/\\/g, '/') == sourceUnitPath)
                                {
                                    content = emitter.files[filename];
                                }
                            }                        
                            return content;
                        };
                        var get_declaration_source = (sourceUnitPath : string, emitter : Emitter) : string => {

                            sourceUnitPath    = sourceUnitPath.replace(/\\/g, '/').replace(/.ts$/, '.d.ts');

                            var content = '';
                        
                            for(var filename in emitter.files)
                            {
                                if(filename.replace(/\\/g, '/') == sourceUnitPath)
                                {
                                    content = emitter.files[filename];
                                }
                            } 
                                                   
                            return content;
                        };

                        var path        = sourceUnit.path.replace(/\\/g, '/');

                        var content     = get_source (path, emitter);

                        var declaration = get_declaration_source (path, emitter);
    
						var diagnostics = sourceUnit.diagnostics;

						var ast 		= document.script;
                          
						result.push( new TypeScript.Api.Units.CompiledUnit(path, content, diagnostics, ast, declaration) );
					}
				}
			}

			return result;
		}
        
		public compile(sourceUnits:TypeScript.Api.Units.SourceUnit[], callback: { (compiledUnits : TypeScript.Api.Units.CompiledUnit [] ) : void;} ) : void 
		{  
            // remove non referenced source units....
            
            this.sourceUnits = this.sourceUnits.filter((element, index, array) => 
            {
                for(var n in sourceUnits)
                {
                    if(sourceUnits[n].path == element.path)
                    {
                        return true;
                    }
                }

                return false;
            }); 

			// add or update source units to the compiler.....

			for(var n in sourceUnits)
			{
				this.addSourceUnit ( sourceUnits[n] );
			}

			// syntax check....

			for(var n in this.sourceUnits) 
			{
                if(!this.sourceUnits[n].syntaxChecked)
                {
				    var syntax_diagnostics = this.syntaxCheck( this.sourceUnits[n] );

				    for(var m in syntax_diagnostics)
				    {
					    this.sourceUnits[n].diagnostics.push( syntax_diagnostics[m] );
				    }

                    this.sourceUnits[n].syntaxChecked = true;
                }
			}

			// type check....

			for(var n in this.sourceUnits)
			{
                if(!this.sourceUnits[n].typeChecked)
                {
				    var typecheck_diagnostics = this.typeCheck( this.sourceUnits[n] );

				    for(var m in typecheck_diagnostics)
				    {
					    this.sourceUnits[n].diagnostics.push( typecheck_diagnostics[m] );
				    }

                    this.sourceUnits[n].typeChecked = true;
                }
			}

			// emit and return...

			var compiledUnits = this.emitUnits( this.sourceUnits );
            
			callback(  compiledUnits );
		}
	}
}