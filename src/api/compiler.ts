/// <reference path='decl/typescript.d.ts' />
/// <reference path='messages.ts' />
/// <reference path='textwriter.ts' />
/// <reference path='resolver.ts' />
/// <reference path='emitter.ts' />
/// <reference path='logger.ts' />
/// <reference path='io.ts' />

module TypeScript.Api {
	
	export class DiagnosticReporter implements  TypeScript.IDignosticsReporter {
        
		public addDiagnostic(diagnostic: TypeScript.IDiagnostic): void {
			 
		} 
    }
	
	export class Compiler {
		
		public compiler : TypeScript.TypeScriptCompiler;
		
		constructor(public ioHost : IIO)  {
			
			var logger = new TypeScript.Api.Logger(this.ioHost);			
			
			var compilationSettings             = new TypeScript.CompilationSettings();

			compilationSettings.codeGenTarget   = TypeScript.LanguageVersion.EcmaScript5;

			compilationSettings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;			

			this.compiler = new TypeScript.TypeScriptCompiler(TypeScript.Api.Resources.EN.DiagnosticMessages, logger, compilationSettings);
			
			this.compiler.logger = logger; 
		} 
		
		public resolve(sources:string[], callback: {( files:IResolvedFile[]): void; }) : void {
			
			var io       = new TypeScript.Api.IOAsyncRemoteHost();
			
			var logger   = new TypeScript.Api.Logger( this.ioHost );

			var resolver = new TypeScript.Api.CodeResolver( io, logger );

			resolver.resolve(sources, callback);
		}
		
		public compile() : void {  
			
			// bind on each compile...
			TypeScript.CompilerDiagnostics.diagnosticWriter = { 
			
					Alert : (s: string) => { this.ioHost.printLine(s); } 
			
			}
			
			/*
				var code = this.ioHost.readFile(filename);
				
				var snapshot = TypeScript.ScriptSnapshot.fromString( code);
				
				var references = TypeScript.getReferencedFiles(filename, snapshot);
				
				var document = this.compiler.addSourceUnit(filename, snapshot, 0, false, references);		
				
				// diagnostics....
				
				var syntacticDiagnostics = this.compiler.getSyntacticDiagnostics(filename);
				
				this.compiler.reportDiagnostics(syntacticDiagnostics, new TypeScript.Api.DiagnosticReporter());
				
				// compilation...
				
				this.compiler.pullTypeCheck();
				
				var emitter = new TypeScript.Api.Emitter();
				
				this.compiler.emitAll(emitter, (inputFile: string, outputFile: string) : void => {
					 
					 console.log('mapInputToOutput(' + inputFile + ',' + outputFile + ')' ); 
				});
				
				for(var n in emitter.files) {
				
					console.log(emitter.files[n].ToString());
				}
		
		*/
		}
	}
}




 
 




