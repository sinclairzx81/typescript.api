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

/// <reference path="../util/Path.ts" />
/// <reference path="../io/IIO.ts" />
/// <reference path="../io/IOFile.ts" />
/// <reference path="Topology.ts" />

module TypeScript.Api {

    export class LoadParameter {

        public parent_filename : string;

        public filename        : string;

        constructor(parent_filename: string, filename: string) {

            this.parent_filename = parent_filename;

            this.filename = TypeScript.Api.Path.relativeToAbsolute(parent_filename, filename);
        }
    }

    export class Resolver {

        private pending : TypeScript.Api.LoadParameter[];

        private closed  : TypeScript.Api.LoadParameter[];

        private units   : TypeScript.Api.SourceUnit[];

        constructor(public io: TypeScript.Api.IIO) {

            this.pending = [];

            this.closed  = [];

            this.units   = [];
        }

        public resolve(sources: string[],callback: { (units: TypeScript.Api.SourceUnit[]): void; }): void {

            for(var n in sources) {

                var parameter = new TypeScript.Api.LoadParameter(process.mainModule.filename,sources[n]);

                this.pending.push(parameter);
            }

            this.load(callback);
        }

        private load(callback: { (unit: TypeScript.Api.SourceUnit[]): void; }): void {
            
            var parameter = this.pending.pop();

            if(!this.visited(parameter)) {

                this.closed.push(parameter);

                var parent_filename=parameter.parent_filename;

                this.io.readFile(parameter.filename,(iofile: TypeScript.Api.IOFile) => {
                    
                    // create unit from iofile.

                    var unit = new TypeScript.Api.SourceUnit(iofile.path,iofile.content,[],iofile.remote);

                    if(iofile.errors.length > 0) {

                        for(var n in iofile.errors) {

                            var error = iofile.errors[n];

                            var diagnostic = new TypeScript.Api.Diagnostic("resolve", parent_filename, error.text, error.message);

                            unit.diagnostics.push(diagnostic);
                        }
                    }

                    // if no errors..

                    if(unit.diagnostics.length == 0) {

                        for(var n in unit.references()) {

                            var parameter = new TypeScript.Api.LoadParameter(unit.path,unit.references()[n]);

                            this.pending.push(parameter);
                        }
                    }

                    // convert path to forward slashes

                    unit.path = TypeScript.Api.Path.toForwardSlashes(unit.path);

                    // push unit on resolved.

                    this.units.push(unit);

                    this.next(callback);

                });
            }
            else {

                this.next(callback);
            }
        }

        private next(callback): void {

            if(this.pending.length > 0) {

                this.load(callback);

                return;
            }

            this.units = TypeScript.Api.Topology.sort(this.units);

            callback(this.units);
        }

        private visited(parameter: TypeScript.Api.LoadParameter): boolean {

            for(var n in this.closed) {

                if(this.closed[n].filename==parameter.filename) {

                    return true;
                }
            }
            return false;
        }
    }
}