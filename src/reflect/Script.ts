/*--------------------------------------------------------------------------

Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

--------------------------------------------------------------------------*/

/// <reference path="../references.ts" />
/// <reference path="ReflectedType.ts" />
/// <reference path="Module.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Class.ts" />
/// <reference path="Method.ts" />
/// <reference path="Variable.ts" />

module TypeScript.Api 
{
	export class Script extends TypeScript.Api.ReflectedType {

		public modules    : Module    [];

		public interfaces : Interface [];

		public classes    : Class     [];

		public methods    : Method    [];

		public variables  : Variable  [];

		constructor () {

            super('script');

			this.modules    = [];

			this.interfaces = [];

			this.classes    = [];

			this.methods    = [];

			this.variables  = [];
		}

		private static load_modules(result:TypeScript.Api.Script, ast:TypeScript.Script) : void {

			for(var n in ast.moduleElements.members) {

				var member = ast.moduleElements.members[n];

				if(member.nodeType == typescript.NodeType.ModuleDeclaration) {

					var obj = TypeScript.Api.Module.create(<TypeScript.ModuleDeclaration>member);

					result.modules.push(obj);
				}
			}
		}

		private static load_interfaces(result:TypeScript.Api.Script, ast:TypeScript.Script) : void {

			for(var n in ast.moduleElements.members) {

				var member = ast.moduleElements.members[n];

				if(member.nodeType == typescript.NodeType.InterfaceDeclaration) {

					var obj = TypeScript.Api.Interface.create(<TypeScript.InterfaceDeclaration>member);

					result.interfaces.push(obj);
				}
			}
		}

		private static load_classes(result:TypeScript.Api.Script, ast:TypeScript.Script) : void {

			for(var n in ast.moduleElements.members) {

				var member = ast.moduleElements.members[n];

				if(member.nodeType == typescript.NodeType.ClassDeclaration) {

					var obj = TypeScript.Api.Class.create(<TypeScript.ClassDeclaration>member);

					result.classes.push(obj);
				}
			}
		}

		private static load_methods(result:TypeScript.Api.Script, ast:TypeScript.Script) : void {

			for(var n in ast.moduleElements.members) {

				var member = ast.moduleElements.members[n];

				if(member.nodeType == typescript.NodeType.FunctionDeclaration) {

					var obj = TypeScript.Api.Method.create(<TypeScript.FunctionDeclaration>member);

					result.methods.push(obj);
				}
			}
		}

		private static load_variables(result:TypeScript.Api.Script, ast:TypeScript.Script) : void {

			for(var n in ast.moduleElements.members) {

				var member = ast.moduleElements.members[n];

				if(member.nodeType == typescript.NodeType.VariableStatement) {

					var statement = <TypeScript.VariableStatement>member;

					if(statement.declaration) {

						if(statement.declaration.declarators) {

							for(var m in statement.declaration.declarators.members) {

								var obj = TypeScript.Api.Variable.create(<TypeScript.VariableDeclarator>statement.declaration.declarators.members[m])

								result.variables.push(obj);
							}
						}
					}
				}
			}
		}

        public static load_scope(script:Script) : void {
            
            var scope = [];

            var qualify_module_names = (module:TypeScript.Api.Module) => {

                module.scope = scope.slice(0);
            
                scope.push(module.name);

                module.interfaces.forEach((obj) => {

                    obj.scope = scope.slice(0);

                });
                module.classes.forEach((obj) => {
                    
                    obj.scope = scope.slice(0);

                });
                module.methods.forEach((obj) => {
                       
                    obj.scope = scope.slice(0);

                });     
                module.variables.forEach((obj) => {
                       
                    obj.scope = scope.slice(0);

                });                                                

                module.modules.forEach((module)=> {
                    
                    qualify_module_names(module);

                });

                scope.pop();
            };

            script.modules.forEach((module) => {
            
                qualify_module_names(module);

            });
        }

		public static create(name:string, ast:TypeScript.Script): TypeScript.Api.Script {

			var result = new TypeScript.Api.Script();

			result.name = name;

			Script.load_modules    (result, ast);

			Script.load_interfaces (result, ast);

			Script.load_classes    (result, ast);

			Script.load_methods    (result, ast);

			Script.load_variables  (result, ast);

            Script.load_scope      (result);

			return result;
		}
	}
}