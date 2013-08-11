/*--------------------------------------------------------------------------

Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

--------------------------------------------------------------------------*/

/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../util/Path.ts" />

module TypeScript.Api {
    	
	export class Node {

		public path		  : string;

		public references : string[];

		constructor() {
			
			this.references = [];
		}
	}

    export class Topology {

		// returns a dependancy graph. all paths are resolved to absolute....
        public static graph(units: TypeScript.Api.SourceUnit[]) :  TypeScript.Api.Node [] {
			
			var nodes:TypeScript.Api.Node [] = [];

            for(var n in units) {	

				var node = new TypeScript.Api.Node();
				
				node.path = units[n].path;

				node.references = units[n].references();

				for(var m in node.references)
				{
					node.references[m] = TypeScript.Api.Path.relativeToAbsolute(node.path, node.references[m]);

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
        public static sort(units: TypeScript.Api.SourceUnit[]) :  TypeScript.Api.SourceUnit[] {

            var queue:TypeScript.Api.SourceUnit[]  = [];

            var result:TypeScript.Api.SourceUnit[] = [];

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

                for(var n in references) {

                    var reference = TypeScript.Api.Path.relativeToAbsolute(item.path, references[n]);
                    
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
                if(iteration > max_iterations) {

                    // best guess based on traveral.
                    units.reverse();
                    
                    return units;
                }
            }

            // ensure declarations are first.

            var declarations = [];

            var sources      = [];
            
            for(var i = 0; i < result.length; i++) {
                
                if(result[i].path.indexOf('.d.ts') !== -1) {
                     
                    declarations.push(result[i]);
                }
                else {

                    sources.push(result[i]);
                }
            }

            result = [];

            for(var n in declarations) {
                
                result.push(declarations[n])
            }

            for(var n in sources) {
                
                result.push(sources[n])
            }

            return result;
        }
    }
}