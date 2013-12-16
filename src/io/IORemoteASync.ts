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
/// <reference path="IIO.ts" />
/// <reference path="Buffer.ts" />
/// <reference path="IOFile.ts" />

module TypeScript.Api {

    export class IORemoteAsync implements IIO {

        public readFile(path: string,callback: { (iofile: TypeScript.Api.IOFile): void; }): void {

            if(this.isUrl(path)) {

                this.readFileFromHttp(path,callback);

                return;
            }

            this.readFileFromDisk(path,callback);
        }

        private readFileFromDisk(path: string,callback: { (iofile: TypeScript.Api.IOFile): void; }): void {

            node.fs.readFile(path,(error,data) => {

                if(error) {

                    var text="could not resolve source unit.";
                    var message = "could not resolve source unit " + path + ".";

                    callback(new TypeScript.Api.IOFile(path, null, [new TypeScript.Api.IOFileError(text, message)],false));
                }
                else {

                    callback(new TypeScript.Api.IOFile(path,TypeScript.Api.Buffer.process(data),[],false));
                }
            });
        }

        private readFileFromHttp(path: string,callback: { (iofile: TypeScript.Api.IOFile): void; }): void {

            var url=node.url.parse(path);

            var protocol=node.http;

            var options={ host: url.host,port: url.port,path: url.path,method: 'GET' };

            if(this.isHTTPS(path)) {

                protocol=node.https;

                options.port=443;
            }

            var request=protocol.request(options,(response) => {

                var data=[];

                response.on('data',(chunk) => {

                    data.push(chunk);
                });

                response.on('end',() => {

                    callback(new TypeScript.Api.IOFile(path,TypeScript.Api.Buffer.process(data.join('')),[],true));
                });
            });

            request.on('error',(error) => {
                var text="could not resolve source unit.";
                var message="could not resolve source unit "+path+".";

                callback(new TypeScript.Api.IOFile(path, null, [new TypeScript.Api.IOFileError(text, message)],true));
            });

            request.end();
        }

        private isHTTPS(path: string): boolean {

            if(path.indexOf('https://')==0) {

                return true;
            }

            return false;
        }

        private isUrl(path: string): boolean {

            var regex=new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp[s]?:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

            return regex.test(path);
        }
    }
}