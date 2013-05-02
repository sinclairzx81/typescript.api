/// <reference path='decl/typescript.d.ts' />
/// <reference path='messages.ts' />
/// <reference path='textwriter.ts' />
/// <reference path='resolver.ts' />
/// <reference path='emitter.ts' />

module TypeScript.Api {
	
	export class DiagnosticReporter implements  TypeScript.IDignosticsReporter {
        
		public addDiagnostic(diagnostic: TypeScript.IDiagnostic): void {
			 // todo: implement this...
		} 
    }
	
	export class Compiler {
		
		public compiler : TypeScript.TypeScriptCompiler;
		
		constructor(logger:TypeScript.ILogger)  {
			
			var compilationSettings = new TypeScript.CompilationSettings();
			
			compilationSettings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;

			compilationSettings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;			
			
			var language_file = TypeScript.Api.Resources.EN.DiagnosticMessages;
			
			this.compiler = new TypeScript.TypeScriptCompiler(language_file, logger, compilationSettings);
			
			this.compiler.logger = logger; 
		} 
		
		public compile(files:ResolvedFile[], callback:Function) : void {  
			
			// bind on each compile...
			TypeScript.CompilerDiagnostics.diagnosticWriter = {  Alert : (s: string) => { 
				
				console.log(s); 
			}};
						
			for(var n in files) {
				
				var file = files[n];
				
				var snapshot   = TypeScript.ScriptSnapshot.fromString( file.content);
				
				var references = TypeScript.getReferencedFiles(file.path, snapshot);
				
				var document = this.compiler.addSourceUnit(file.path, snapshot, 0, false, references);		
				
				//var syntacticDiagnostics = this.compiler.getSyntacticDiagnostics(file.path);
				
				//this.compiler.reportDiagnostics(syntacticDiagnostics, new TypeScript.Api.DiagnosticReporter());
			}
			
			this.compiler.pullTypeCheck();

			var emitter = new TypeScript.Api.Emitter();
			
			this.compiler.emitAll(emitter, (inputFile: string, outputFile: string) : void => {
				 
				// todo: maybe output something here...
			});
			
			callback(emitter.files);
		}
	}
}




 
 




