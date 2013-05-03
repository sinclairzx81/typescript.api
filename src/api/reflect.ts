// Acid Frameworks.  All rights reserved.
// 
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

/// <reference path="decl/typescript.d.ts" />
/// <reference path="astwalker.ts" />
/// <reference path="compiler.ts" />

module TypeScript.Api {	
	
	//////////////////////////////////////////////////////////////////
	// Variable:
	//////////////////////////////////////////////////////////////////
	
	export class Variable {
		public name     : string;
		public fullname : string;
		public type     : string;

		constructor(){
		
		}

		public static create(ast:TypeScript.VariableDeclaration): Variable {
			
			var result = new Variable();
			//result.name      = ast.sym ? ast.sym.name : '';
			//result.fullname  = ast.sym ? ast.sym.fullName() : '';
			//result.type      = ast.sym ? ast.sym.getType().symbol.fullName() : '';
			// format...
			//result.fullname  = result.fullname.replace(Patterns.Quotes, "");
			//result.type      = result.type.replace(Patterns.Quotes, "");
			return result;
		}  
	}
	//////////////////////////////////////////////////////////////////
	// Parameter:
	//////////////////////////////////////////////////////////////////
	export class Parameter {
		public name: string;
		public type: string;
		constructor(){ }

		public static create(ast:TypeScript.Parameter): Parameter {
			console.log('Parameter');
			var result = new Parameter();
			//result.name = ast.sym ? ast.sym.name : '';
			//result.type = ast.sym ? ast.sym.getType().symbol.fullName() : '';
			// format..
			//result.type = result.type.replace(Patterns.Quotes, "");
			return result;
		}   
	}
	//////////////////////////////////////////////////////////////////
	// Method:
	//////////////////////////////////////////////////////////////////	
	export class Method {
		public parameters : Parameter[];
		public name       : string;
		public fullname   : string;
		public returns    : string;

		constructor () {
			this.parameters = [];
		}

