// Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
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
/// <reference path="../reflect/Script.ts" />
/// <reference path="Diagnostic.ts" />
/// <reference path="Unit.ts" />

module TypeScript.Api 
{
	export class CompiledUnit extends TypeScript.Api.Unit
	{
		public ast         : TypeScript.AST;

        public sourcemap   : string;

        public references  : string [];

        public script      : TypeScript.Api.Script;

        public state       : string;

		constructor(path        : string, 
                    content     : string, 
                    diagnostics : TypeScript.Api.Diagnostic[], 
                    ast         : TypeScript.AST,
                    sourcemap   : string, 
                    script      : TypeScript.Api.Script,
                    references  : string[]) 
		{
			super(path, content, diagnostics);

            this.state       = 'default';

			this.ast         = ast;

            this.sourcemap   = sourcemap;

            this.script      = script;

            this.references  = references;
		}
	}
}