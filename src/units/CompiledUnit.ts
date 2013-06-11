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

/// <reference path="../decl/typescript.d.ts" />
/// <reference path="Diagnostic.ts" />
/// <reference path="Unit.ts" />

module TypeScript.Api.Units 
{
	export class CompiledUnit extends Unit
	{
		public ast         : TypeScript.AST;
        
        public declaration : string;

		constructor(path:string, content:string, diagnostics : TypeScript.Api.Units.Diagnostic[], ast:TypeScript.AST, declaration:string) 
		{
			super(path, content, diagnostics);

			this.ast = ast;

            this.declaration = declaration;
		}

        // note: references resolved on declarations.
		public references() : string [] 
		{
			var result : string[] = [];

			if(this.declaration) 
			{
				var lines : string[] = this.declaration.split('\r\n');
                
				if (lines.length === 1) 
				{
					lines = this.declaration.split('\n');
				}
                
				for(var n in lines) 
				{
					var reference_pattern = /^(\/\/\/\s*<reference\s+path=)('|")(.+?)\2\s*(static=('|")(.+?)\2\s*)*\/>/gim;

					var match = reference_pattern.exec(lines[n]);

					if(match) 
					{
						result.unshift( match[3] );
					}
				}
			}
			return result;
		}
	}
}