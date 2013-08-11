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

/// <reference path="../reflect/Script.ts" />

module TypeScript.Api {

    // Output: basically the a TypeScript Emitter. 
    // when the calls to the compiler are made to
    // emit, they end up here.

    export class Output {

        public files: string[];

        public mapper: any[];

        constructor() {
            this.files=[];

            this.mapper=[];
        }

        public javascript_filenames(): string[] {

            var result=[];

            for(var n in this.mapper) {

                result.push(n);
            }
            return result;
        }

        public writeFile(fileName: string,contents: string,writeByteOrderMark: boolean): void {

            this.files[fileName]=contents;

            return this.files[fileName];
        }

        public directoryExists(path: string): boolean {

            return true;
        }

        public fileExists(path: string): boolean {

            return true;
        }

        public resolvePath(path: string): string {

            return '/';
        }

        public get_content(path: string): string {

            path=path.replace(/\\/g,'/').replace(/.ts$/,'.js');

            for(var filename in this.files) {

                if(filename.replace(/\\/g,'/')==path) {

                    return this.files[filename];
                }
            }

            return null;
        }

        public get_declararion(path: string): string {

            path=path.replace(/\\/g,'/').replace(/.ts$/,'.d.ts');

            for(var filename in this.files) {

                if(filename.replace(/\\/g,'/')==path) {

                    return this.files[filename];
                }
            }

            return null;
        }

        public get_source_map(path: string): string {

            path=path.replace(/\\/g,'/').replace(/.ts$/,'.js.map');

            for(var filename in this.files) {

                if(filename.replace(/\\/g,'/')==path) {

                    return this.files[filename];
                }
            }

            return null;
        }

        public get_reflection(path: string,ast: TypeScript.Script): TypeScript.Api.Script {

            return TypeScript.Api.Script.create(path,ast);
        }
    }
}
