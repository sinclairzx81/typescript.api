/// <reference path="decl/typescript.d.ts" />
/// <reference path="compiler.ts" />
/// <reference path="unit.ts" />

module TypeScript.Api {	

	///////////////////////////////////////////////////////////////////////
	// Diagnostic Objects : Diagnostic object returned by the Diagnostic Reporter.
	///////////////////////////////////////////////////////////////////////	
	
	export class LineInfo {
		constructor(public line_index  : number,
					public char_index  : number) { }
	}	
	
	export class Diagnostic {
		public filename      : string;
		public lineinfo      : LineInfo;
		public text          : string;
		public message       : string;
	}
	
	///////////////////////////////////////////////////////////////////////
	// DiagnosticReporter : Handles compiler diagnostic messages...
	///////////////////////////////////////////////////////////////////////	
	
	export class DiagnosticReporter implements  TypeScript.IDignosticsReporter {
        
		public unit         : TypeScript.Api.SourceUnit;
		public logger       : TypeScript.ILogger;
		public diagnostics  : Diagnostic[];
		
		constructor(unit : TypeScript.Api.SourceUnit, logger: TypeScript.ILogger) {
			this.unit		 = unit;
			this.logger      = logger;
			this.diagnostics = [];
		}
		
		public get_line_info(diagnostic: TypeScript.IDiagnostic) : LineInfo {
			var line_index = 0;
			var char_index = 0;
			for(var i = 0; i < diagnostic.start(); i++) {
				var ch = this.unit.content[i];
				if(ch == '\r\n') {
					line_index += 1;
					char_index =  0;
					i += 1;
				}
				if(ch == '\n') {
					line_index += 1;
					char_index =  0;				
				}
				char_index += 1;
			}
			return new LineInfo(line_index, char_index);
		}
		
		public addDiagnostic(diagnostic: TypeScript.IDiagnostic): void {
		
			var diag       = new Diagnostic();
			diag.filename  = diagnostic.fileName();
			diag.lineinfo  = this.get_line_info(diagnostic);
			diag.text      = diagnostic.text();
			diag.message   = diagnostic.message();
			this.diagnostics.push(diag);
			
			var message = diag.filename + "[" + diag.lineinfo.line_index.toString() + ":" + diag.lineinfo.char_index.toString() + "] : " + diag.message;
			this.logger.log(message);
			 
		} 
    }
}