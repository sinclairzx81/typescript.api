/// <reference path='decl/typescript.d.ts' />
/// <reference path='logger.ts' />
/// <reference path='unit.ts' />
/// <reference path='path.ts' />
/// <reference path='io.ts' />

module TypeScript.Api {
	
	///////////////////////////////////////////////////////////////////////
	// LoadParameter : Response object for IIOAsync
	///////////////////////////////////////////////////////////////////////		
	class LoadParameter {
		public parent_filename  : string;
		public filename         : string;
		constructor(parent_filename:string, filename:string) {
			this.parent_filename = parent_filename;
			this.filename 		 = Path.relativeToAbsolute(parent_filename, filename); 
		} 
	} 
	
	///////////////////////////////////////////////////////////////////////
	// CodeResolver : Resolves source files and returns units.
	///////////////////////////////////////////////////////////////////////		
	export class CodeResolver {
		private io          : TypeScript.Api.IIOAsync;
		private logger      : TypeScript.ILogger;
		private pending     : LoadParameter       [];
		private closed      : LoadParameter       [];	
		private units       : SourceUnit 		  [];
	 
		constructor( io:TypeScript.Api.IIOAsync, logger:TypeScript.ILogger ) {  
			this.io		  	  = io;
			this.logger       = logger;
			this.pending      = [];
			this.closed  	  = [];
			this.units        = [];
		}
		
		// resolves source files...
		public resolve(sources:string[], callback: {( units:SourceUnit[]): void; }) : void {
			for(var n in sources) {
				var op = new LoadParameter( process.mainModule.filename, sources[n] );
				this.pending.push(op);
			}
			this.load ( callback );
		}		
		
		// load - all the action happens here...
		private load (callback: {( unit:SourceUnit[]): void; }) : void {
			var op = this.pending.pop();
			this.logger.log('[resolving] ' + op.filename);
			if(!this.visited(op)) {
				this.closed.push(op);
				this.io.readFile(op.filename, (file:ResolvedFile) => {
					if(file.error) {
						this.logger.log("[error] cannot load " + file.path);
						return;
					}
					var unit = new SourceUnit();
					unit.content    = file.content;
					unit.path       = file.path;
					unit.remote     = file.remote;
					unit.error      = file.error;
					unit.load_references();
					
					for(var n in unit.references) {
						var parameter = new LoadParameter( file.path, unit.references[n] );
						this.pending.push( parameter );
					}
					this.units.push(unit);
					this.next(callback);
				});
			} else {
				this.next(callback);
			}			
		}
		
		// checks to see if this file has been loaded...
		private visited (op:LoadParameter) : boolean {
			for(var n in this.closed) {
				if(this.closed[n].filename == op.filename) {
					return true;
				}
			}
			return false;
		}	
		// next or callback..
		private next (callback) : void { 
			if(this.pending.length > 0) {
				this.load ( callback );
			} else {
				callback( this.units );
			}			
		}
	}
	
	

}

