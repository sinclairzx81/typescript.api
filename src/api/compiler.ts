/// <reference path='decl/typescript.d.ts' />
/// <reference path='messages.ts' />
/// <reference path='textwriter.ts' />
/// <reference path='resolver.ts' />
/// <reference path='emitter.ts' />

module TypeScript.Api {

	///////////////////////////////////////////////////////////////////////
	// DiagnosticReporter : Not sure how this works yet...
	///////////////////////////////////////////////////////////////////////	
	
	export class DiagnosticReporter implements  TypeScript.IDignosticsReporter {
        
		public addDiagnostic(diagnostic: TypeScript.IDiagnostic): void {
		
			 // todo: implement this...
			 
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
			
			settings.codeGenTarget   = TypeScript.LanguageVersion.EcmaScript5;
			
			settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;			
			
			var language_file = TypeScript.Api.Resources.EN.DiagnosticMessages;
			
			this.compiler = new TypeScript.TypeScriptCompiler(language_file, this.logger, settings);
			
			this.compiler.logger = logger; 
		} 
		
		public compile(units:SourceUnit [], callback:Function) : void {  
			
			// bind on each compile...
			TypeScript.CompilerDiagnostics.diagnosticWriter = {  Alert : (s: string) => { 
				
				console.log(s); 
			}};
						
			for(var n in units) {
				
				var unit = units[n];
				
				var snapshot   = TypeScript.ScriptSnapshot.fromString( unit.content);
				
				var references = TypeScript.getReferencedFiles(unit.path, snapshot);
				
				var document   = this.compiler.addSourceUnit(unit.path, snapshot, 0, false, references);		
				
				//var syntacticDiagnostics = this.compiler.getSyntacticDiagnostics(unit.path);
				
				//this.compiler.reportDiagnostics(syntacticDiagnostics, new TypeScript.Api.DiagnosticReporter());
			}
			
			this.compiler.pullTypeCheck();

			var emitter = new TypeScript.Api.Emitter();
			
			this.compiler.emitAll(emitter, (inputFile: string, outputFile: string) : void => {
				 
				this.logger.log('[emitting]' + outputFile);
			});
			
			callback(emitter.files);
		}
	}
}




 
 