		public static create(ast:TypeScript.FunctionDeclaration): Method  {
			console.log('Method');
			var result = new Method();
			/*
			result.name      = ast.name ? ast.name.text : '';
			result.fullname  = ast.name ? ast.name.sym.fullName() : '';
			if(ast.returnTypeAnnotation) {
				if (ast.returnTypeAnnotation.type) {
					result.returns = ast.returnTypeAnnotation.type.symbol.fullName();
				} else {
					result.returns = "constructor";
				}
			} 

			// format..
			result.fullname  = result.fullname.replace(Patterns.Quotes, "");
			result.returns   = result.returns.replace(Patterns.Quotes, "");
			*/
			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Class:
	//////////////////////////////////////////////////////////////////	 
	export class Class {
		public methods    : Method    [];
		public variables  : Variable  [];
		public name       : string;
		public fullname   : string;
		public extends    : string [];
		public implements : string [];
		constructor() {
			this.methods    = [];
			this.variables  = [];
			this.extends    = [];
			this.implements = [];
		}

		public static create(ast:TypeScript.ClassDeclaration): Class {
			
			console.log('Class');
			
			var result = new Class();
			/*
			result.name      = ast.name ? ast.name.text : '';
			result.fullname  = ast.name ? ast.name.sym.fullName() : '';
			if (ast.extendsList) {
				if (ast.extendsList.members) {
					for(var n in ast.extendsList.members) { 
						var ref = <TypeScript.NamedDeclaration>ast.extendsList.members[n];
						result.extends.push(ref.type.symbol.fullName() );
					}
				}
			}

			if (ast.implementsList) {
				if (ast.implementsList.members) {
					for(var n in ast.implementsList.members) { 
						var ref = <TypeScript.NamedDeclaration>ast.implementsList.members[n];
						result.implements.push(ref.type.symbol.fullName() );
					}
				}
			}

			// format.. 
			result.fullname  = result.fullname.replace(Patterns.Quotes, "");
			for(var n in result.extends) {
				result.extends[n] = result.extends[n].replace(Patterns.Quotes, "")
			}

			for(var n in result.implements) {
				result.implements[n] = result.implements[n].replace(Patterns.Quotes, "")
			}
			*/
			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Interface:
	//////////////////////////////////////////////////////////////////
	export class Interface {
		public methods    : Method    [];
		public variables  : Variable  [];
		public name       : string;
		public fullname   : string;
		public extends    : string [];

		constructor () {
			this.methods    = [];
			this.variables  = [];
			this.extends    = [];
		}

		public static create(ast:TypeScript.InterfaceDeclaration): Interface {
			console.log('Interface');
			var result       = new Interface();
			/*
			result.name      = ast.name ? ast.name.text : '';
			result.fullname  = ast.name ? ast.name.sym.fullName() : '';
			if (ast.extendsList) {
				if (ast.extendsList.members) {
					for(var n in ast.extendsList.members) { 
						var ref = <TypeScript.NamedDeclaration>ast.extendsList.members[n];
						result.extends.push(ref.type.symbol.fullName() );
					}
				}
			}
			
			// format...
			result.fullname  = result.fullname.replace(Patterns.Quotes, "");
			for(var n in result.extends) {
			
				result.extends[n] = result.extends[n].replace(Patterns.Quotes, "")
			}
			*/

			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Import:
	//////////////////////////////////////////////////////////////////
	export class Import {
		public name     : string;
		public fullname : string;
		public alias    : string;

		constructor() {
		
		}

		public static create(ast:TypeScript.ImportDeclaration): Import {
			console.log('Import');
			var result      = new Import();
			/*
			result.name      = ast.id.actualText;
			result.fullname  = ast.id.sym.fullName();
			result.alias     = ast.getAliasName();

			// format...
			result.alias     = result.alias.replace(Patterns.Quotes, "");
			result.fullname  = result.fullname.replace (Patterns.Quotes, "");
			*/
			return result;
		}

	}
	//////////////////////////////////////////////////////////////////
	// Module:
	//////////////////////////////////////////////////////////////////
	export class Module {

		public imports    : Import    [];
		public modules    : Module    [];
		public interfaces : Interface [];
		public classes    : Class     [];
		public methods    : Method    [];
		public variables  : Variable  [];
		public name       : string;
		public fullname   : string;

		constructor () {
			this.imports    = [];
			this.modules    = [];
			this.interfaces = [];
			this.classes    = [];
			this.methods    = [];
			this.variables  = [];
		}

		public static create(ast:TypeScript.ModuleDeclaration): Module {
			console.log('Module');
			var result = new Module();
			/*
			result.name     = ast.name ? ast.name.text : '';
			result.fullname = ast.name ? ast.name.sym.fullName() : '';
			// format...
			result.name      = result.name.replace(Patterns.DoubleSlash, "/");
			result.fullname  = result.fullname.replace(Patterns.Quotes, "");
			if(result.name.indexOf('/') !== -1) {
				result.name = result.fullname;
			}
			*/
			
			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Script:
	//////////////////////////////////////////////////////////////////
	export class Script {
		public modules    : Module    [];
		public interfaces : Interface [];
		public classes    : Class     [];
		public methods    : Method    [];
		public variables  : Variable  [];
		public filename   : string;
		
		constructor () {
			this.modules    = [];
			this.interfaces = [];
			this.classes    = [];
			this.methods    = [];
			this.variables  = [];
		}

		public static create(ast:TypeScript.Script): Script {
			console.log('Script');
			var result = new Script();
			//result.filename = ast.locationInfo.filename;
			// format ..
			//result.filename = result.filename.replace(Patterns.DoubleSlash, "/");
			return result;
		}
	}
	
	//////////////////////////////////////////////////////////////////
	// Reflection:
	//////////////////////////////////////////////////////////////////
	export class Reflection {
		
		public scripts : Script[];
		constructor() {
			this.scripts = [];

		}
		public static create(ast:TypeScript.AST) : Reflection {
			var reflection     = new Reflection();
			var walker         = new ASTWalker();
			walker.userdata    = [];
			walker.userdata.push(reflection);
			
			console.log('before reflection.create.walker.walk(..)');
			walker.walk(ast, (walker, ast) => {				
				if(walker.stack.length < walker.userdata.length - 1) {
					do    { walker.userdata.pop(); } 
					while (walker.stack.length < walker.userdata.length - 1);
				}

				var parent = walker.userdata[walker.userdata.length - 1];
			
				switch (ast.nodeType) {

					case TypeScript.NodeType.FunctionDeclaration:
						var method = Method.create(<TypeScript.FunctionDeclaration>ast);
						parent.methods.push(method);
						walker.userdata.push(method);
						break;


					case TypeScript.NodeType.VariableDeclaration:
						var variable = Variable.create(<TypeScript.VariableDeclaration>ast);
						parent.variables.push(variable);
						walker.userdata.push(variable);
						break;

					case TypeScript.NodeType.Parameter:
						var parameter = Parameter.create(<TypeScript.Parameter>ast);
						parent.parameters.push(parameter);
						walker.userdata.push(parameter);
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

					case TypeScript.NodeType.ModuleDeclaration:
						var _module = Module.create(<TypeScript.ModuleDeclaration>ast);
						parent.modules.push(_module);
						walker.userdata.push(_module);
						break;

					case TypeScript.NodeType.Script:
						var _script = Script.create(<TypeScript.Script>ast);
						parent.scripts.push(_script);
						walker.userdata.push(_script);
						break;

					case TypeScript.NodeType.ImportDeclaration:
						var _import = Import.create(<TypeScript.ImportDeclaration>ast);
						parent.imports.push(_import);
						walker.userdata.push(_import);
						break;
				}
			});
			
			return reflection;
		
		}
	}
	//////////////////////////////////////////////////////////////////
	// Reflector:
	//////////////////////////////////////////////////////////////////	
	export class Reflector {
		
		public compilation:TypeScript.Api.Compilation;
		
		constructor(compilation:TypeScript.Api.Compilation) {
			this.compilation = compilation;
		}
		
		public reflect() {
			
			for(var n in this.compilation.astlist) {
				
				var reflection = TypeScript.Api.Reflection.create(this.compilation.astlist[n]);
				
				
			}
		
			return {};
		}
		
	}

}