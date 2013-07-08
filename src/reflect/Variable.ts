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
/// <reference path="ReflectedType.ts" />
/// <reference path="Type.ts" />

module TypeScript.Api.Reflect 
{
	export class Variable extends ReflectedType
	{
		public type                    : Type;

        public isPublic                : boolean;

		public isProperty              : boolean;

		public isStatic                : boolean;

		public isStatement             : boolean;

		public isExpression            : boolean;

		public isStatementOrExpression : boolean;

		public isExported              : boolean;

		public comments                : string[];

		constructor() {

            super('variable');
            
			this.comments   = [];

            this.isExported = false;

            this.isPublic   = false;

		}

		private static load_comments(result:Variable, ast:TypeScript.VariableDeclarator) : void {

			var comments = ast.getDocComments();

			for(var n in comments) 
			{
				result.comments.push(comments[n].content);
			}
		}

		private static load_type (result:Variable, ast:TypeScript.VariableDeclarator) : void {

			if(!ast.typeExpr) 
			{ 
				result.type  = new TypeScript.Api.Reflect.Type();

				return;
			}   

			result.type = TypeScript.Api.Reflect.Type.create(ast.typeExpr);
		}

		public static create(ast:TypeScript.VariableDeclarator): Variable 
		{
			var result = new Variable();

			result.name                    = ast.id.text;

            var hasFlag = (val : number, flag: number) :boolean  => 
            {
                return (val & flag) !== 0;
            };
            
            var flags = ast.getVarFlags();

            if(hasFlag(flags, VariableFlags.Public)) {
                
                result.isPublic = true;
            }

            if(hasFlag(flags, VariableFlags.Exported)) {

                result.isExported = true;
            }


			result.isProperty              = ast.isProperty();

			result.isStatic                = ast.isStatic();

			result.isStatement             = ast.isStatement();

			result.isExpression            = ast.isExpression();

			result.isExported              = ast.isExported();

			result.isStatementOrExpression = ast.isStatementOrExpression();

			Variable.load_type(result, ast);

			Variable.load_comments(result, ast);

			return result;
		}  
	}
}