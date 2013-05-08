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

/// <reference path="../decl/typescript.d.ts" />
/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../io/IIO.ts" />
/// <reference path="LoadParameter.ts" />

module TypeScript.Api.Resolve 
{	
	export class Resolver 
	{
		private pending     : TypeScript.Api.Resolve.LoadParameter  [];
		
		private closed      : TypeScript.Api.Resolve.LoadParameter  [];
		
		private units       : TypeScript.Api.Units.SourceUnit [];
		
		constructor( public io : TypeScript.Api.IO.IIO, public logger : TypeScript.ILogger ) 
		{
			this.pending      = [];

			this.closed  	  = [];

			this.units        = [];
		}
		
		public resolve(sources:string[], callback: {( units:TypeScript.Api.Units.SourceUnit[] ): void; }) : void {

			for(var n in sources)  {

				var parameter = new TypeScript.Api.Resolve.LoadParameter( process.mainModule.filename, sources[n] );
				
				this.pending.push(parameter);
			}
			
			this.load ( callback );
		}	
		
		private load (callback: {( unit : TypeScript.Api.Units.SourceUnit[]): void; }) : void  {

			var parameter = this.pending.pop();
			
			if( !this.visited(parameter) )  {

				this.closed.push(parameter);
				
				this.io.readFile(parameter.filename, (unit : TypeScript.Api.Units.SourceUnit) =>  {
                    					
					if(unit.diagnostics.length == 0)  {

						for(var n in unit.references() )  {

							var parameter = new TypeScript.Api.Resolve.LoadParameter( unit.path, unit.references() [n] );
							
							this.pending.push( parameter );
						}
					}
					
					this.units.push(unit);
					
					this.next(callback);
					
				});
				
			} 
			else 
			{
				this.next(callback);
			}			
		}
		
		private next (callback) : void 
		{ 
			if(this.pending.length > 0) 
			{
				this.load ( callback );
				
			} 
			else 
			{
				this.units.reverse();
				
				callback( this.units );
			}			
		}
		
		private visited (parameter : TypeScript.Api.Resolve.LoadParameter) : boolean 
		{
			for(var n in this.closed) {

				if(this.closed[n].filename == parameter.filename) {

					return true;
				}
			}
			
			return false;
		}		
	}
}