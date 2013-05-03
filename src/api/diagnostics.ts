// Acid Frameworks.  All rights reserved.
// 
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
		
		public toString() : string {
			
			return this.filename + " [" + (this.lineinfo.line_index + 1).toString() 
								 + ":" +  (this.lineinfo.char_index + 1).toString() + "] " 
								 + this.message;
			
		}
	}
}