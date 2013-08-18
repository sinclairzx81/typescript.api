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
/// <reference path="../reflect/TypeResolver.ts" />
/// <reference path="../units/CompiledUnit.ts" />
/// <reference path="Input.ts" />
/// <reference path="Output.ts" />

module TypeScript.Api {

    // Processor: Manages all calls the the TypeScript compiler. 
    // handles scanning incoming sources for added and updated
    // state and informs the compiler to emit.

    export class Processor {

        public input  : TypeScript.Api.Input;

        public output : TypeScript.Api.Output;

        constructor(public compiler: TypeScript.TypeScriptCompiler) {

            this.input  = new TypeScript.Api.Input();

            this.output = new TypeScript.Api.Output();
        }

        //-------------------------------------------------------------------------
        //
        //  PREPROCESSING...
        //
        //-------------------------------------------------------------------------

        public add_unit(unit: TypeScript.Api.SourceUnit): void {

            var snapshot   = typescript.ScriptSnapshot.fromString(unit.content);

            var references = typescript.getReferencedFiles(unit.path,snapshot);

            //this.compiler.addSourceUnit(unit.path,snapshot,1 /*ByteOrderMark.Utf8*/,0,false,references);

            var _references = unit.references()

            for(var n in _references) {

                _references[n] = Path.relativeToAbsolute(unit.path, _references[n])
            }

            this.compiler.addSourceUnit(unit.path, snapshot, 1, 0, false, _references);
        }

        public update_unit(unit: TypeScript.Api.SourceUnit): void {

            var snapshot=typescript.ScriptSnapshot.fromString(unit.content);

            var textSpan=new typescript.TextSpan(0,unit.content.length);

            var textChange=new typescript.TextChangeRange(textSpan,unit.content.length);

            this.compiler.updateSourceUnit(unit.path,snapshot,0,false,textChange);
        }

        public syntax_check_unit(unit: TypeScript.Api.SourceUnit): void {

            var diagnostics=this.compiler.getSyntacticDiagnostics(unit.path);

            for(var i=0;i<diagnostics.length;i++) {

                var diagnostic=new TypeScript.Api.Diagnostic("syntax",diagnostics[i].fileName(),diagnostics[i].text(),diagnostics[i].message());

                diagnostic.computeLineInfo(unit.content,diagnostics[i].start());

                unit.diagnostics.push(diagnostic);
            }
        }

        public type_check_unit(unit: TypeScript.Api.SourceUnit): void {

            this.compiler.pullTypeCheck();

            var diagnostics = this.compiler.getSemanticDiagnostics(unit.path);

            for(var i = 0;i < diagnostics.length; i++) {

                var diagnostic = new TypeScript.Api.Diagnostic("typecheck",diagnostics[i].fileName(),diagnostics[i].text(),diagnostics[i].message());

                diagnostic.computeLineInfo(unit.content,diagnostics[i].start());

                unit.diagnostics.push(diagnostic);
            }
        }

        public emit_unit(unit: TypeScript.Api.SourceUnit): void {

            this.compiler.emitUnit(unit.path,this.output,(inputFile: string,outputFile: string): void => {

                this.output.mapper[outputFile] = inputFile;
            });
        }

        public emit_declaration(unit: TypeScript.Api.SourceUnit): void {

            try {

                this.compiler.emitUnitDeclarations(unit.path)
            }
            catch(e) { }
        }

        public preprocess(): void {

            for(var i = 0; i < this.input.units.length; i++) {

                var unit = this.input.units[i];

                switch(unit.state) {

                    case 'added':

                        this.add_unit(unit);

                        break;

                    case 'updated':

                        this.update_unit(unit);

                        break;

                    default:

                        break;
                }
            }

            for(var i = 0; i < this.input.units.length; i++) {

                var unit = this.input.units[i];

                switch(unit.state) {

                    case 'added':

                    case 'updated':

                        unit.diagnostics = [];

                        this.syntax_check_unit(unit);

                        this.type_check_unit(unit);

                        this.emit_unit(unit);

                        if(this.compiler.settings.generateDeclarationFiles) {

                            this.emit_declaration(unit)
                        }

                        break;

                    default:

                        break;
                }
            }
        }

        //-------------------------------------------------------------------------
        //
        //  THE PROCESS
        //
        //-------------------------------------------------------------------------        

        public process(): TypeScript.Api.CompiledUnit[] {

            // update the compiler
            this.preprocess();

            // get result.
            var compiled = [];

            for(var file in this.output.files) {

                var filename=this.output.mapper[file];

                if(filename) {

                    var document = this.compiler.getDocument(filename);

                    if(document) {

                        var unit = this.input.fetch(this.output.mapper[file]);

                        if(unit) {

                            var ast    = document.script;

                            var path   = unit.path.replace(/\\/g,'/');

                            var content = this.output.get_content(unit.path);

                            var sourcemap = this.output.get_source_map(unit.path);

                            var script = this.output.get_reflection(unit.path,ast);

                            var declaration = this.output.get_declararion(unit.path);

                            var diagnostics = unit.diagnostics;

                            var references = unit.references();

                            compiled.push(new TypeScript.Api.CompiledUnit(path, content, diagnostics, ast, sourcemap, script, declaration, references));
                        }
                    }
                }
            }

            // as units can be added and removed in any order,
            // this will sort the units based on the order
            // given by the input units (which are assumed
            // to be appropriately ordered first by a 
            // prior call to resolve())

            var sorted=[];

            for(var n in this.input.units) {

                for(var m in compiled) {

                    // note: can speed this up by doing the replace a bit earlier..
                    //       1) in the resolver
                    //       2) in the Processor input.
                    if(this.input.units[n].path.replace(/\\/g,'/')==compiled[m].path) {

                        sorted.push(compiled[m]);

                        break;
                    }
                }
            }

            compiled = sorted;

            // resolve type references on scripts.
            TypeScript.Api.TypeResolver.resolve(compiled.map((unit) => {

                return unit.script;
            }));

            return compiled;
        }
    }
}