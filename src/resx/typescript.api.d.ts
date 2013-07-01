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

declare module typescript.api 
{ 
    class Diagnostic 
    {
        public type       : string;
        public path       : string;
        public text       : string;
        public message    : string;
        public line_index : number;
        public char_index : number;
        public toString() : string;
    }
    
    class Import 
    {
        public name    : string;
        public alias   : string;
        public limChar : number;
        public minChar : number;
    }
 
    class Type 
    {
        public name       : string;
        public arguments  : Type[];
        public arrayCount : number;
        public limChar    : number;
        public minChar    : number;
    }
 
    class Parameter 
    {
        public name     : string;
        public type     : typescript.api.Type;
        public limChar  : number;
        public minChar  : number;  
    }
 
    class Method 
    {
        public name          : string;
        public parameters    : typescript.api.Parameter[];
        public returns       : typescript.api.Type;
        public isStatic      : boolean;
        public isAccessor    : boolean;
        public isSignature   : boolean;
        public isConstructor : boolean;
        public isCallMember  : boolean;
        public isDeclaration : boolean;
        public isExpression  : boolean;
        public isGetAccessor : boolean;
        public isSetAccessor : boolean;
        public isIndexer     : boolean;
        public comments      : string[];
        public limChar       : number;
        public minChar       : number;
    }
 
    class Variable 
    {
        public name          : string;
        public type          : typescript.api.Type;
        public isProperty    : boolean;
        public isStatic      : boolean;
        public isStatement   : boolean;
        public isExpression  : boolean;
        public isStatementOrExpression: boolean;
        public isExported    : boolean;
        public comments      : string[];
        public limChar       : number;
        public minChar       : number;
    }
 
    class Interface 
    {
        public methods    : typescript.api.Method[];
        public variables  : typescript.api.Variable[];
        public parameters : string[];
        public extends    : typescript.api.Type[];
        public name       : string;
        public limChar    : number;
        public minChar    : number;
    }
 
    class Class 
    {
        public methods    : typescript.api.Method[];
        public variables  : typescript.api.Variable[];
        public parameters : string[];
        public extends    : typescript.api.Type[];
        public implements : typescript.api.Type[];
        public name       : string;
        public limChar    : number;
        public minChar    : number;
    }
 
    class Module 
    {
        public imports    : typescript.api.Import[];
        public modules    : typescript.api.Module[];
        public interfaces : typescript.api.Interface[];
        public classes    : typescript.api.Class[];
        public methods    : typescript.api.Method[];
        public variables  : typescript.api.Variable[];
        public name       : string;
        public limChar    : number;
        public minChar    : number;
    }
 
    class Script 
    {
        public path       : string;
        public modules    : typescript.api.Module[];
        public interfaces : typescript.api.Interface[];
        public classes    : typescript.api.Class[];
        public methods    : typescript.api.Method[];
        public variables  : typescript.api.Variable[];
    }
 
    class Reflection 
    {
        public scripts: typescript.api.Script[];
    }
    
    class Unit 
    {
        public path        : string;
        public content     : string;
        public diagnostics : typescript.api.Diagnostic[];
        public hasError()  : boolean;
    }
 
    class SourceUnit extends typescript.api.Unit 
    {
        public remote        : boolean;
        public syntaxChecked : boolean;
        public typeChecked   : boolean;
    }
         
    class CompiledUnit extends typescript.api.Unit 
    {
        public ast          : any;
        public declaration  : string;
        public sourcemap    : string;
        public reflection   : typescript.api.Script;
        public references() : string[];
    }

    export var allowRemote 			: boolean; 

    export var debug       		    : boolean;

    export var languageVersion      : string;

    export var moduleTarget         : string;

    export function register ()     : void;

    export function check    (units : typescript.api.Unit[]) : boolean;

    export function reset    () : void;

    export function create   (path:string, content:string) : typescript.api.SourceUnit  

    export function resolve  (sources:string[], callback : (units : typescript.api.SourceUnit[] ) => void) : void;  

    export function sort     (sourceUnits: typescript.api.SourceUnit[]) : typescript.api.SourceUnit[];

    export function compile (sourceUnits: typescript.api.SourceUnit[], callback : (compiledUnit:typescript.api.CompiledUnit[] )=> void) : void;
 
    export function reflect (compiledUnits:typescript.api.CompiledUnit [], callback :{ ( reflection:typescript.api.Reflection ): void; }) : void;

    export function run     (compiledUnits:typescript.api.CompiledUnit[], sandbox:any, callback :{ (context:any): void; }) : void;

    export function build   (filenames:string[], callback :(diagnostics:typescript.api.Diagnostic[], source:string, declaration:string )=> void) : void;

}