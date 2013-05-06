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

/// <reference path="textwriter.ts" />

module TypeScript.Api {

	///////////////////////////////////////////////////////////////////////
	// IEmitter: Interface for emitting files.
	///////////////////////////////////////////////////////////////////////	
	
	export interface IEmitter {
		directoryExists(path: string) : boolean;
		fileExists     (path: string) : boolean;
		resolvePath    (path: string) : string;
		createFile     (path: string, useUTF8?: boolean): ITextWriter;
	}
	
	///////////////////////////////////////////////////////////////////////
	// Emitter: Compiler uses this to emit files.
	///////////////////////////////////////////////////////////////////////		
	
	export class Emitter implements IEmitter {
		
		public files : ITextWriter[];
		
		constructor() {
			
			this.files = [];
		}
		
		public createFile(path: string, useUTF8?: boolean): ITextWriter {
		
			this.files[path] = new TypeScript.Api.TextWriter();
			
			return this.files[path];
			
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

	}
	 
}