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

/// <reference path="../references.ts" />
/// <reference path="Buffer.ts" />
/// <reference path="IIO.ts" />
/// <reference path="IOFile.ts" />

module TypeScript.Api {

    export class IOAsync implements TypeScript.Api.IIO {

        public readFile(path: string,callback: { (iofile: TypeScript.Api.IOFile): void; }): void {

            node.fs.readFile(path,(error,data) => {

                if(error) {

                    var text="could not resolve source unit.";

                    var message="could not resolve source unit "+path+".";

                    var error=new TypeScript.Api.IOFileError(text,message);

                    callback(new TypeScript.Api.IOFile(path,null,[error],false));
                }
                else {

                    callback(new TypeScript.Api.IOFile(path,TypeScript.Api.Buffer.process(data),[],false));
                }
            });
        }
    }
}