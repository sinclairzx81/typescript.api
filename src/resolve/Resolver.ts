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
/// <reference path="../util/Path.ts" />
/// <reference path="../io/IIO.ts" />

module TypeScript.Api.Resolve 
{	
    export class UnitTopology
    {
        // based on the supplied source units, this method will attempt
        // a best guess topological sort. If cyclic references occur,
        // will return units as is.  
        public static sort(units: TypeScript.Api.Units.SourceUnit[]) :  TypeScript.Api.Units.SourceUnit[]
        {
            var queue:TypeScript.Api.Units.SourceUnit[]  = [];

            var result:TypeScript.Api.Units.SourceUnit[] = [];

            var max_iterations = units.length * units.length;

            var iteration = 0;

            for(var n in units) 
            {
                queue.push(units[n]);
            }

            while(queue.length > 0)
            {
                var item = queue.shift();

                var resolved   = true;

                var references = item.references();

                for(var n in references)
                {
                    var reference = Util.Path.relativeToAbsolute(item.path, references[n]);
                    
                    var unit = null;

                    for(var m in result) // search for reference in result.
                    {
                        if(result[m].path == reference)
                        {
                            unit = result[m];

                            break;
                        }
                    }

                    if(unit == null)
                    {
                        resolved = false;

                        break;
                    }
                }
                
                if(resolved)
                {
                    // if resolved, add to the result.
                    result.push(item)
                }
                else
                {
                    // if not resolved, put it back on the queue.
                    queue.push(item);
                }

                // increment the iteration,
                iteration = iteration + 1;
                
                // if we exceed the max iterations, then we have cyclic referencing.
                if(iteration > max_iterations)
                {
                    // best guess based on traveral.
                    units.reverse();
                    
                    return units;
                }
            }
            
            return result;
        }
    }


	export class LoadParameter 
	{
		public parent_filename  : string;

		public filename         : string;

		constructor(parent_filename:string, filename:string) 
		{
			this.parent_filename = parent_filename;

			this.filename = Util.Path.relativeToAbsolute(parent_filename, filename); 
		} 
	} 

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

		public resolve(sources:string[], callback: {( units:TypeScript.Api.Units.SourceUnit[] ): void; }) : void 
		{
			for(var n in sources)  
			{
				var parameter = new TypeScript.Api.Resolve.LoadParameter( process.mainModule.filename, sources[n] );

				this.pending.push(parameter);
			}

			this.load ( callback );
		}	

		private load (callback: {( unit : TypeScript.Api.Units.SourceUnit[]): void; }) : void  
		{
			var parameter = this.pending.pop();

			if( !this.visited(parameter) )  
			{
				this.closed.push(parameter);

				this.io.readFile(parameter.filename, (unit : TypeScript.Api.Units.SourceUnit) =>  
				{				
					if(unit.diagnostics.length == 0)  
					{
						for(var n in unit.references() )  
						{
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

				return;
			} 

			this.units = UnitTopology.sort(this.units);

			callback( this.units );
		}

		private visited (parameter : TypeScript.Api.Resolve.LoadParameter) : boolean 
		{
			for(var n in this.closed) 
			{
				if(this.closed[n].filename == parameter.filename) 
				{
					return true;
				}
			}
			return false;
		}		
	}
}