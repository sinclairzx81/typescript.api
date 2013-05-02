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
			
			this.files[path] = new TypeScript.Api.TextWriter();
			
			return this.files[path];
			
		}
		
		public directoryExists(path: string): boolean {
		
			return true;
		}
		
		public fileExists(path: string): boolean {

			return true;
		}
		
		public resolvePath(path: string): string {
			
			return '/';
		}

	}
	 
}