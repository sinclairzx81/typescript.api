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
/// <reference path="Type.ts" />

module TypeScript.Api {

    export class Parameter extends TypeScript.Api.ReflectedType {

        public type: Type;

        public isOptional: boolean;

        public isPublic: boolean;

        constructor() {

            super('parameter');

            this.isOptional=false;

            this.isPublic=false;

        }

        private static load_type(result: Parameter,ast: TypeScript.Parameter): void {

            if(!ast.typeExpr) {

                result.type=new TypeScript.Api.Type()

				return;
            }
            result.type=TypeScript.Api.Type.create(ast.typeExpr);
        }

        public static create(ast: TypeScript.Parameter): TypeScript.Api.Parameter {

            var result=new TypeScript.Api.Parameter();

            result.name=ast.id.actualText;

            result.isOptional=ast.isOptional;

            var hasFlag=(val: number,flag: number): boolean  => {

                return (val&flag)!==0;
            };

            var flags=ast.getVarFlags();

            if(hasFlag(flags,typescript.VariableFlags.Public)) {

                result.isPublic=true;
            }

            TypeScript.Api.Parameter.load_type(result,ast);

            return result;
        }
    }
}