/// <reference path='decl/typescript.d.ts' />
/// <reference path='logger.ts' />
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
		private logger      : TypeScript.ILogger;
		private pending     : LoadParameter       [];
		private closed      : LoadParameter       [];	
		private resolved    : ResolvedFile 		  [];
	 
		constructor( io:TypeScript.Api.IIOAsync, logger:TypeScript.ILogger ) {  
			this.io		  	  = io;
			this.logger       = logger;
			this.pending      = [];
			this.closed  	  = [];
			this.resolved     = [];
			
		}
		
		public resolve(sources:string[], callback: {( resolved:ResolvedFile[]): void; }) : void {
			
			for(var n in sources) {
				var op = new LoadParameter( process.mainModule.filename, sources[n] );
				this.pending.push(op);
			}
			
			
			this.load ( callback );
		}		
		
		// load - all the action happens here...
		private load (callback: {( file:ResolvedFile[]): void; }) : void {
			
			var op = this.pending.pop();
			this.logger.log('[resolving] ' + op.filename);
			
			if(!this.visited(op)) {
			
				this.closed.push(op);
				
				this.io.readFile(op.filename, (file:ResolvedFile) => {
					
					if(file.error) {
					
						this.logger.log("[error] cannot load " + file.path);
						
						return;
					}
					
					var references = this.get_references(file);
					
					for(var n in references) {
					
						var parameter = new LoadParameter( file.path, references[n] );
						
						this.pending.push( parameter );						
						
						// push references on the file....
						file.references.push( Path.relativeToAbsolute(file.path, references[n] ) );
					}
					
					this.resolved.push(file);
					
					this.next(callback);
					
				});
			} else {
			
				this.next(callback);
			}			
		}
		
		private get_references(file:ResolvedFile): string[] {
			var result:string[] = [];
			var lines :string[] = file.content.split('\r\n');
			if (lines.length === 1) {
				lines = file.content.split('\n');
			}
			for(var n in lines) {
				var reference_pattern = /^(\/\/\/\s*<reference\s+path=)('|")(.+?)\2\s*(static=('|")(.+?)\2\s*)*\/>/gim;
				//var implicit_import_pattern = /^(\/\/\/\s*<implicit-import\s*)*\/>/gim;
				//var is_no_default_lib_pattern = /^(\/\/\/\s*<reference\s+no-default-lib=)('|")(.+?)\2\s*\/>/gim;	
				var match = reference_pattern.exec(lines[n]);
				if(match) {
					result.unshift( match[3] );
				}
			}
			return result;
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
	}

}

