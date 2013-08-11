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
/// <reference path="Method.ts" />

module TypeScript.Api {

	export class Type extends TypeScript.Api.ReflectedType {

		public arguments  : Type[];
        
        public signature  : TypeScript.Api.Method;

		public arrayCount : number;

        public resolved   : boolean; // a flag indicating if this type was resolved to another reflected type.

		constructor() {

            super('type');

			this.name       = "any";
            
			this.arguments  = [];

			this.arrayCount = 0;

            this.resolved   = false;
		}

		private static qualifyName(ast:TypeScript.AST) : string {

			var result = [];

			// 10 : TypeScript.NodeType.GenericType 

			// 11 : TypeScript.NodeType.TypeRef

			// 20 : TypeScript.NodeType.Name

			// 32 : TypeScript.NodeType.MemberAccessExpression (as per iteration)

			var walk = (ast:TypeScript.AST) =>
			{
				switch(ast.nodeType)
				{
					case typescript.NodeType.Name:

						var name = <TypeScript.Identifier>ast;

						result.push(name.text);

						break;

					case typescript.NodeType.MemberAccessExpression:

						var expression = <TypeScript.BinaryExpression>ast;

						walk(expression.operand1);

						walk(expression.operand2);

						break;

					case typescript.NodeType.TypeRef:

						var type_reference = <TypeScript.TypeReference>ast;

						walk(type_reference.term);

						break;

					case typescript.NodeType.GenericType:

						var generic_type = <TypeScript.GenericType>ast;

						var expression = <TypeScript.BinaryExpression>generic_type.name;

						switch(expression.nodeType)
						{
							case typescript.NodeType.Name:

								walk(expression);

								break;

							case typescript.NodeType.MemberAccessExpression:

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

		public static create (ast:TypeScript.AST) : Type {

			// called on namespaced extends or implements.
			var create_member_access_expression = (ast:TypeScript.AST) : Type => { // 32

				var type = new TypeScript.Api.Type();

				type.name = Type.qualifyName(ast);

				return type;
			}  

			// called on non namespaced extends or implements.
			var create_named_type = (namedDeclaraion:TypeScript.NamedDeclaration) : Type => {

				var type = new TypeScript.Api.Type();

				type.name = Type.qualifyName(namedDeclaraion);

				return type;
			}

			// called when referencing variables, return types.
			var create_type = (typeRef:TypeScript.TypeReference) : Type => {

				var type = new TypeScript.Api.Type();

				type.name       = Type.qualifyName(typeRef);

				type.arrayCount = typeRef.arrayCount;

				if(typeRef.term.nodeType == typescript.NodeType.GenericType) {

					var genericType = <TypeScript.GenericType>typeRef.term;

					for(var n in genericType.typeArguments.members) {

						var typeRef = <TypeScript.TypeReference>genericType.typeArguments.members[n];

						type.arguments.push( create_type( typeRef ) );
					}
				}

                if(typeRef.term.nodeType == typescript.NodeType.FunctionDeclaration) {
                    
                    type.name      = "Function";

                    type.signature = Method.create(<TypeScript.FunctionDeclaration> typeRef.term);

                }

				return type;
			};

			// called when referencing generic types.
			var create_generic_type = (genericType:TypeScript.GenericType) : Type =>
			{
				var type = new TypeScript.Api.Type();

				type.name    = Type.qualifyName(genericType);

				for(var n in genericType.typeArguments.members) {

					var typeRef = <TypeScript.TypeReference>genericType.typeArguments.members[n];

					type.arguments.push( create_type( typeRef ) );
				}

				return type;
			};

			var type:TypeScript.Api.Type = null;

			switch(ast.nodeType) {

				case typescript.NodeType.Name:

					type = create_named_type(<TypeScript.NamedDeclaration>ast);

					break;

				case typescript.NodeType.GenericType:

					type = create_generic_type(<TypeScript.GenericType>ast);

					break;

				case typescript.NodeType.TypeRef:

					type = create_type(<TypeScript.TypeReference>ast);

					break;

				case typescript.NodeType.MemberAccessExpression:

					type = create_member_access_expression(ast); // unsure of the NodeType.

					break;
			}

			return type;
		}
	}
}