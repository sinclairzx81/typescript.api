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
        public name 	  : string;
        
        public arguments  : Type[];
		
        public arrayCount : number;

        constructor() 
        {
            this.name       = "any";

            this.arguments  = [];

            this.arrayCount = 0;
        }

        // [accepts]
        // 10 : TypeScript.NodeType.GenericType 
        // 11 : TypeScript.NodeType.TypeRef
        // 20 : TypeScript.NodeType.Name		
        private static qualify(ast:TypeScript.AST) : string
        {
            var result = [];

            // [accepts]
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
					    
                        if(expression.nodeType == TypeScript.NodeType.Name) 
                        {
                            walk(expression);
                        }
					
                        if(expression.nodeType == TypeScript.NodeType.MemberAccessExpression) 
                        {
                            walk(expression.operand1);
						
                            walk(expression.operand2);				
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
    
        // [accepts]
        // 10 : TypeScript.NodeType.GenericType 
        // 11 : TypeScript.NodeType.TypeRef		
        public static create (ast:TypeScript.AST) : Type 
        {
            var create_type = (ast:TypeScript.AST) : Type => 
            {
                var type = new Type();

                type.name = Type.qualify(ast);

                switch(ast.nodeType)
                {
                    case TypeScript.NodeType.TypeRef:

                        var type_reference = <TypeScript.TypeReference>ast;

                        type = create_type(type_reference.term);

                        break;

                    case TypeScript.NodeType.GenericType:

                        var generic_type = <TypeScript.GenericType>ast;

                        for(var n in generic_type.typeArguments.members) 
                        {
                            var type_reference = <TypeScript.TypeReference>generic_type.typeArguments.members[n].term;

                            type.arguments.push( create_type( type_reference ) );
                        }

                        break;
                }

                return type;
            };
            
            return create_type(ast);
        }
	}
}