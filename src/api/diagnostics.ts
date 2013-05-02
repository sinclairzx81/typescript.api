/// <reference path="decl/typescript.d.ts" />

module TypeScript.Api {	

	///////////////////////////////////////////////////////////////////////
	// Diagnostic : Diagnostic Error object.
	///////////////////////////////////////////////////////////////////////	
	
	export class Diagnostic {
		public filename      : string;
		public start         : number;
		public length        : number;
		public text          : string;
		public message       : string;
	}
	
	///////////////////////////////////////////////////////////////////////
	// DiagnosticReporter : Handles compiler diagnostic messages...
	///////////////////////////////////////////////////////////////////////	
	
	export class DiagnosticReporter implements  TypeScript.IDignosticsReporter {
        
		public compilation  : TypeScript.Api.Compilation;
		
		public logger       : TypeScript.ILogger;
		
		constructor(compilation:TypeScript.Api.Compilation, logger: TypeScript.ILogger) {
		
			this.compilation = compilation;
			
			this.logger      = logger;
		}
		
		public addDiagnostic(diagnostic: TypeScript.IDiagnostic): void {
			
			var diag = new Diagnostic();
			
			diag.filename  = diagnostic.fileName();
			
			diag.start     = diagnostic.start();
			
			diag.length    = diagnostic.length();
			
			diag.text      = diagnostic.text();
			
			diag.message   = diagnostic.message();
			
			this.compilation.diagnostics.push(diag);
			
			var message = diag.filename + "[" + diag.start.toString() + "] : " + diag.message;
			
			this.logger.log(message);
			 
		} 
    }
}