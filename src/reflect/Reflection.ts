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


// in case i need to qualify again.
//var name = _module.scope.length == 0 ? _module.name : _module.scope.join('.') + '.' + _module.name

module TypeScript.Api.Reflect  {

	export class Reflection {

		public scripts : Script[];
        
		constructor() 
		{
            this.scripts              = [];
		}
        
        private resolve_type(module_scope_stack:TypeScript.Api.Reflect.Module[],  type:TypeScript.Api.Reflect.Type) : void {
            
            if(type.resolved) return;

            var associate = (type:TypeScript.Api.Reflect.Type, reflection_type:TypeScript.Api.Reflect.ReflectionType) => {
                
                type.scope = reflection_type.scope.slice(0);
                
                if(type.name.indexOf('.') !== -1) {
                    
                    var tokens = type.name.split('.');
                    
                    type.name  = tokens[tokens.length - 1];
                }
                
                type.resolved = true;

                // generic type arguments in this scope also need resolving.
                type.arguments.forEach((_type) => { this.resolve_type(module_scope_stack, _type); });
            };
            
            // does a backwards traversal on this assumed type scope.
            var match_scope = (scope:string[], type_scope:string[]) : boolean => {
                 
                 var idx0 = scope.length      - 1;

                 var idx1 = type_scope.length - 1;
                 
                 // meaning the type is a top level scope.
                 if(idx1 < 0) return true; 

                 do{

                    var a = scope     [idx0];

                    var b = type_scope[idx1]; 
                    
                    if(a != b) return false;

                     idx0 = idx0 - 1;

                     idx1 = idx1 - 1;
                    
                 } while(idx0 > 0 && idx1 > 0);

                 return true;
            }

            // precompute assumed type name and scope.
            var tokens     = type.name.split('.');

            var type_name  = type.name;

            var type_scope = [];

            if(tokens.length > 1) {

                type_name  = tokens.pop();

                type_scope = tokens;
            }
            
            // scan through the module_scope looking for types.
            for(var i = module_scope_stack.length - 1; i >= 0; i--) {
                
                var module = module_scope_stack[i];
                    
                var module_scope = module.scope.slice(0); module_scope.push(module.name);

                if(match_scope(module_scope, type_scope)) {
                        
                    for(var n in module.classes) {

                        if(module.classes[n].name == type_name) {

                            associate(type, module.classes[n]); 

                            return;
                        }
                    }

                    for(var n in module.interfaces) {

                        if(module.interfaces[n].name == type_name) {

                            associate(type, module.interfaces[n]); 

                            return;
                        }
                    }
                }
            }

            // did not locate type....
        }


        // resolves types accessible in the reflected types local scope.
        private resolve_local_scope(reflection_type : TypeScript.Api.Reflect.ReflectionType) : void {
            
            var module_stack = [];

            var _resolve_local_scope = (reflection_type : TypeScript.Api.Reflect.ReflectionType) => {
            
                if(reflection_type.identifier == 'script') {
                
                    var __script = <TypeScript.Api.Reflect.Module>reflection_type;

                     module_stack.push(__script);

                    __script.modules.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    __script.classes.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    __script.interfaces.forEach ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 
                
                    __script.methods.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    __script.variables.forEach  ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    module_stack.pop();

                    return;
                }
            
                if(reflection_type.identifier == 'module') {
                
                    var _module = <TypeScript.Api.Reflect.Module>reflection_type;

                    module_stack.push(_module);

                    _module.modules.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    _module.classes.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    _module.interfaces.forEach ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 
                
                    _module.methods.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    _module.variables.forEach  ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    module_stack.pop();
                }

                if(reflection_type.identifier == 'class') {

                    var _class = <TypeScript.Api.Reflect.Class>reflection_type;

                    _class.implements.forEach ((_type ) => { this.resolve_type(module_stack, _type); });

                    _class.extends.forEach    ((_type ) => { this.resolve_type(module_stack, _type); });
                
                    _class.methods.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    _class.variables.forEach  ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 
                }

                if(reflection_type.identifier == 'interface') {
            
                    var _interface = <TypeScript.Api.Reflect.Interface>reflection_type;

                    _interface.extends.forEach    ((_type ) => { this.resolve_type(module_stack, _type); });
                
                    _interface.methods.forEach    ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 

                    _interface.variables.forEach  ((_reflection_type) => { _resolve_local_scope(_reflection_type); }); 
                
                }

                if(reflection_type.identifier == 'method') {
            
                    var _method = <TypeScript.Api.Reflect.Method>reflection_type;

                    this.resolve_type(module_stack, _method.returns);

                    _method.parameters.forEach((_reflection_type) => { _resolve_local_scope(_reflection_type); });
                }   
                     
                if(reflection_type.identifier == 'variable') {
            
                    var _variable = <TypeScript.Api.Reflect.Variable>reflection_type;

                    this.resolve_type(module_stack, _variable.type);
                }

                if(reflection_type.identifier == 'parameter') {
            
                    var _parameter = <TypeScript.Api.Reflect.Parameter>reflection_type;

                    this.resolve_type(module_stack, _parameter.type);                
                } 
            };
            
            _resolve_local_scope(reflection_type)
        }
        
