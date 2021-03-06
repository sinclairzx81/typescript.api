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

/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../units/CompiledUnit.ts" />
/// <reference path="../loggers/NullLogger.ts" />
/// <reference path="Options.ts" />
/// <reference path="IProcessor.ts" />
/// <reference path="ProcessorSingle.ts" />
/// <reference path="ProcessorMany.ts" />

module TypeScript.Api {

    export class Compiler {

        public compiler  : TypeScript.TypeScriptCompiler;

        public logger    : TypeScript.ILogger;

        public processor : TypeScript.Api.IProcessor;

        constructor(public options: TypeScript.Api.ICompilerOptions) {

            options = TypeScript.Api.NormalizeCompilerOptions(options);

            this.logger = options.logger;

            // settings...

            var settings = new typescript.CompilationSettings();

            settings.codeGenTarget            = options.languageVersion;

            settings.moduleGenTarget          = options.moduleGenTarget;

            settings.removeComments           = options.removeComments;

            settings.generateDeclarationFiles = options.generateDeclarationFiles;

            settings.mapSourceFiles           = options.mapSourceFiles;

            settings.noImplicitAny            = options.noImplicitAny;

            settings.allowBool                = options.allowBool;

            this.compiler = new typescript.TypeScriptCompiler(new TypeScript.Api.NullLogger(), settings);

            this.compiler.logger = new TypeScript.Api.NullLogger();

            if(!options.outputMany) {
                
                this.processor = new TypeScript.Api.ProcessorSingle(this.compiler);

                this.compiler.settings.outFileOption = 'output.js';

                return;
            }
            
            this.processor = new TypeScript.Api.ProcessorMany(this.compiler);
        }

        public compile(sourceUnits: TypeScript.Api.SourceUnit[], callback: { (compiledUnits: TypeScript.Api.CompiledUnit[]): void; }): void {

            this.processor.input.merge(sourceUnits);

            var compiled = this.processor.process();

            callback(compiled);
        }
    }
}