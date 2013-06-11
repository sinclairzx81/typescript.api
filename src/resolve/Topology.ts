// Copyright (c) sinclair 2013.  All rights reserved.
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

module TypeScript.Api.Resolve 
{	
	export class Node
	{
		public path		  : string;

		public references : string[];

		constructor() {
			
			this.references = [];
		}
	}

    export class Topology
    {
		// returns a dependancy graph. all paths are resolved to absolute....
        public static graph(units: TypeScript.Api.Units.SourceUnit[]) :  TypeScript.Api.Resolve.Node [] {
			
			var nodes:TypeScript.Api.Resolve.Node [] = [];

            for(var n in units) 
			{	
				var node = new TypeScript.Api.Resolve.Node();
				
				node.path = units[n].path;

				node.references = units[n].references();

				for(var m in node.references)
				{
					node.references[m] = Util.Path.relativeToAbsolute(node.path, node.references[m]);

					node.references[m] = node.references[m].replace(/\\/g, '/');
				}

				node.path = node.path.replace(/\\/g, '/');

				nodes.push(node);
            }

			return nodes;
        }


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

}