        // resolves types accessible in the reflected types global scope.
        private resolve_global_scope(reflection_type : TypeScript.Api.Reflect.ReflectionType) : void {
            
            var module_stack = [];

            var _gather_global_scope = (reflection_type : TypeScript.Api.Reflect.ReflectionType) => {
                
                if(reflection_type.identifier == 'script') {
                
                    var _script = <TypeScript.Api.Reflect.Module>reflection_type;

                     module_stack.push(_script);

                    _script.modules.forEach ((_reflection_type) => { _gather_global_scope(_reflection_type); });

                    return;
                }
                
                if(reflection_type.identifier == 'module') {
                
                    var _module = <TypeScript.Api.Reflect.Module>reflection_type;

                    module_stack.push(_module);

                    _module.modules.forEach    ((_reflection_type) => { _gather_global_scope(_reflection_type); }); 
                }
            };

            var _resolve_global_scope = (reflection_type : TypeScript.Api.Reflect.ReflectionType) => {
            
                if(reflection_type.identifier == 'script') {
                
                    var __script = <TypeScript.Api.Reflect.Module>reflection_type;

                    __script.modules.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    __script.classes.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    __script.interfaces.forEach ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 
                
                    __script.methods.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    __script.variables.forEach  ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    return;
                }
            
                if(reflection_type.identifier == 'module') {
                
                    var _module = <TypeScript.Api.Reflect.Module>reflection_type;

                    _module.modules.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    _module.classes.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    _module.interfaces.forEach ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 
                
                    _module.methods.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    _module.variables.forEach  ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 
                }

                if(reflection_type.identifier == 'class') {

                    var _class = <TypeScript.Api.Reflect.Class>reflection_type;

                    _class.implements.forEach ((_type ) => { this.resolve_type(module_stack, _type); });

                    _class.extends.forEach    ((_type ) => { this.resolve_type(module_stack, _type); });
                
                    _class.methods.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    _class.variables.forEach  ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 
                }

                if(reflection_type.identifier == 'interface') {
            
                    var _interface = <TypeScript.Api.Reflect.Interface>reflection_type;

                    _interface.extends.forEach    ((_type ) => { this.resolve_type(module_stack, _type); });
                
                    _interface.methods.forEach    ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 

                    _interface.variables.forEach  ((_reflection_type) => { _resolve_global_scope(_reflection_type); }); 
                
                }

                if(reflection_type.identifier == 'method') {
            
                    var _method = <TypeScript.Api.Reflect.Method>reflection_type;

                    this.resolve_type(module_stack, _method.returns);

                    _method.parameters.forEach((_reflection_type) => { _resolve_global_scope(_reflection_type); });
                }   
                     
                if(reflection_type.identifier == 'variable') {
            
                    var _variable = <TypeScript.Api.Reflect.Variable>reflection_type;

                    this.resolve_type(module_stack, _variable.type);
                }

                if(reflection_type.identifier == 'parameter') {
            
                    var _parameter = <TypeScript.Api.Reflect.Parameter>reflection_type;

                    this.resolve_type(module_stack, _parameter.type);                
                } 
            };
            
            // gather the global scope.
            _gather_global_scope(reflection_type);

            // resolve..
            _resolve_global_scope(reflection_type)

        }        
        
        // resolves type references for scripts loaded 
        // into this reflection. This is required
        // for code whose types reference types
        // spanning multiple source (script) units. 
        public resolve_type_references() : void {
            
            // resolve types in the local scope. (top down)
            this.scripts.forEach((script) => {

                this.resolve_local_scope(script);

            });

            // resolve types in the global scope. (bottom up)
            this.scripts.forEach((script) => {

                this.resolve_global_scope(script);

            });
            

        }
	}
}