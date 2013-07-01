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

module TypeScript.Api.Reflect 
{
	export class Type  
	{
		public name 	  : string;

		public arguments  : Type[];
        
        public signature  : TypeScript.Api.Reflect.Method;

		public arrayCount : number;

		public limChar    : number;

		public minChar    : number;

		constructor() 
		{
			this.name       = "any";
            
			this.arguments  = [];

			this.arrayCount = 0;
		}

		private static qualifyName(ast:TypeScript.AST) : string
		{
			var result = [];

			// 10 : TypeScript.NodeType.GenericType 

			// 11 : TypeScript.NodeType.TypeRef

			// 20 : TypeScript.NodeType.Name

			// 32 : TypeScript.NodeType.MemberAccessExpression (as per iteration)

			var walk = (ast:TypeScript.AST) =>
			{
				switch(ast.nodeType)
				{
					case TypeScript.NodeType.Name:

						var name = <TypeScript.Identifier>ast;

						result.push(name.text);

						break;

					case TypeScript.NodeType.MemberAccessExpression:

						var expression = <TypeScript.BinaryExpression>ast;

						walk(expression.operand1);

						walk(expression.operand2);

						break;

					case TypeScript.NodeType.TypeRef:

						var type_reference = <TypeScript.TypeReference>ast;

						walk(type_reference.term);

						break;

					case TypeScript.NodeType.GenericType:

						var generic_type = <TypeScript.GenericType>ast;

						var expression = <TypeScript.BinaryExpression>generic_type.name;

						switch(expression.nodeType)
						{
							case TypeScript.NodeType.Name:

								walk(expression);

								break;

							case TypeScript.NodeType.MemberAccessExpression:

								walk(expression);

								break;
						}

						break;

					default:

						result.push("any");

						break;
				}
			};

			walk(ast);

			return result.join('.');		
		}

		public static create (ast:TypeScript.AST) : Type 
		{
			// called on namespaced extends or implements.
			var create_member_access_expression = (ast:TypeScript.AST) : Type => { // 32

				var type = new TypeScript.Api.Reflect.Type();

				type.name = Type.qualifyName(ast);

				return type;
			}  

			// called on non namespaced extends or implements.
			var create_named_type = (namedDeclaraion:TypeScript.NamedDeclaration) : Type => {

				var type = new TypeScript.Api.Reflect.Type();

				type.name = Type.qualifyName(namedDeclaraion);

				return type;
			}

			// called when referencing variables, return types.
			var create_type = (typeRef:TypeScript.TypeReference) : Type => 
			{
				var type = new TypeScript.Api.Reflect.Type();

				type.name       = Type.qualifyName(typeRef);

				type.arrayCount = typeRef.arrayCount;

				type.limChar    = typeRef.limChar;

				type.minChar    = typeRef.minChar;

				if(typeRef.term.nodeType == TypeScript.NodeType.GenericType)
				{
					var genericType = <TypeScript.GenericType>typeRef.term;

					for(var n in genericType.typeArguments.members) 
					{
						var typeRef = <TypeScript.TypeReference>genericType.typeArguments.members[n];

						type.arguments.push( create_type( typeRef ) );
					}
				}

                if(typeRef.term.nodeType == TypeScript.NodeType.FunctionDeclaration) {
                    
                    type.name      = "Function";

                    type.signature = Method.create(<TypeScript.FunctionDeclaration> typeRef.term);

                }

				return type;
			};

			// called when referencing generic types.
			var create_generic_type = (genericType:TypeScript.GenericType) : Type =>
			{
				var type = new TypeScript.Api.Reflect.Type();

				type.name    = Type.qualifyName(genericType);

				type.limChar = genericType.limChar;

				type.minChar = genericType.minChar;

				for(var n in genericType.typeArguments.members) 
				{
					var typeRef = <TypeScript.TypeReference>genericType.typeArguments.members[n];

					type.arguments.push( create_type( typeRef ) );
				}

				return type;
			};

			var type:TypeScript.Api.Reflect.Type = null;

			switch(ast.nodeType)
			{
				case TypeScript.NodeType.Name:

					type = create_named_type(<TypeScript.NamedDeclaration>ast);

					break;

				case TypeScript.NodeType.GenericType:

					type = create_generic_type(<TypeScript.GenericType>ast);

					break;

				case TypeScript.NodeType.TypeRef:

					type = create_type(<TypeScript.TypeReference>ast);

					break;

				case TypeScript.NodeType.MemberAccessExpression:

					type = create_member_access_expression(ast); // unsure of the NodeType.

					break;
			}

			return type;
		}
	}
}