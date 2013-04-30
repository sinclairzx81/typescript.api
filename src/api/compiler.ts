/// <reference path='../compiler/typescript.ts'/>
/// <reference path='../compiler/io.ts'/>
/// <reference path='iohost.ts' />
/// <reference path='textwriter.ts' />
/// <reference path='resolver.ts' />
/// <reference path='emitter.ts' />
/// <reference path='logger.ts' />

module TypeScript.Api {
	
	export class DiagnosticReporter implements  TypeScript.IDignosticsReporter {
        
		public addDiagnostic(diagnostic: TypeScript.IDiagnostic): void {
			 
		} 
    }
	
	export class Compiler {
		
		public compiler : TypeScript.TypeScriptCompiler;
		
		public sources  : string [];
		
		constructor(public ioHost : IIO, public compilationSettings : TypeScript.CompilationSettings)  {
			
			TypeScript.CompilerDiagnostics.diagnosticWriter = { Alert: (s: string) => { this.ioHost.printLine(s); } }
			
			var logger = new TypeScript.Api.Logger(this.ioHost);
			
			this.compiler = new TypeScript.TypeScriptCompiler(TypeScript.EN_DiagnosticMessages, logger, this.compilationSettings);
			
			this.compiler.logger = logger; 
		} 
		
		public resolve(callback: {( files:IResolvedFile[]): void; }) : void{
			
			var resolver = new TypeScript.Api.Resolver(this.ioHost, this.sources);
			
			resolver.resolve(callback);
		}
		
		public compile() : void {  

			//var fs = require("fs");   
			 
			var filename = 'C:/input/code.ts'; 
			
			//var code = fs.readFileSync( filename, "ascii");
			
			var code = this.ioHost.readFile(filename);
			
			// compilation proc
			
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
		}
	}
}


var ioHost = new TypeScript.Api.IOHost( new TypeScript.Api.TextWriter(), new TypeScript.Api.TextWriter() );

var compilationSettings = new TypeScript.CompilationSettings();
			
compilationSettings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;

compilationSettings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;

var compiler = new TypeScript.Api.Compiler( ioHost, compilationSettings );

compiler.sources = ['C:/input/code.ts'];

compiler.resolve(() => {
	
	 
	
});

 




