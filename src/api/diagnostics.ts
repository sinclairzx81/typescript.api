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
		
		public static create(unit:SourceUnit, diagnostic: TypeScript.IDiagnostic) : LineInfo {
			var line_index = 0;
			var char_index = 0;
			for(var i = 0; i < diagnostic.start(); i++) {
				var ch = unit.content[i];
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
	}	
	
	export class Diagnostic {
		public type          : string;
		public filename      : string;
		public lineinfo      : LineInfo;
		public text          : string;
		public message       : string;
		
		public static create(type:string, unit:SourceUnit, diagnostic: TypeScript.IDiagnostic) : Diagnostic {
			var result       = new Diagnostic();
			result.type      = type;
			result.filename  = diagnostic.fileName();
			result.text      = diagnostic.text();
			result.message   = diagnostic.message();
			result.lineinfo  = LineInfo.create(unit, diagnostic);
			return result;
		}
	}
}