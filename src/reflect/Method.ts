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
/// <reference path="ReflectionType.ts" />
/// <reference path="Parameter.ts" />
/// <reference path="Type.ts" />

module TypeScript.Api.Reflect 
{
	export class Method extends ReflectionType
	{
		public parameters      : Parameter[];

		public returns         : Type;

        public isExported      : boolean;

        public isPublic        : boolean;
        
		public isStatic        : boolean;

		public isAccessor      : boolean; 

		public isSignature     : boolean;

		public isConstructor   : boolean;

		public isCallMember    : boolean;

		public isDeclaration   : boolean;

		public isExpression    : boolean;

		public isGetAccessor   : boolean;

		public isSetAccessor   : boolean;

		public isIndexer       : boolean;

		public comments        : string [];

		constructor () 
		{
            super('method');

			this.parameters = [];

			this.comments   = [];

            this.isPublic   = false;

            this.isExported = false;
		}

		private static load_comments(result:Method, ast:TypeScript.FunctionDeclaration) : void 
		{
			var comments = ast.getDocComments();

			for(var n in comments) 
			{
				result.comments.push(comments[n].content);
			}
		}

		private static load_returns(result:Method, ast:TypeScript.FunctionDeclaration) : void 
		{
			if(ast.returnTypeAnnotation) 
			{
				var type_reference = <TypeScript.TypeReference>ast.returnTypeAnnotation;

				result.returns = TypeScript.Api.Reflect.Type.create( type_reference );	

				return;
			}
			result.returns = new TypeScript.Api.Reflect.Type();            
		}

		public static load_parameters(result:Method, ast:TypeScript.FunctionDeclaration) : void 
		{
			for(var n in ast.arguments.members) 
			{
				var argument = ast.arguments.members[n];

				var parameter = TypeScript.Api.Reflect.Parameter.create(argument);

				result.parameters.push(parameter);
			}
		}

		public static create(ast:TypeScript.FunctionDeclaration) : Method  
		{
			var result           = new Method();

			result.name          = ast.isConstructor ? "constructor" : ast.getNameText();

            var hasFlag = (val : number, flag: number) :boolean  => 
            {
                return (val & flag) !== 0;
            };

            var flags = ast.getFunctionFlags();

            if(hasFlag(flags, FunctionFlags.Public)) {
                
                result.isPublic = true;
            }

            if(hasFlag(flags, FunctionFlags.Exported)) {
                
                result.isExported = true;
            }
            
			result.isConstructor = ast.isConstructor;

			result.isStatic      = ast.isStatic();

			result.isSignature   = ast.isSignature();

			result.isCallMember  = ast.isCallMember();

			result.isDeclaration = ast.isDeclaration();

			result.isExpression  = ast.isExpression();

			result.isGetAccessor = ast.isGetAccessor();

			result.isSetAccessor = ast.isSetAccessor();

			result.isIndexer     = ast.isIndexerMember();

			Method.load_comments   (result, ast);

			Method.load_returns    (result, ast);

			Method.load_parameters (result, ast);

			return result;
		}
	}
}