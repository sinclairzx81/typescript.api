/// <reference path="decl/typescript.d.ts" />
/// <reference path="compiler.ts" />

module TypeScript.Api {	

	export class Reflector {
		
		public compilation:TypeScript.Api.Compilation;
		
		constructor(compilation:TypeScript.Api.Compilation) {
			
			this.compilation = compilation;
			
		}
		
		public reflect() {
		
			return {};
		
		}
		
	}
		
	
	//////////////////////////////////////////////////////////////////
	// objects
	//////////////////////////////////////////////////////////////////

	class Variable {

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

	class Argument {

		public name: string;

		public type: string;

		constructor(){
		
		}

		public static create(ast:TypeScript.Parameter): Argument {
			
			var result = new Argument();
			
			//result.name = ast.sym ? ast.sym.name : '';

			//result.type = ast.sym ? ast.sym.getType().symbol.fullName() : '';
			
			// format..
			//result.type = result.type.replace(Patterns.Quotes, "");

			return result;
		}   
	}

	class Method {
		
		public arguments: Argument[];

		public name     : string;
		
		public fullname : string;
		
		public returns  : string;

		constructor () {

			this.arguments = [];

		}

		public static create(ast:TypeScript.FunctionDeclaration): Method  {
			
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
	 
	class Class {
		
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

	class Interface {

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

	class Import {

		public name     : string;

		public fullname : string;

		public alias    : string;

		constructor() {
		
		}

		public static create(ast:TypeScript.ImportDeclaration): Import {

		
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

	class Module {

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

	class Script {
		
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
			
			var result = new Script();
			
			//result.filename = ast.locationInfo.filename;
			
			// format ..
			//result.filename = result.filename.replace(Patterns.DoubleSlash, "/");

			return result;
		}
	}

	class Reflection {

		public scripts : Script[];

		constructor() {

			this.scripts = [];

		}

		public static create(ast:TypeScript.AST) : Reflection {
			
			var reflection     = new Reflection();
			//console.log(ast.topLevelMod);
			
			var walker         = new ASTWalker();

			walker.userdata    = [];

			walker.userdata.push(reflection);

			walker.walk(ast, (walker, ast) => {
				
				if(walker.stack.length < walker.userdata.length - 1) {
					
					do {

						walker.userdata.pop();

					} while (walker.stack.length < walker.userdata.length - 1);
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

						var argument = Argument.create(<TypeScript.Parameter>ast);

						parent.arguments.push(argument);

						walker.userdata.push(argument);

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
	
	class ASTWalker  {
		
		public stack    : TypeScript.AST [];
		public userdata : any;
		public callback : { (sender: ASTWalker, ast: TypeScript.AST): void; };

		constructor() {
			this.stack    = [];
			this.userdata = null;
			this.callback = (sender, ast) => {};
		}

		public walk(ast: TypeScript.AST, callback:{ (sender: ASTWalker, ast: TypeScript.AST): void; } ): void { 
			this.callback = callback;
			this.stack    = [];
			this.walk_ast(ast); 
		}

		private walk_script    (ast: TypeScript.Script): void {

			this.callback(this, ast);
			this.stack.push(ast);
			//this.walk_ast(ast.bod);        
			this.stack.pop();
		}

		private walk_module    (ast: TypeScript.ModuleDeclaration): void {

			this.callback(this, ast);
			this.stack.push(ast);              
			this.walk_astlist(ast.members); 
			this.stack.pop();
		}

		private walk_import    (ast: TypeScript.ImportDeclaration): void {
			
			this.callback(this, ast); 
		}

		private walk_classdecl (ast: TypeScript.ClassDeclaration): void {

			this.callback(this, ast);
			this.stack.push(ast);
			this.walk_ast(ast.members);
			this.stack.pop();
		}

		private walk_interface (ast: TypeScript.InterfaceDeclaration): void {

			this.callback(this, ast);
			this.stack.push(ast);
			this.walk_ast(ast.members);
			this.stack.pop();
		}

		private walk_vardecl   (ast: TypeScript.VariableDeclaration): void { 
			
			this.callback(this, ast);
		}   

		private walk_funcdecl  (ast: TypeScript.FunctionDeclaration): void {
			
			this.callback(this, ast);
			this.stack.push(ast);
			this.walk_astlist(ast.arguments);
			this.stack.pop();
		}

		private walk_argdecl   (ast: TypeScript.Parameter): void {
			
			this.callback(this, ast);
		}
				
		public walk_ast       (ast: TypeScript.AST): void {
		
			switch (ast.nodeType) {
				//case TypeScript.NodeType.List:                 this.walk_astlist  (<TypeScript.List>ast); break;
				case TypeScript.NodeType.Script:               this.walk_script   (<TypeScript.Script>ast); break;
				case TypeScript.NodeType.ModuleDeclaration:    this.walk_module   (<TypeScript.ModuleDeclaration>ast); break;
				case TypeScript.NodeType.InterfaceDeclaration: this.walk_interface(<TypeScript.InterfaceDeclaration>ast); break;
				case TypeScript.NodeType.VariableDeclaration:  this.walk_vardecl  (<TypeScript.VariableDeclaration>ast); break;
				case TypeScript.NodeType.ClassDeclaration:     this.walk_classdecl(<TypeScript.ClassDeclaration>ast); break;
				case TypeScript.NodeType.FunctionDeclaration:  this.walk_funcdecl (<TypeScript.FunctionDeclaration>ast); break;
				case TypeScript.NodeType.Parameter:            this.walk_argdecl  (<TypeScript.Parameter>ast); break;
				case TypeScript.NodeType.ImportDeclaration:    this.walk_import   (<TypeScript.ImportDeclaration>ast); break;
			}
		}

		public walk_astlist   (ast: TypeScript.ASTList): void {
			
			for(var n in ast.members) {
				this.walk_ast(ast.members[n]);
			}
		}       
	}	
	
	
	
	
}