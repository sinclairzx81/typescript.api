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
/// <reference path="Method.ts" />
/// <reference path="Variable.ts" />
/// <reference path="Type.ts" />

module TypeScript.Api.Reflect 
{
	export class Interface 
	{
		public methods    : Method    [];

		public variables  : Variable  [];

		public parameters : string    [];

		public extends    : Type      [];

		public name       : string;

		public limChar    : number;

		public minChar    : number;

		constructor () 
		{
			this.methods    = [];

			this.variables  = [];

			this.extends    = [];

			this.parameters = [];
		}

		private static load_parameters(result:Interface, ast:TypeScript.InterfaceDeclaration): void 
		{
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
		}

		private static load_extends (result:Interface, ast:TypeScript.InterfaceDeclaration) : void 
		{
			if (ast.extendsList) 
			{
				if (ast.extendsList.members) 
				{
					for(var n in ast.extendsList.members) 
					{ 
						var obj = TypeScript.Api.Reflect.Type.create( ast.extendsList.members[n] );

						result.extends.push( obj );
					}
				}
			} 
		}

		private static load_methods(result:TypeScript.Api.Reflect.Interface, ast:TypeScript.InterfaceDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.FunctionDeclaration) 
				{
					var obj = TypeScript.Api.Reflect.Method.create(member);

					result.methods.push(obj);
				}
			}
		}

		private static load_variables(result:TypeScript.Api.Reflect.Interface, ast:TypeScript.InterfaceDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.VariableDeclarator)
				{
					var obj = TypeScript.Api.Reflect.Variable.create(member);

					result.variables.push(obj);
				}
			}
		}


		public static create(ast:TypeScript.InterfaceDeclaration): Interface 
		{
			var result     = new Interface();

			result.name    = ast.name.text;

			result.limChar = ast.limChar;

			result.minChar = ast.minChar;

			Interface.load_parameters (result, ast);

			Interface.load_extends    (result, ast);

			Interface.load_methods    (result, ast);

			Interface.load_variables  (result, ast);

			return result;
		}
	}
}