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

module TypeScript.Api.IO 
{	
    export class IOFileError
    {
        public text    :string;
        public message :string;

        constructor(text:string, message:string) {
            this.text    = text;
            this.message = message;
        }
    }

	export class IOFile
	{
        public path    : string;
        public content : string;
        public errors  : IOFileError[];
        public remote  : boolean;

        constructor(path:string, content:string, errors : IOFileError[], remote:boolean)
        {
            this.path    = path;
            this.content = content;
            this.errors  = errors;
            this.remote  = remote;
        }
	}
}