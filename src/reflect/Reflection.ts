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
/// <reference path="../ast/ASTWalker.ts" />
/// <reference path="Script.ts" />
/// <reference path="Module.ts" />
/// <reference path="Import.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Class.ts" />
/// <reference path="Method.ts" />
/// <reference path="Parameter.ts" />
/// <reference path="Variable.ts" />
/// <reference path="Type.ts" />

module TypeScript.Api.Reflect  {	
	
	export class Reflection
	{
		public scripts : Script[];
		
		constructor() 
		{
			this.scripts = [];
		}
		
		public static create( compiledUnits : TypeScript.Api.Units.CompiledUnit[] ) : Reflection 
		{
			var reflection     = new TypeScript.Api.Reflect.Reflection();
			var walker         = new TypeScript.Api.Ast.ASTWalker();
			walker.userdata    = [];
			
			walker.userdata.push(reflection);
		
			// foreach compilation unit..
			for(var n in compiledUnits) {
				
				// walk the units ast..
				walker.walk(compiledUnits[n].ast, (walker, ast) => 
				{
					
					// catch here....
					if(walker.stack.length < walker.userdata.length - 1) 
					{
						do    
						{ 
							walker.userdata.pop(); 
						} 
						while (walker.stack.length < walker.userdata.length - 1);
					}
					
					// set the parent node...
					var parent = walker.userdata[walker.userdata.length - 1];
					
					// what node did we get?
					switch (ast.nodeType) 
					{
						case TypeScript.NodeType.VariableDeclarator:
							var variable = Variable.create(<TypeScript.VariableDeclarator>ast);
							parent.variables.push(variable);
							walker.userdata.push(variable);
							break;
						
						case TypeScript.NodeType.TypeRef: 
							var type = Type.create(<TypeScript.TypeReference>ast);
							parent.type = type;
							walker.userdata.push(type);							
							break;
							
						case TypeScript.NodeType.Parameter:
							var parameter = Parameter.create(<TypeScript.Parameter>ast);
							parent.parameters.push(parameter);
							walker.userdata.push(parameter);
							break;
							
						case TypeScript.NodeType.FunctionDeclaration:
							var method = Method.create(<TypeScript.FunctionDeclaration>ast);
							parent.methods.push(method);
							walker.userdata.push(method);
							break;
							
						case TypeScript.NodeType.ClassDeclaration:
							var _class = Class.create(<TypeScript.ClassDeclaration>ast);
							parent.classes.push(_class);
							walker.userdata.push(_class);
							break;

						case TypeScript.NodeType.InterfaceDeclaration:
							var _interface = Interface.create(<TypeScript.InterfaceDeclaration>ast);
							parent.interfaces.push(_interface);
							walker.userdata.push(_interface);
							break;

						case TypeScript.NodeType.ImportDeclaration:
							var _import = Import.create(<TypeScript.ImportDeclaration>ast);
							parent.imports.push(_import);
							walker.userdata.push(_import);
							break;
							
						case TypeScript.NodeType.ModuleDeclaration:
							var _module = Module.create(<TypeScript.ModuleDeclaration>ast);
							parent.modules.push(_module);
							walker.userdata.push(_module);
							break;	
							
						case TypeScript.NodeType.Script:
							var _script = Script.create(compiledUnits[n].path, <TypeScript.Script>ast);
							parent.scripts.push(_script);
							walker.userdata.push(_script);
							break;						
					}
				});
			}
			
			return reflection;
		}
	}
}