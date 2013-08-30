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
/// <reference path="../loggers/NullLogger.ts" />

module TypeScript.Api {

    export interface ICompilerOptions {
    
        logger ?                   : TypeScript.ILogger;

        languageVersion  ?         : any; // TypeScript.LanguageVersion;

        moduleGenTarget ?          : any; // TypeScript.ModuleGenTarget;

        removeComments ?           : boolean;

        generateDeclarationFiles ? : boolean;

        mapSourceFiles ?           : boolean;
        
        noImplicitAny ?            : boolean;
        
        allowBool    ?             : boolean;
        
        outputMany   ?             : boolean;  
    }

    export function NormalizeCompilerOptions(options:ICompilerOptions) : ICompilerOptions {
    
        if(!options) {
        
            return {
            
                logger                   : new TypeScript.Api.NullLogger(),

                languageVersion          : typescript.LanguageVersion.EcmaScript5,

                moduleGenTarget          : typescript.ModuleGenTarget.Synchronous,

                removeComments           : true,

                generateDeclarationFiles : false,

                mapSourceFiles           : false,

                noImplicitAny            : false,

                allowBool                : false,

                outputMany               : false
            }
        }

        if(options.logger == null) {
        
            options.logger = new TypeScript.Api.NullLogger();
        }

        if(options.languageVersion) {

            switch(options.languageVersion) {

                case "EcmaScript5":

                    options.languageVersion = typescript.LanguageVersion.EcmaScript5;

                    break;

                case "EcmaScript3":

                    options.languageVersion = typescript.LanguageVersion.EcmaScript3;

                    break;

                default:

                    throw Error('ICompilerOptions: unknown languageVersion, only "EcmaScript3" or "EcmaScript5" supported')

                    break;
            }
        }
        else 
        {
            options.languageVersion = typescript.LanguageVersion.EcmaScript5;
        }

        if(options.moduleGenTarget) {

            switch(options.moduleGenTarget) {

                case "Synchronous":

                    options.moduleGenTarget = typescript.ModuleGenTarget.Synchronous;

                    break;

                case "Asynchronous":

                    options.moduleGenTarget = typescript.ModuleGenTarget.Asynchronous;

                    break;

                default:

                    throw Error('ICompilerOptions: unknown moduleGenTarget, only "Synchronous" or "Asynchronous" supported')

                    break;
            }
        }
        else
        {
            options.moduleGenTarget = typescript.ModuleGenTarget.Synchronous;
        }

        if(options.removeComments == null) {

            options.removeComments = true;
        }

        if(options.generateDeclarationFiles == null) {
            
            options.generateDeclarationFiles = false;
        }

        if(options.mapSourceFiles == null) {
            
            options.mapSourceFiles = false;
        }

        if(options.noImplicitAny == null) {
            
            options.noImplicitAny = false;
        }

        if(options.allowBool == null) {
            
            options.allowBool = false;
        }

        if(options.outputMany == null) {
            
            options.outputMany = true;
        }

        return options;
    }
}