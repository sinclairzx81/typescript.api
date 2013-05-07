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

module TypeScript.Api.Reflect 
{
	
	export class Parameter 
	{
		public id 		  : string;
		public name		  : string;
		public type		  : Type;

		public static create(ast:TypeScript.Parameter) : Parameter 
		{
			var result   = new Parameter();
			
			result.name  = ast.id.text;

			if(!ast.typeExpr) 
			{ 
				result.type  	 = new Type();
				
				result.type.name = "any";
			} 
			
			return result;
		}   
	}
	
}