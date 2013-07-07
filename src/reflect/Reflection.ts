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
/// <reference path="Script.ts" />
/// <reference path="Module.ts" />
/// <reference path="Import.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Class.ts" />
/// <reference path="Method.ts" />
/// <reference path="Parameter.ts" />
/// <reference path="Variable.ts" />
/// <reference path="Type.ts" />

module TypeScript.Api.Reflect  {

    export class TypeReference {
    
        constructor(public name: string,  public type: TypeScript.Api.Reflect.ReflectionType) { }
    }

	export class Reflection {

		public scripts : Script[];

        public types   : TypeScript.Api.Reflect.TypeReference[];

		constructor() 
		{
			this.scripts = [];

            this.types   = [];
		}
        
        private load_type_references(script:TypeScript.Api.Reflect.Script) : void {
            
            var load_module_type_references = (module:TypeScript.Api.Reflect.Module) => {
                
                var name = module.scope.length == 0 ? module.name : module.scope.join('.') + '.' + module.name

                this.types.push(new TypeScript.Api.Reflect.TypeReference(name, module));

                module.interfaces.forEach((obj) => {
                      
                    var name = obj.scope.length == 0 ? obj.name : obj.scope.join('.') + '.' + obj.name

                    this.types.push(new TypeScript.Api.Reflect.TypeReference(name, obj));

                });

                module.classes.forEach((obj) => {
                    
                    var name = obj.scope.length == 0 ? obj.name : obj.scope.join('.') + '.' + obj.name

                    this.types.push(new TypeScript.Api.Reflect.TypeReference(name, obj));

                });
                module.methods.forEach((obj) => {
                       
                    var name = obj.scope.length == 0 ? obj.name : obj.scope.join('.') + '.' + obj.name

                    this.types.push(new TypeScript.Api.Reflect.TypeReference(name, obj));

                });

                module.variables.forEach((obj)=> {
                       
                    var name = obj.scope.length == 0 ? obj.name : obj.scope.join('.') + '.' + obj.name

                    this.types.push(new TypeScript.Api.Reflect.TypeReference(name, obj));
                        
                });                                                

                module.modules.forEach((obj)=> {

                    this.types.push(new TypeScript.Api.Reflect.TypeReference(name, obj));

                });
            };

            script.modules.forEach((module) => {
            
                load_module_type_references(module);

            });
        }

        
        private qualify_type(parent_type : TypeScript.Api.Reflect.ReflectionType, type:TypeScript.Api.Reflect.Type) : void {
        
            console.log('trying to qualify type ' + type.name + ' from ' + parent_type.name);
            
        }

        private qualify_reflection_type(reflection_type : TypeScript.Api.Reflect.ReflectionType) : void {
            
            if(reflection_type.identifier == 'script') {

                var __script = <TypeScript.Api.Reflect.Module>reflection_type;

                __script.modules.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                __script.classes.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                __script.interfaces.forEach ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 
                
                __script.methods.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                __script.variables.forEach  ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 
            }
                     
            if(reflection_type.identifier == 'module') {

                var _module = <TypeScript.Api.Reflect.Module>reflection_type;

                _module.modules.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                _module.classes.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                _module.interfaces.forEach ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 
                
                _module.methods.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                _module.variables.forEach  ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 
            }

            if(reflection_type.identifier == 'class') {

                var _class = <TypeScript.Api.Reflect.Class>reflection_type;

                _class.implements.forEach ((_type ) => { this.qualify_type(_class, _type); });

                _class.extends.forEach    ((_type ) => { this.qualify_type(_class, _type); });
                
                _class.methods.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                _class.variables.forEach  ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 
            }

            if(reflection_type.identifier == 'interface') {
            
                var _interface = <TypeScript.Api.Reflect.Interface>reflection_type;

                _interface.extends.forEach    ((_type ) => { this.qualify_type(_interface, _type); });
                
                _interface.methods.forEach    ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 

                _interface.variables.forEach  ((_reflection_type) => { this.qualify_reflection_type(_reflection_type); }); 
                
            }

            if(reflection_type.identifier == 'method') {
            
                var _method = <TypeScript.Api.Reflect.Method>reflection_type;

                this.qualify_type(_method, _method.returns);

                _method.parameters.forEach((_reflection_type) => { this.qualify_reflection_type(_reflection_type); });
            }   
                     
            if(reflection_type.identifier == 'variable') {
            
                var _variable = <TypeScript.Api.Reflect.Variable>reflection_type;

                this.qualify_type(_variable, _variable.type);
            }

            if(reflection_type.identifier == 'parameter') {
            
                var _parameter = <TypeScript.Api.Reflect.Parameter>reflection_type;

                this.qualify_type(_parameter, _parameter.type);                
            }
                        
        }

        
        // resolves type references for scripts loaded 
        // into this reflection. This is required
        // for code whose types reference types
        // spanning multiple source (script) units. 
        public resolve_type_references() : void {
            
            // load type_references table used in qualification.
            this.scripts.forEach((script) => {
                
                this.load_type_references (script);
                
            });

            // scan again, and resolve references. 
            this.scripts.forEach((type) => {

                this.qualify_reflection_type(type);

            });
        }
	}
}