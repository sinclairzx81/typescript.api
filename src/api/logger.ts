/// <reference path='decl/typescript.d.ts' />
/// <reference path='textwriter.ts' />

module TypeScript.Api {
	///////////////////////////////////////////////////////////////////////
	// NullLogger: A Logger that doesn't log anything.
	///////////////////////////////////////////////////////////////////////		
	export class NullLogger implements TypeScript.ILogger {
		
		public information() : boolean { 
			return false; 
		}
		
		public debug() : boolean {
			return false; 
		}
		
		public warning() : boolean { 
			return false; 
		}
		
		public error()  : boolean { 
			return false; 
		}
		
		public fatal(): boolean { 
			return false; 
		}
		
		public log(s: string): void {
			
		}
	}
	///////////////////////////////////////////////////////////////////////
	// BufferedLogger: Log messages are written into a buffer.
	///////////////////////////////////////////////////////////////////////		
	export class BufferedLogger implements TypeScript.ILogger {
		
		private writer : TypeScript.Api.TextWriter;
		
		constructor() {
			this.writer = new TypeScript.Api.TextWriter();
		}
		
		public information() : boolean { 
			return false; 
		}
		
		public debug() : boolean {
			return false; 
		}
		
		public warning() : boolean { 
			return false; 
		}
		
		public error()  : boolean { 
			return false; 
		}
		
		public fatal(): boolean { 
			return false; 
		}
		
		public log(s: string): void {
			this.writer.WriteLine(s);
		}
		
		public ToString() : string {
			return this.writer.ToString();
		}
	}
	
	///////////////////////////////////////////////////////////////////////
	// ConsoleLogger: Log messages are written out to the console.
	///////////////////////////////////////////////////////////////////////	
	export class ConsoleLogger implements TypeScript.ILogger {
		
		public information() : boolean { 
			return false; 
		}
		
		public debug() : boolean {
			return false; 
		}
		
		public warning() : boolean { 
			return false; 
		}
		
		public error()  : boolean { 
			return false; 
		}
		
		public fatal(): boolean { 
			return false; 
		}
		
		public log(s: string): void {
			console.log(s);
		}
	}

}