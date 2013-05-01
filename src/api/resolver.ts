/// <reference path='../compiler/typescript.ts'/>
/// <reference path='../compiler/io.ts'/>
/// <reference path='ioasync.ts' />
/// <reference path='path.ts' />

module TypeScript.Api {
	
	class LoadParameter {
	
		public parent_filename  : string;
		
		public filename			: string;
		
		constructor(parent_filename:string, filename:string) {
		
			this.parent_filename = parent_filename;
			
			this.filename 		 = Path.relativeToAbsolute(parent_filename, filename); 
		} 
	} 
	
	export class CodeResolver {
		
		private io          : TypeScript.Api.IIOAsync;
		private pending     : LoadParameter       [];
		private closed      : LoadParameter       [];		
		private resolved    : ResolvedFile 		  [];
	 
		constructor( io : TypeScript.Api.IIOAsync) {  
			this.io		  	  = io;
			this.pending      = [];
			this.closed  	  = [];
			this.resolved     = [];
		}
		
		private format_reference(reference:IFileReference):IFileReference {
			var path = reference.path;
			
			path = path.replace('\\', '/');
			
			if(path.indexOf('http:/') == 0){
				if(!(path.indexOf('http://') == 0)) {
					path = path.replace('http:/', 'http://');
				}
			}
			
			if(path.indexOf('https:/') == 0){
				if(!(path.indexOf('https://') == 0)) {
					path = path.replace('https:/', 'https://');
				}
			}
			reference.path = path;
			
			return reference;
		}
		
		private load (callback: {( file:ResolvedFile[]): void; }) : void {
			
			var op = this.pending.pop();
			
			console.log('[loading] ' + op.filename);
			
			if(!this.visited(op)) {
				
				this.closed.push(op);
				
				this.io.readFile(op.filename, (file:ResolvedFile) => {
				
					this.resolved.push(file);
					
					if(file.error) {
					
						console.log("[error] cannot load " + file.path);
						
						return;
					}
					
					var snapshot    = TypeScript.ScriptSnapshot.fromString( file.content );	
					
					var references  = TypeScript.getReferencedFiles( file.path, snapshot );
					
					for(var n in references) {
					
						references[n] = this.format_reference(references[n]);
						
						this.pending.unshift( new LoadParameter( file.path, references[n].path ) );
					}
					
					// if there are more items on the queue, keep walking..
					this.next(callback);
					
				});
			} else {
				// if there are more items on the queue, keep walking..
				this.next(callback);
			}			
		}
		
		private visited (op:LoadParameter) : boolean {
		
			for(var n in this.closed) {
			
				if(this.closed[n].filename == op.filename) {
				
					return true;
				}
			}
			return false;
		}	
		
		private next (callback) : void { 
		
			if(this.pending.length > 0) {
			
				this.load ( callback );
				
			} else {
			
				callback( this.resolved );
			}			
		}
		
		public resolve(source, callback: {( resolved:ResolvedFile[]): void; }) : void {
		
			var op = new LoadParameter( global.process.mainModule.filename, "./test/program.ts" );
			
			this.pending = [ op ];
			
			this.load ( callback );
		}
		
	}

}

