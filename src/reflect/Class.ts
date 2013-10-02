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
/// <reference path="Variable.ts" />
/// <reference path="Type.ts" />

module TypeScript.Api {

    export class Class extends TypeScript.Api.ReflectedType {

        public methods: Method[];

        public variables: Variable[];

        public parameters: string[];

        public extends: Type[];

        public implements: Type[];

        public isExported: boolean;

        public comments: string[];

        constructor() {

            super('class')

			this.methods=[];

            this.variables=[];

            this.extends=[];

            this.implements=[];

            this.parameters=[];

            this.comments=[];

            this.isExported=false;
        }


        private static load_comments(result: TypeScript.Api.Class,ast: TypeScript.ClassDeclaration): void {

            var comments=ast.docComments();

            for(var n in comments) {

                result.comments.push(comments[n].content);
            }
        }

        private static load_parameters(result: TypeScript.Api.Class,ast: TypeScript.ClassDeclaration): void {
            
            if(ast.typeParameters) {
                
                if(ast.typeParameters.members) {

                    for(var n in ast.typeParameters.members) {

                        var parameter = <any>ast.typeParameters.members[n];

                        result.parameters.push(parameter.name.text());
                    }
                }
            }
        }

        private static load_extends(result: TypeScript.Api.Class,ast: TypeScript.ClassDeclaration): void {

            if(ast.extendsList) {

                if(ast.extendsList.members) {

                    for(var n in ast.extendsList.members) {

                        var obj=TypeScript.Api.Type.create(ast.extendsList.members[n]);

                        result.extends.push(obj);
                    }
                }
            }
        }

        private static load_implements(result: TypeScript.Api.Class,ast: TypeScript.ClassDeclaration): void {

            if(ast.implementsList) {

                if(ast.implementsList.members) {

                    for(var n in ast.implementsList.members) {

                        var obj=TypeScript.Api.Type.create(ast.implementsList.members[n]);

                        result.implements.push(obj);
                    }
                }
            }
        }

        private static load_methods(result: TypeScript.Api.Class,ast: TypeScript.ClassDeclaration): void {

            for(var n in ast.members.members) {

                var member=ast.members.members[n];

                if(member.nodeType()==typescript.NodeType.FunctionDeclaration) {

                    var obj=TypeScript.Api.Method.create(<TypeScript.FunctionDeclaration>member);

                    result.methods.push(obj);
                }
            }

        }

        private static load_variables(result: TypeScript.Api.Class,ast: TypeScript.ClassDeclaration): void {

            for(var n in ast.members.members) {

                var member=ast.members.members[n];

                if(member.nodeType()==typescript.NodeType.VariableDeclarator) {

                    var obj=TypeScript.Api.Variable.create(<TypeScript.VariableDeclarator>member);

                    result.variables.push(obj);
                }
            }
        }

        public static create(ast: TypeScript.ClassDeclaration): TypeScript.Api.Class {

            var result=new TypeScript.Api.Class();

            result.name=ast.name.actualText;

            var hasFlag=(val: number,flag: number): boolean  => {

                return (val&flag)!==0;
            };

            var flags=ast.getVarFlags();

            if(hasFlag(flags,typescript.VariableFlags.Exported)) {

                result.isExported=true;
            }

            Class.load_comments(result,ast);

            Class.load_parameters(result,ast);

            Class.load_implements(result,ast);

            Class.load_extends(result,ast);

            Class.load_methods(result,ast);

            Class.load_variables(result,ast);

            return result;
        }
    }
}