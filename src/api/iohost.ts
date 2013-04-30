///<references path="../compiler/io.ts" />
///<references path="textwriter.ts" />

module TypeScript.Api {
 
	var _fs 	= require('fs');
	
	var _path   = require('path');

	export class IOHost implements IIO {
			
		arguments: string[];  
		
		constructor(public stdout:ITextWriter, public stderr:ITextWriter) {
			
		}
		
		public readFile(path: string): string {
			
			if( _fs.existsSync( path ) ) {
				
				return _fs.readFileSync( path, "utf8");
			}
			
			return "";
		}
		public writeFile(path: string, contents: string): void {
			
		}
		public createFile(path: string, useUTF8?: boolean): ITextWriter {
		
			return null;
			
		}
		public deleteFile(path: string) : void {
			
		}
		public dir(path: string, re?: RegExp, options?: { recursive?: boolean; }): string[] {
		
			return [];
			
		}
		public fileExists(path: string): boolean {
		
			return false;
			
		}
		public directoryExists(path: string): boolean {
		
			return false;
			
		}
		public createDirectory(path: string): void {
		
		}
		public resolvePath(path: string): string {
		
			return "";
			
		}
		public dirName(path: string): string {
		
			return _path.dirname(path);
		}
		
		public findFile(rootPath: string, partialFilePath: string): IResolvedFile{
			
			return null;
		}
		public print(str: string): void {
			
		}
		public printLine(str: string): void {
			
			console.log(str);
			
		}

		public watchFile(fileName: string, callback: (string) => void ): IFileWatcher {
		
			return null;
			
		}
		public run(source: string, fileName: string): void {
			
		}
		public getExecutingFilePath(): string {
		
			return "";
			
		}
		public quit(exitCode?: number) {
			
		}
	}   
}