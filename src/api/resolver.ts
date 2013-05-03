//?
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
//

/// <reference path='decl/typescript.d.ts' />
/// <reference path="diagnostics.ts" />
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
		private diagnostics : Diagnostic          [];
	 
		constructor( io:TypeScript.Api.IIOAsync, logger:TypeScript.ILogger ) {  
			this.io		  	  = io;
			this.logger       = logger;
			this.pending      = [];
			this.closed  	  = [];
			this.units        = [];
			this.diagnostics  = []; // todo: implement this.....
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
						this.logger.log("[error] cannot resolve " + file.path);
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
				this.units.reverse();
				callback( this.units );
			}			
		}
	}
	
	

}

