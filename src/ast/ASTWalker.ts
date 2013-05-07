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

module TypeScript.Api.Ast 
{
	////////////////////////////////////////////////////////////////////
	// ASTWalker: TypeScript.API ASTWalker.
	////////////////////////////////////////////////////////////////////
	export class ASTWalker  
	{
		public stack    : TypeScript.AST [];
		
		public callback : { (sender: ASTWalker, ast: TypeScript.AST): void; };
		
		public userdata : any;
		
		constructor() 
		{
			this.stack    = [];
			
			this.userdata = null;
			
			this.callback = (sender, ast) => {};
		}
		
		private walk_varstatement(ast:TypeScript.VariableStatement) : void 
		{
			if(ast.declaration)
			{
				if(ast.declaration.declarators) 
				{
					this.callback(this, ast);
					
					this.stack.push(ast);
					
					this.walk_ast_array(ast.declaration.declarators.members);
					
					this.stack.pop();
				}
			}
		}
		
		private walk_parameter   (ast: TypeScript.Parameter): void 
		{
			this.callback(this, ast);
		}
		
		private walk_type_ref       (ast:TypeScript.TypeReference): void 
		{
			this.callback(this, ast);
		}
		
		private walk_vardecl   (ast: TypeScript.VariableDeclarator): void 
		{ 
			this.callback(this, ast);

			if(ast.typeExpr) 
			{
				this.stack.push(ast);
				
				this.walk_ast(ast.typeExpr);
				
				this.stack.pop();
			} 
			else 
			{
				this.stack.push(ast);
				
				this.walk_ast(ast.id);
				
				this.stack.pop();
			}
		}		
		
		private walk_funcdecl  (ast: TypeScript.FunctionDeclaration): void 
		{
			this.callback(this, ast);
			
			this.stack.push(ast);
			
			this.walk_astlist(ast.arguments);
			
			this.stack.pop();
		}
		
		private walk_classdecl (ast: TypeScript.ClassDeclaration): void 
		{
			this.callback(this, ast);
			
			this.stack.push(ast);
			
			this.walk_ast(ast.members);
			
			this.stack.pop();
		}	
		
		private walk_interface (ast: TypeScript.InterfaceDeclaration): void 
		{
			this.callback(this, ast);
			
			this.stack.push(ast);
			
			this.walk_ast(ast.members);
			
			this.stack.pop();
		}	
		
		private walk_module (ast: TypeScript.ModuleDeclaration): void 
		{
			this.callback(this, ast);
			
			this.stack.push(ast);    
			
			this.walk_astlist(ast.members);
			
			this.stack.pop();
		}
		
		private walk_import    (ast: TypeScript.ImportDeclaration): void 
		{
			this.callback(this, ast); 
		}
		
		private walk_script (ast: TypeScript.Script): void 
		{
			this.callback(this, ast);
			
			this.stack.push(ast);
			
			this.walk_ast_array(ast.moduleElements.members);
			
			this.stack.pop();
		}
		
		private walk_astlist (ast: TypeScript.ASTList): void 
		{
			for(var n in ast.members) 
			{
				this.walk_ast(ast.members[n]);
			}
		}
		
		public walk_ast       (ast: TypeScript.AST): void {
			
			//console.log(TypeScript.NodeType._map[ast.nodeType]);
			switch (ast.nodeType) 
			{
				case TypeScript.NodeType.List:                    this.walk_astlist        (<TypeScript.ASTList>ast); break;
				
				case TypeScript.NodeType.Script:                  this.walk_script         (<TypeScript.Script>ast); break;
				
				case TypeScript.NodeType.ModuleDeclaration:       this.walk_module         (<TypeScript.ModuleDeclaration>ast); break;
				
				case TypeScript.NodeType.InterfaceDeclaration:    this.walk_interface      (<TypeScript.InterfaceDeclaration>ast); break;
				
				case TypeScript.NodeType.VariableDeclarator:      this.walk_vardecl        (<TypeScript.VariableDeclarator>ast); break;
				
				case TypeScript.NodeType.VariableStatement:       this.walk_varstatement   (<TypeScript.VariableStatement>ast); break;
				
				case TypeScript.NodeType.ClassDeclaration:        this.walk_classdecl      (<TypeScript.ClassDeclaration>ast); break;
				
				case TypeScript.NodeType.FunctionDeclaration:     this.walk_funcdecl       (<TypeScript.FunctionDeclaration>ast); break;
				
				case TypeScript.NodeType.Parameter:               this.walk_parameter      (<TypeScript.Parameter>ast); break;
				
				case TypeScript.NodeType.ImportDeclaration:       this.walk_import         (<TypeScript.ImportDeclaration>ast); break;
				
				case TypeScript.NodeType.TypeRef:                 this.walk_type_ref       (<TypeScript.TypeReference>ast); break;
			}
		}
		
		// entry point for 0.9.0
		public walk_ast_array (ast_array: TypeScript.AST[]) : void 
		{
			for(var n in ast_array) 
			{
				this.walk_ast(ast_array[n]);
			}			
		}
		
		// entry point for 0.8.3
		public walk(ast: TypeScript.AST, callback:{ (sender: ASTWalker, ast: TypeScript.AST): void; } ): void 
		{
			this.callback = callback;
			
			this.stack    = [];
			
			this.walk_ast(ast); 
		}
	}
}