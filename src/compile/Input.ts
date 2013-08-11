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
/// <reference path="../resolve/Topology.ts" />

module TypeScript.Api {

    // Input: Basically A front side source cacher, 
    // compiled units are pushed into this
    // class, and this class maintains 
    // a internal collection of units to
    // be submitted to the processor for
    // compilation.

    export class Input {
    
        public units: TypeScript.Api.SourceUnit[];

        constructor() {
        
            this.units = [];

        }

        /** compares two source units to 
        *   see if they match.
        */ 
        private same (a:TypeScript.Api.SourceUnit, b:TypeScript.Api.SourceUnit) : boolean {
        
            if(a.content.length == b.content.length) {

			    if(a.content == b.content) {

				    return true;
			    }
            }

            return false;
        }

        /** fetches a local source unit
        *   based on the the path.
        */
        public fetch(path:string) : TypeScript.Api.SourceUnit {
        
            for(var i = 0; i < this.units.length; i++) {
                
                if(this.units[i].path == path) {
                
                    return this.units[i];
                }
            }

            return null;
        }


        /** merges incoming source units with those 
         *  within the cache. detects inserts, updates
        *   and deletes, and flags them on state ready for
        *   processing.
        */
        public merge(units:TypeScript.Api.SourceUnit[]) : void {

            // compute delete state.
            this.units.map((local) => {

                for(var i = 0; i < units.length; i++) {

                    if(units[i].path == local.path) {

                        return;
                    }
                }

                local.state = 'deleted'

                return false;
            }); 

            // scan for additions and updates.
            for(var i = 0; i < units.length; i++) {
                
                var local = this.fetch(units[i].path) 
                
                if(local) 
                {    
                    if(!this.same(local, units[i])) { 

                        local.state   = 'updated';

                        local.content = units[i].content;

                        local.path    = units[i].path;

                        local.remote  = units[i].remote;
                    }
                    else
                    {
                        local.state = 'same';
                    }                
                } 
                else
                {
                    units[i].state = 'added';

                    this.units.push(units[i]);
                }
            }

            // remove and sort deleted units.

            var sorted = [];

            for(var n in units) {
            
                for(var m in this.units) {
                
                    if(this.units[m].path == units[n].path) {
                        
                        if(this.units[m].state != 'deleted') {
                        
                            sorted.push(this.units[m]);
                        }

                        break;
                    }
                }
            }

            this.units = sorted;
        }
    }
}