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
	export class Type  
	{
		public name 	 : string;
		
		public arguments : Type[];
		
		constructor() 
		{
			this.arguments = [];
		}
		
		public static qualify(ast:TypeScript.AST) : string 
		{
			var result = [];
			
			var walk = (ast:TypeScript.AST) => 
			{
				if(ast.nodeType == TypeScript.NodeType.MemberAccessExpression) 
				{ 
					var expression = <TypeScript.BinaryExpression>ast;
					
					walk(expression.operand1);
					
					walk(expression.operand2);
				}
				
				if(ast.nodeType == TypeScript.NodeType.GenericType) 
				{  
					var generic_type = <TypeScript.GenericType>ast;
					
					var expression = <TypeScript.BinaryExpression>generic_type.name;
					
					if(expression.nodeType == TypeScript.NodeType.Name) 
					{
						walk(expression);
					}
					
					if(expression.nodeType == TypeScript.NodeType.MemberAccessExpression) 
					{
						walk(expression.operand1);
						
						walk(expression.operand2);				
					}
				}				
				if(ast.nodeType == TypeScript.NodeType.Name) 
				{  
					var name = <TypeScript.Identifier>ast;
					
					result.push(name.text);
				}
			};
			
			walk(ast);
			
			return result.join('.');		
		}
		
		public static create (ast:TypeScript.TypeReference) : Type 
		{
			var create_type = (ast:TypeScript.TypeReference) : Type => 
			{
				var type = new Type();
				
				type.name = Type.qualify (ast.term);
				
				switch(ast.term.nodeType)
				{ 
					case TypeScript.NodeType.GenericType:
					
						var generic_type = <TypeScript.GenericType>ast.term;
						
						for(var n in generic_type.typeArguments.members) 
						{
							var argument = create_type(generic_type.typeArguments.members[n]);
							
							type.arguments.push(argument);
						}
						break;
				}
				
				return type;
			};
			return create_type(ast);
		}
	}
}