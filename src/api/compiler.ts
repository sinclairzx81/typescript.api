/// <reference path='decl/typescript.d.ts' />
/// <reference path='diagnostics.ts' />
/// <reference path='messages.ts' />
/// <reference path='textwriter.ts' />
/// <reference path='resolver.ts' />
/// <reference path='emitter.ts' />

module TypeScript.Api {
	
	///////////////////////////////////////////////////////////////////////
	// Compilation : What a compiler outputs.
	///////////////////////////////////////////////////////////////////////	
	
	export class Compilation {
		public ast          : AST;
		public scripts      : string[];
		public diagnostics  : TypeScript.Api.Diagnostic[];
		constructor() {
			this.scripts     = [];
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
			
			var settings = new TypeScript.CompilationSettings();
			settings.codeGenTarget                  = TypeScript.LanguageVersion.EcmaScript5;
			settings.moduleGenTarget                = TypeScript.ModuleGenTarget.Synchronous;			
            settings.gatherDiagnostics              = true;
			settings.updateTC                       = true;			
		    settings.propagateConstants             = false;
			settings.minWhitespace                  = false;
			settings.emitComments                   = false;
			settings.watch                          = false;
			settings.exec                           = false;
			settings.resolve                        = true;
			settings.disallowBool                   = false;
			settings.useDefaultLib                  = true;
			settings.outputOption                   = 'file';
			settings.mapSourceFiles                 = false;
			settings.emitFullSourceMapPath          = false;
			settings.generateDeclarationFiles       = false;
			settings.useCaseSensitiveFileResolution = false;
			settings.gatherDiagnostics              = true;
			settings.updateTC                       = true;
			settings.disallowBool                   = true;
			
			var diagnosticMessages = TypeScript.diagnosticMessages; // localize these in future...
			
			this.compiler = new TypeScript.TypeScriptCompiler(this.logger, settings, diagnosticMessages);
			
			this.compiler.logger = logger; 
		} 
		
		public compile(units:SourceUnit [], callback: { (compilation:Compilation) : void;} ) : void {  
			
			//TypeScript.CompilerDiagnostics.diagnosticWriter = {  Alert : (message: string) => { this.logger.log(message); }};
			
			var compilation = new Compilation();
			
			for(var n in units) {
				
				var unit = units[n];
				
				// add source unit
				var snapshot   = TypeScript.ScriptSnapshot.fromString( unit.content );
				
				var references = TypeScript.getReferencedFiles(unit.path, snapshot);
				
				var document   = this.compiler.addSourceUnit(unit.path, snapshot, 0, false, references);		

				// run diagnostics
				var syntacticDiagnostics = this.compiler.getSyntacticDiagnostics(unit.path);
				
				var diagnostics = new TypeScript.Api.DiagnosticReporter(compilation, this.logger );
				
				this.compiler.reportDiagnostics(syntacticDiagnostics, diagnostics);
			}
			
			// type check...
			this.compiler.pullTypeCheck();

			// emit the source code...
			var emitter = new TypeScript.Api.Emitter();
			
			this.compiler.emitAll(emitter, (inputFile: string, outputFile: string) : void => {
				 
				this.logger.log('[emitting] ' + outputFile);
			});
			
			// build result..
			
			
			
			callback(compilation);
			
			//callback(emitter.files);
		}
	}
	
}




 
 




