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

module TypeScript.Api {

    export class Path {

        public static isAbsoluteUrl(path: string): boolean {

            var regex=new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp[s]?:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?")
			
			return regex.test(path)
		}

        public static isAbsoluteUrn(path: string): boolean {

            var regex=new RegExp("^(?:[a-xA-Z]:(/|\))|(?:file://)")
			
			return regex.test(path)
		}

        public static isRootRelative(path: string): boolean {

			return path.indexOf('/')==0&&path.indexOf('//')!=0
		}


        public static isRelative(path: string): boolean {

            if(!Path.isAbsoluteUrl(path)) {

                if(!Path.isAbsoluteUrn(path)) {

                    if(!(path.indexOf('/')==0)) {

						return true
					}
                }
            }
            return false;
        }

        public static toAbsolute(path:string) : string {
            
            return TypeScript.Api.Path.toForwardSlashes( node.path.resolve(path) );
        }

        public static toForwardSlashes(path: string): string {

			return path.replace(/\\/g,'/')
		}

        public static relativeToAbsolute(absolute_parent_path: string,relative_path: string): string {

            if(Path.isRelative(relative_path)) {

                var absolute_parent_directory=node.path.dirname(absolute_parent_path);

                return node.path.join(absolute_parent_directory,relative_path);
            }

            return TypeScript.Api.Path.toForwardSlashes(relative_path);
        }
    }
}