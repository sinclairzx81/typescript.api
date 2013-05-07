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
/// <reference path="Parameter.ts" />
/// <reference path="Type.ts" />

module TypeScript.Api.Reflect 
{	
	
	export class Method 
	{
		public id 		  : string;
		public parameters : Parameter[];
		public name       : string;
		public returns    : Type;

		constructor () 
		{
			this.parameters = [];
		}

		public static create(ast:TypeScript.FunctionDeclaration) : Method  
		{
			var result = new Method();
			
			result.name = ast.getNameText();
			
			if(ast.returnTypeAnnotation) 
			{
				result.returns = Type.create(<TypeScript.TypeReference>ast.returnTypeAnnotation);		
			}		
			
			return result;
		}
	}
	
}