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
/// <reference path="ReflectedType.ts" />
/// <reference path="Import.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Class.ts" />
/// <reference path="Method.ts" />
/// <reference path="Variable.ts" />

module TypeScript.Api 
{
	export class Module extends TypeScript.Api.ReflectedType {

		public imports    : Import    [];

		public modules    : Module    [];

		public interfaces : Interface [];

		public classes    : Class     [];

		public methods    : Method    [];

		public variables  : Variable  [];

        public isExported : boolean;

		constructor () {

            super('module');

			this.imports    = [];

			this.modules    = [];

			this.interfaces = [];

			this.classes    = [];

			this.methods    = [];

			this.variables  = [];

            this.isExported = false;
		}

		private static load_imports(result:TypeScript.Api.Module, ast:TypeScript.ModuleDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.ImportDeclaration)
				{
					var obj = TypeScript.Api.Import.create(<TypeScript.ImportDeclaration>member);

					result.imports.push(obj);
				}
			}
		}

		private static load_modules(result:TypeScript.Api.Module, ast:TypeScript.ModuleDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.ModuleDeclaration)
				{
					var obj = TypeScript.Api.Module.create(<TypeScript.ModuleDeclaration>member);

					result.modules.push(obj);
				}
			}
		}

		private static load_interfaces(result:TypeScript.Api.Module, ast:TypeScript.ModuleDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.InterfaceDeclaration)
				{
					var obj = TypeScript.Api.Interface.create(<TypeScript.InterfaceDeclaration>member);

					result.interfaces.push(obj);
				}
			}
		}

		private static load_classes(result:TypeScript.Api.Module, ast:TypeScript.ModuleDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.ClassDeclaration)
				{
					var obj = TypeScript.Api.Class.create(<TypeScript.ClassDeclaration>member);

					result.classes.push(obj);
				}
			}
		}

		private static load_methods(result:TypeScript.Api.Module, ast:TypeScript.ModuleDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.FunctionDeclaration)
				{
					var obj = TypeScript.Api.Method.create(<TypeScript.FunctionDeclaration>member);

					result.methods.push(obj);
				}
			}
		}

		private static load_variables(result:TypeScript.Api.Module, ast:TypeScript.ModuleDeclaration) : void 
		{
			for(var n in ast.members.members) 
			{
				var member = ast.members.members[n];

				if(member.nodeType == TypeScript.NodeType.VariableStatement) 
				{
					var statement = <TypeScript.VariableStatement>member;

					if(statement.declaration)
					{
						if(statement.declaration.declarators) 
						{
							for(var m in statement.declaration.declarators.members) 
							{
								var obj = TypeScript.Api.Variable.create(statement.declaration.declarators.members[m])

								result.variables.push(obj);
							}
						}
					}
				}
			}
		}

		public static create (ast:TypeScript.ModuleDeclaration) : Module
		{
			var result     = new TypeScript.Api.Module();

			result.name    = ast.prettyName;
            
            var hasFlag = (val : number, flag: number) :boolean  => 
            {
                return (val & flag) !== 0;
            };
            
            var flags      = ast.getModuleFlags();

            if(hasFlag(flags, ModuleFlags.Exported)) {
                
                result.isExported = true;
            }

			Module.load_imports    (result, ast);

			Module.load_modules    (result, ast);

			Module.load_interfaces (result, ast);

			Module.load_classes    (result, ast);

			Module.load_methods    (result, ast);

			Module.load_variables  (result, ast);

			return result;
		}
	}
}