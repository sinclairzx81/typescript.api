/// <reference path="textwriter.ts" />

module TypeScript.Api {
	
	export interface IEmitter {
	
		directoryExists(path: string) : boolean;
		
		fileExists     (path: string) : boolean;
		
		resolvePath    (path: string) : string;
		
		createFile     (path: string, useUTF8?: boolean): ITextWriter;
	}
	
	export class Emitter {
		
		public files : ITextWriter[];
		
		constructor() {
		
			this.files = [];
		}
		
		public createFile(path: string, useUTF8?: boolean): ITextWriter {
			
			console.log("Emitter.createFile -> " + path);
			
			this.files[path] = new TypeScript.Api.TextWriter();
			
			return this.files[path];
			
		}
		
		public directoryExists(path: string): boolean {
		
			console.log("Emitter.directoryExists -> " + path);
			
			return true;
		}
		
		public fileExists(path: string): boolean {
		
			console.log("Emitter.fileExists -> " + path);
			
			return true;
		}
		
		public resolvePath(path: string): string {
			
			console.log("Emitter.resolvePath -> " + path);
		
			return '/';
		}

	}
	 
}