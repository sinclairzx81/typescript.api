/// <reference path='../compiler/typescript.ts'/>
/// <reference path='../compiler/io.ts'/>

module TypeScript.Api {

	var path = require('path');

	export class ResolvedFile implements IResolvedFile {
	
		content : string;
		
		path    : string;
	}
	
	export class AsyncCodeResolver {
	
		private ioHost        : IIO;
		
		
		
		private queue_open    : string[];
		
		private queue_close   : string[];
		
		private resolved      : IResolvedFile [];
		
		constructor( ioHost:IIO ) {
		
			this.ioHost       = ioHost;
			
			this.queue_open   = [];
			
			this.queue_close  = [];
			
			this.resolved     = [];
		}
		
		
		public walk(root:string, callback: {( resolved:IResolvedFile[]): void; }) : void {
			
			// queue stuff
			
			var filename = this.queue_open.pop();
			
			this.queue_close.push(filename);
			
			console.log(filename);
			
			// resolve file content...
			
			var code        = this.ioHost.readFile(filename);
			
			var snapshot    = TypeScript.ScriptSnapshot.fromString( code );
			
			var references  = TypeScript.getReferencedFiles(filename, snapshot);	
			
			// push references on the queue to be looked up...
			
			for(var n in references) {  
				 
				console.log('      ' + references[n].path);
				 
				 
				this.queue_open.push( references[n].path ); // push reference path on queue...
						 
			}
            
			if(this.queue_open.length > 0) {
			
				this.walk(root, callback);
			
			} else {
			
				callback(this.resolved);
			}
			 		
		}
		
		public resolve(sources:string[], callback: {( resolved:IResolvedFile[]): void; }) : void{
			
			var root = this.ioHost.dirName(sources[0]);
			
			this.queue_open = [ sources[0] ];
			
			this.walk(root, callback);
			
			// todo: implement resolver, return files.
			//for(var n in this.sources) {
			//	var code       = this.ioHost.readFile(this.sources[n]);
			//	var snapshot   = TypeScript.ScriptSnapshot.fromString( code );
			//	var references = TypeScript.getReferencedFiles(this.sources[n], snapshot);
			//	console.log(references);
			//	for(var m in references) {
			//		
			//	}
			//}	

			 
		
		}
		
	}

}

