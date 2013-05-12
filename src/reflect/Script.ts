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
/// <reference path="Module.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Class.ts" />
/// <reference path="Method.ts" />
/// <reference path="Variable.ts" />

module TypeScript.Api.Reflect 
{
	export class Script 
	{
		public modules    : Module    [];

		public interfaces : Interface [];

		public classes    : Class     [];

		public methods    : Method    [];

		public variables  : Variable  [];

		public path       : string;

		constructor () 
		{
			this.modules    = [];

			this.interfaces = [];

			this.classes    = [];

			this.methods    = [];

			this.variables  = [];
		}

		private static load_modules(result:TypeScript.Api.Reflect.Script, ast:TypeScript.Script) : void 
		{
			for(var n in ast.moduleElements.members) 
			{
				var member = ast.moduleElements.members[n];

				if(member.nodeType == TypeScript.NodeType.ModuleDeclaration) 
				{
					var obj = TypeScript.Api.Reflect.Module.create(<TypeScript.ModuleDeclaration>member);

					result.modules.push(obj);
				}
			}
		}

		private static load_interfaces(result:TypeScript.Api.Reflect.Script, ast:TypeScript.Script) : void 
		{
			for(var n in ast.moduleElements.members) 
			{
				var member = ast.moduleElements.members[n];

				if(member.nodeType == TypeScript.NodeType.InterfaceDeclaration) 
				{
					var obj = TypeScript.Api.Reflect.Interface.create(<TypeScript.InterfaceDeclaration>member);

					result.interfaces.push(obj);
				}
			}
		}
		private static load_classes(result:TypeScript.Api.Reflect.Script, ast:TypeScript.Script) : void 
		{
			for(var n in ast.moduleElements.members)
			{
				var member = ast.moduleElements.members[n];

				if(member.nodeType == TypeScript.NodeType.ClassDeclaration) 
				{
					var obj = TypeScript.Api.Reflect.Class.create(<TypeScript.ClassDeclaration>member);

					result.classes.push(obj);
				}
			}
		}

		private static load_methods(result:TypeScript.Api.Reflect.Script, ast:TypeScript.Script) : void 
		{
			for(var n in ast.moduleElements.members) 
			{
				var member = ast.moduleElements.members[n];

				if(member.nodeType == TypeScript.NodeType.FunctionDeclaration) 
				{
					var obj = TypeScript.Api.Reflect.Method.create(<TypeScript.FunctionDeclaration>member);

					result.methods.push(obj);
				}
			}
		}

		private static load_variables(result:TypeScript.Api.Reflect.Script, ast:TypeScript.Script) : void 
		{
			for(var n in ast.moduleElements.members) 
			{
				var member = ast.moduleElements.members[n];

				if(member.nodeType == TypeScript.NodeType.VariableStatement) 
				{
					var statement = <TypeScript.VariableStatement>member;

					if(statement.declaration)
					{
						if(statement.declaration.declarators) 
						{
							for(var m in statement.declaration.declarators.members) 
							{
								var obj = TypeScript.Api.Reflect.Variable.create(statement.declaration.declarators.members[m])

								result.variables.push(obj);
							}
						}
					}
				}
			}
		}

		public static create(path:string, ast:TypeScript.Script): Script 
		{
			var result = new Script();

			result.path = path;

			Script.load_modules    (result, ast);

			Script.load_interfaces (result, ast);

			Script.load_classes    (result, ast);

			Script.load_methods    (result, ast);

			Script.load_variables  (result, ast);

			return result;
		}
	}
}