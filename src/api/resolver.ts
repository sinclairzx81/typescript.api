/// <reference path='../compiler/typescript.ts'/>
/// <reference path='../compiler/io.ts'/>

module TypeScript.Api {

	export class ResolvedFile implements IResolvedFile {
	
		content : string;
		
		path    : string;
		
		exists  : boolean;
	}
	
	export class Resolver {
	
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
		
		
		public walk(callback: {( resolved:IResolvedFile[]): void; }) : void {
			
			var filename = this.queue_open.pop();
			
			this.queue_close.push(filename);
			
			var code        = this.ioHost.readFile(filename);
			
			var snapshot    = TypeScript.ScriptSnapshot.fromString( code );
			
			var references  = TypeScript.getReferencedFiles(filename, snapshot);	
			
			for(var n in references) {  
				
				this.queue_open.push( references[n].path ); // push reference path on queue...
						 
			}
            
			if(this.queue_open.length > 0) {
			
				this.walk(callback);
			
			} else {
			
				callback(this.resolved);
			}
			 		
		}
		
		public resolve(sources:string[], callback: {( resolved:IResolvedFile[]): void; }) : void{
			
			this.queue_open = sources;
			
			this.walk(callback);
			
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

