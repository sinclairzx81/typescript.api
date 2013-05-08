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
/// <reference path="Method.ts" />
/// <reference path="Variable.ts" />

module TypeScript.Api.Reflect 
{
	export class Interface 
	{
		public methods    : Method    [];

		public variables  : Variable  [];

		public parameters : string    [];

		public extends    : string    [];

		public name       : string;
		
		constructor () 
		{
			this.methods    = [];

			this.variables  = [];

			this.extends    = [];

			this.parameters = [];
		}
		
		public static create(ast:TypeScript.InterfaceDeclaration): Interface 
		{
			var result  = new Interface();
			
			result.name = ast.name.text;
            
			if(ast.typeParameters)
			{
				if (ast.typeParameters.members) 
				{
					for(var n in ast.typeParameters.members) 
					{ 
						result.parameters.push(ast.typeParameters.members[n].name.text);
					}
				}
			}
			
			if (ast.extendsList) 
			{
				if (ast.extendsList.members) 
				{
					for(var n in ast.extendsList.members) 
					{ 
						var named_decl = <TypeScript.NamedDeclaration>ast.extendsList.members[n];
						
						result.extends.push( named_decl.text );
					}
				}
			}
			return result;
		}
	}
}