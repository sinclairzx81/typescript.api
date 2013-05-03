// Acid Frameworks.  All rights reserved.
// 
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

/// <reference path='decl/typescript.d.ts' />

module TypeScript.Api {
	
	///////////////////////////////////////////////////////////////////////
	// SourceUnit : Return object for the CodeResolver.
	///////////////////////////////////////////////////////////////////////		
	export class SourceUnit implements IResolvedFile {
		public content    : string;
		public path       : string;
		public remote     : boolean;
		public error      : string;
		public references : string[];
		
		public load_references() : void {
			this.references = [];
			var lines :string[] = this.content.split('\r\n');
			if (lines.length === 1) {
				lines = this.content.split('\n');
			}
			for(var n in lines) {
				var reference_pattern = /^(\/\/\/\s*<reference\s+path=)('|")(.+?)\2\s*(static=('|")(.+?)\2\s*)*\/>/gim;
				var match = reference_pattern.exec(lines[n]);
				if(match) {
					this.references.unshift( match[3] );
				}
			}
		}
	}
}