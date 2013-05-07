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
/// <reference path="Import.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Class.ts" />
/// <reference path="Method.ts" />
/// <reference path="Variable.ts" />

module TypeScript.Api.Reflect 
{
	
	export class Module 
	{
		public imports    : Import    [];
		public modules    : Module    [];
		public interfaces : Interface [];
		public classes    : Class     [];
		public methods    : Method    [];
		public variables  : Variable  [];
		public name       : string;

		constructor () {
			this.imports    = [];
			this.modules    = [];
			this.interfaces = [];
			this.classes    = [];
			this.methods    = [];
			this.variables  = [];
		}

		public static create (ast:TypeScript.ModuleDeclaration) : Module 
		{
			var result   = new Module();
			
			result.name  = ast.prettyName;	
			
			return result;
		}
	}
	
}