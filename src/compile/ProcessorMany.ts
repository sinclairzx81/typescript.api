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
/// <reference path="../units/SourceUnit.ts" />
/// <reference path="../units/CompiledUnit.ts" />
/// <reference path="IProcessor.ts" />
/// <reference path="Input.ts" />
/// <reference path="Output.ts" />

module TypeScript.Api {

    /**
    *   ProcessorMany: Handles compilation for multiple output.
    */
    export class ProcessorMany implements TypeScript.Api.IProcessor {

        public input  : TypeScript.Api.Input;

        public output : TypeScript.Api.Output;

        constructor(public compiler: TypeScript.TypeScriptCompiler) {

            this.input  = new TypeScript.Api.Input();

            this.output = new TypeScript.Api.Output();
        }

        //-------------------------------------------------------------------------
        //  utility...
        //-------------------------------------------------------------------------
        
        private add_unit(unit: TypeScript.Api.SourceUnit) : void {

            var snapshot = typescript.ScriptSnapshot.fromString(unit.content);

            var references = typescript.getReferencedFiles(unit.path,snapshot);

            var _references = unit.references()

            for(var n in _references) {

                _references[n] = Path.relativeToAbsolute(unit.path, _references[n])
            }

            this.compiler.addSourceUnit(unit.path, snapshot, 1 /*ByteOrderMark.Utf8*/ , 0, false, _references);
        }

        private update_unit(unit: TypeScript.Api.SourceUnit): void {

            var snapshot = typescript.ScriptSnapshot.fromString(unit.content);

            var textSpan = new typescript.TextSpan(0, unit.content.length);

            var textChange = new typescript.TextChangeRange(textSpan, unit.content.length);

            this.compiler.updateSourceUnit(unit.path, snapshot, 0, false, textChange);
        }

        private syntax_check_unit(unit: TypeScript.Api.SourceUnit): void {

            var diagnostics = this.compiler.getSyntacticDiagnostics(unit.path);

            for(var i = 0;i < diagnostics.length; i++) {

                var diagnostic = new TypeScript.Api.Diagnostic("syntax", diagnostics[i].fileName(),
                                                                         diagnostics[i].text(),
                                                                         diagnostics[i].message());

                diagnostic.computeLineInfo(unit.content, diagnostics[i].start());

                unit.diagnostics.push(diagnostic);
            }
        }

        private type_check_unit(unit: TypeScript.Api.SourceUnit): void {

            var diagnostics = this.compiler.getSemanticDiagnostics(unit.path);

            for(var i = 0; i < diagnostics.length; i++) {

                var diagnostic=new TypeScript.Api.Diagnostic("typecheck", diagnostics[i].fileName(), diagnostics[i].text(), diagnostics[i].message());

                diagnostic.computeLineInfo(unit.content,diagnostics[i].start());

                unit.diagnostics.push(diagnostic);
            }
        }

        //-------------------------------------------------------------------------
        //  update phase.
        //------------------------------------------------------------------------- 
        private update_units(): void {

            for(var i = 0; i < this.input.units.length; i++) {

                var unit=this.input.units[i];

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
        }
        //-------------------------------------------------------------------------
        //  typecheck phase.
        //------------------------------------------------------------------------- 
        private run_typecheck() : void {
        
            this.compiler.pullTypeCheck();
        }

        //-------------------------------------------------------------------------
        //  diagnostics phase.
        //------------------------------------------------------------------------- 
        private run_diagnostics (): void {

            for(var i = 0; i < this.input.units.length; i++) {

                var unit=this.input.units[i];

                switch(unit.state) {

                    case 'added':

                    case 'updated':

                        unit.diagnostics = [];

                        this.syntax_check_unit(unit);

                        this.type_check_unit(unit);

                        break;

                    default:

                        break;
                }
            }
        }

        //-------------------------------------------------------------------------
        //  emit phase.
        //-------------------------------------------------------------------------
        private run_emit(): void {
        
            for(var i = 0; i < this.input.units.length; i++) {

                var unit=this.input.units[i];

                switch(unit.state) {

                    case 'added':

                    case 'updated':

                        try {

                            this.compiler.emitUnit(unit.path, this.output, (inputFile: string,outputFile: string): void => {

                                this.output.mapper[outputFile] = inputFile;
                            });

                        } catch(e) { }

                        if(this.compiler.settings.generateDeclarationFiles) {

                            try {

                                this.compiler.emitUnitDeclarations(unit.path)
                            }
                            catch(e) { }
                        }

                        break;

                    default:

                        break;
                }
            }            
        }

        //-------------------------------------------------------------------------
        //  process.
        //------------------------------------------------------------------------- 
        public process(): TypeScript.Api.CompiledUnit[] {

            this.update_units();

            this.run_typecheck();

            this.run_diagnostics();

            this.run_emit();

            // get result.
            var compiled = [];

            for(var file in this.output.files) {

                var filename = this.output.mapper[file];

                if(filename) {

                    var document = this.compiler.getDocument(filename);

                    if(document) {

                        var unit = this.input.fetch(this.output.mapper[file]);

                        if(unit) {

                            var ast         = document.script;

                            var path        = unit.path.replace(/\\/g,'/');

                            var content     = this.output.get_content(unit.path.replace(/.ts$/,'.js'));

                            var sourcemap   = this.output.get_source_map(unit.path.replace(/.ts$/,'.js.map'));

                            var declaration = this.output.get_declararion(unit.path.replace(/.ts$/,'.d.ts'));

                            var script      = this.output.get_reflection(unit.path, ast);

                            var diagnostics = unit.diagnostics;

                            var references  = unit.references();

                            compiled.push(new TypeScript.Api.CompiledUnit(path, content, diagnostics, ast, sourcemap, script, declaration, references));
                        }
                    }
                }
            }

            TypeScript.Api.TypeResolver.resolve(compiled.map((unit) => { return unit.script; }));

            // ensure that the compiled units
            // are of the same order as the source
            // units.

            var sorted = [];

            for(var n in this.input.units) {

                for(var m in compiled) {

                    if(this.input.units[n].path.replace(/\\/g,'/') == compiled[m].path) {

                        sorted.push(compiled[m]);

                        break;
                    }
                }
            }

            compiled = sorted;

            // fix file paths.

            for(var n in compiled) {
            
                compiled[n].path = compiled[n].path.replace(/.ts$/,'.js')
            }

            return compiled;

        }
    }
}