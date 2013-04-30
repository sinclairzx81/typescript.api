//﻿
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
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
//

///<reference path='resources\EN_DiagnosticMessages.ts' />
///<reference path='core\references.ts' />
///<reference path='text\references.ts' />
///<reference path='syntax\references.ts' />
///<reference path='diagnostics.ts' />
///<reference path='flags.ts' />
///<reference path='nodeTypes.ts' />
///<reference path='hashTable.ts' />
///<reference path='ast.ts' />
///<reference path='astWalker.ts' />
///<reference path='astWalkerCallback.ts' />
///<reference path='astPath.ts' />
///<reference path='base64.ts' />
///<reference path='sourceMapping.ts' />
///<reference path='emitter.ts' />
///<reference path='types.ts' />
///<reference path='pathUtils.ts' />
///<reference path='referenceResolution.ts' />
///<reference path='precompile.ts' />
///<reference path='declarationEmitter.ts' />
///<reference path='typecheck\dataMap.ts' />
///<reference path='typecheck\pullFlags.ts' />
///<reference path='typecheck\pullDecls.ts' />
///<reference path='typecheck\pullSymbols.ts' />
///<reference path='typecheck\pullSymbolBindingContext.ts' />
///<reference path='typecheck\pullTypeResolutionContext.ts' />
///<reference path='typecheck\pullTypeResolution.ts' />
///<reference path='typecheck\pullTypeChecker.ts' />
///<reference path='typecheck\pullDeclDiffer.ts' />
///<reference path='typecheck\pullSemanticInfo.ts' />
///<reference path='typecheck\pullDeclCollection.ts' />
///<reference path='typecheck\pullSymbolBinder.ts' />
///<reference path='typecheck\pullSymbolGraph.ts' />
///<reference path='typecheck\semanticDiagnostic.ts' />
///<reference path='typecheck\pullHelpers.ts' />
///<reference path='syntaxTreeToAstVisitor.ts' />

module TypeScript {

    declare var IO;

    export interface EmitterIOHost {
        // function that can even create a folder structure if needed
        createFile(path: string, useUTF8?: boolean): ITextWriter;

        // function to check if file exists on the disk
        fileExists(path: string): boolean;

        // Function to check if the directory exists on the disk
        directoryExists(path: string): boolean;

        // Resolves the path
        resolvePath(path: string): string;
    }

    export interface PullTypeInfoAtPositionInfo {
        symbol: PullSymbol;
        ast: AST;
        enclosingScopeSymbol: PullSymbol;
        candidateSignature: PullSignatureSymbol;
        callSignatures: PullSignatureSymbol[];
        isConstructorCall: boolean;
    }

    export interface PullSymbolInfo {
        symbol: PullSymbol;
        ast: AST;
        enclosingScopeSymbol: PullSymbol;
    }

    export interface PullCallSymbolInfo {
        targetSymbol: PullSymbol;
        resolvedSignatures: TypeScript.PullSignatureSymbol[];
        candidateSignature: TypeScript.PullSignatureSymbol;
        isConstructorCall: boolean;
        ast: AST;
        enclosingScopeSymbol: PullSymbol;
    }

    export interface PullVisibleSymbolsInfo {
        symbols: PullSymbol[];
        enclosingScopeSymbol: PullSymbol;
    }

    export class Document {
        private _diagnostics: IDiagnostic[] = null;
        private _syntaxTree: SyntaxTree = null;
        public script: Script;
        public lineMap: LineMap;

        constructor(public fileName: string,
                    private compilationSettings: CompilationSettings,
                    private scriptSnapshot: IScriptSnapshot,
                    public version: number,
                    public isOpen: boolean,
                    syntaxTree: SyntaxTree) {

            if (isOpen) {
                this._syntaxTree = syntaxTree;
            }
            else {
                // Don't store the syntax tree for a closed file.
                this._diagnostics = syntaxTree.diagnostics();
            }

            this.lineMap = syntaxTree.lineMap();
            this.script = SyntaxTreeToAstVisitor.visit(syntaxTree, fileName, compilationSettings);
        }

        public diagnostics(): IDiagnostic[]{
            if (this._diagnostics === null) {
                this._diagnostics = this._syntaxTree.diagnostics();
            }

            return this._diagnostics;
        }

        public syntaxTree(): SyntaxTree {
            if (this._syntaxTree) {
                return this._syntaxTree;
            }

            return Parser.parse(
                this.fileName,
                SimpleText.fromScriptSnapshot(this.scriptSnapshot),
                TypeScript.isDTSFile(this.fileName),
                LanguageVersion.EcmaScript5);
        }

        public update(scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, textChangeRange: TextChangeRange): Document {
            var oldScript = this.script;
            var oldSyntaxTree = this._syntaxTree;

            var text = SimpleText.fromScriptSnapshot(scriptSnapshot);

            // If we don't have a text change, or we don't have an old syntax tree, then do a full
            // parse.  Otherwise, do an incremental parse.
            var newSyntaxTree = textChangeRange === null || oldSyntaxTree === null
                ? TypeScript.Parser.parse(this.fileName, text, TypeScript.isDTSFile(this.fileName))
                : TypeScript.Parser.incrementalParse(oldSyntaxTree, textChangeRange, text);

            return new Document(this.fileName, this.compilationSettings, scriptSnapshot, version, isOpen, newSyntaxTree);
        }

        public static create(fileName: string, scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, referencedFiles: IFileReference[], compilationSettings): Document {
            // for an open file, make a syntax tree and a script, and store both around.

            var syntaxTree = Parser.parse(fileName, SimpleText.fromScriptSnapshot(scriptSnapshot), TypeScript.isDTSFile(fileName), LanguageVersion.EcmaScript5);

            var document = new Document(fileName, compilationSettings, scriptSnapshot, version, isOpen, syntaxTree);
            document.script.referencedFiles = referencedFiles;

            return document;
        }

        //public static fromClosed(fileName: string, scriptSnapshot: IScriptSnapshot, script: Script, syntaxTree: SyntaxTree): Document {
        //    return new Document(fileName, scriptSnapshot, script, null, syntaxTree.diagnostics());
        //}
    }

    export class TypeScriptCompiler {
        public pullTypeChecker: PullTypeChecker = null;
        public semanticInfoChain: SemanticInfoChain = null;

        public emitOptions: EmitOptions;

        public fileNameToDocument = new TypeScript.StringHashTable();

        constructor(public diagnosticMessages = EN_DiagnosticMessages,
                    public logger: ILogger = new NullLogger(),
                    public settings: CompilationSettings = new CompilationSettings()) {
            this.emitOptions = new EmitOptions(this.settings);

            TypeScript.LocalizedDiagnosticMessages = this.diagnosticMessages;

            // Ensure that the diagnostic messages passed in contain all the diagnostic messages 
            // from the english set.
            for (var name in EN_DiagnosticMessages) {
                if (EN_DiagnosticMessages.hasOwnProperty(name)) {
                    Debug.assert(diagnosticMessages.hasOwnProperty(name));
                }
            }
        }

        public getDocument(fileName: string): Document {
            return this.fileNameToDocument.lookup(fileName);
        }

        public timeFunction(funcDescription: string, func: () => any): any {
            return TypeScript.timeFunction(this.logger, funcDescription, func);
        }

        public addSourceUnit(fileName: string,
                             scriptSnapshot: IScriptSnapshot,
                             version: number,
                             isOpen: boolean,
                             referencedFiles: IFileReference[] = []): Document {
            return this.timeFunction("addSourceUnit(" + fileName + ")", () => {
                var document = Document.create(fileName, scriptSnapshot, version, isOpen, referencedFiles, this.emitOptions.compilationSettings);
                this.fileNameToDocument.addOrUpdate(fileName, document);

                return document;
            } );
        }

        public updateSourceUnit(fileName: string, scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, textChangeRange: TextChangeRange): Document {
            return this.timeFunction("pullUpdateUnit(" + fileName + ")", () => {
                var document = this.getDocument(fileName);
                var updatedDocument = document.update(scriptSnapshot, version, isOpen, textChangeRange);

                this.fileNameToDocument.addOrUpdate(fileName, updatedDocument);

                this.pullUpdateScript(document, updatedDocument);

                return updatedDocument;
            });
        }

        private isDynamicModuleCompilation(): boolean {
            var fileNames = this.fileNameToDocument.getAllKeys();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                var document = this.getDocument(fileNames[i]);
                var script = document.script;
                if (!script.isDeclareFile && script.topLevelMod !== null) {
                    return true;
                }
            }
            return false;
        }

        private updateCommonDirectoryPath(): IDiagnostic {
            var commonComponents: string[] = [];
            var commonComponentsLength = -1;

            var fileNames = this.fileNameToDocument.getAllKeys();
            for (var i = 0, len = fileNames.length; i < len; i++) {
                var fileName = fileNames[i];
                var document = this.getDocument(fileNames[i]);
                var script = document.script;

                if (!script.isDeclareFile) {
                    var fileComponents = filePathComponents(fileName);
                    if (commonComponentsLength === -1) {
                        // First time at finding common path
                        // So common path = directory of file
                        commonComponents = fileComponents;
                        commonComponentsLength = commonComponents.length;
                    } else {
                        var updatedPath = false;
                        for (var j = 0; j < commonComponentsLength && j < fileComponents.length; j++) {
                            if (commonComponents[j] !== fileComponents[j]) {
                                // The new components = 0 ... j -1
                                commonComponentsLength = j;
                                updatedPath = true;

                                if (j === 0) {
                                    // Its error to not have common path
                                    return new Diagnostic(null, 0, 0, "Cannot find the common subdirectory path for the input files", null);
                                }

                                break;
                            }
                        }

                        // If the fileComponent path completely matched and less than already found update the length
                        if (!updatedPath && fileComponents.length < commonComponentsLength) {
                            commonComponentsLength = fileComponents.length;
                        }
                    }
                }
            }

            this.emitOptions.commonDirectoryPath = commonComponents.slice(0, commonComponentsLength).join("/") + "/";
            if (this.emitOptions.compilationSettings.outputOption.charAt(this.emitOptions.compilationSettings.outputOption.length - 1) !== "/") {
                this.emitOptions.compilationSettings.outputOption += "/";
            }

            return null;
        }

        public parseEmitOption(ioHost: EmitterIOHost): IDiagnostic {
            this.emitOptions.ioHost = ioHost;
            if (this.emitOptions.compilationSettings.outputOption === "") {
                this.emitOptions.outputMany = true;
                this.emitOptions.commonDirectoryPath = "";
                return null;
            }

            this.emitOptions.compilationSettings.outputOption = switchToForwardSlashes(this.emitOptions.ioHost.resolvePath(this.emitOptions.compilationSettings.outputOption));

            // Determine if output options is directory or file
            if (this.emitOptions.ioHost.directoryExists(this.emitOptions.compilationSettings.outputOption)) {
                // Existing directory
                this.emitOptions.outputMany = true;
            } else if (this.emitOptions.ioHost.fileExists(this.emitOptions.compilationSettings.outputOption)) {
                // Existing file
                this.emitOptions.outputMany = false;
            }
            else {
                // New File/directory
                this.emitOptions.outputMany = !isJSFile(this.emitOptions.compilationSettings.outputOption);
            }

            // Verify if options are correct
            if (this.isDynamicModuleCompilation() && !this.emitOptions.outputMany) {
                return new Diagnostic(null, 0, 0, "Cannot compile dynamic modules when emitting into single file", null);
            }

            // Parse the directory structure
            if (this.emitOptions.outputMany) {
                return this.updateCommonDirectoryPath();
            }

            return null;
        }

        public getScripts(): Script[] {
            var result: TypeScript.Script[] = [];
            var fileNames = this.fileNameToDocument.getAllKeys();

            for (var i = 0, n = fileNames.length; i < n; i++) {
                var document = this.getDocument(fileNames[i]);
                result.push(document.script);
            }

            return result;
        }

        private useUTF8ForFile(script: Script) {
            if (this.emitOptions.outputMany) {
                return this.outputScriptToUTF8(script);
            } else {
                return this.outputScriptsToUTF8(this.getScripts());
            }
        }

        static mapToDTSFileName(fileName: string, wholeFileNameReplaced: boolean) {
            return getDeclareFilePath(fileName);
        }

        private canEmitDeclarations(script?: Script) {
            if (!this.settings.generateDeclarationFiles) {
                return false;
            }

            // If its already a declare file or is resident or does not contain body 
            if (!!script && (script.isDeclareFile || script.moduleElements === null)) {
                return false;
            }

            return true;
        }

        // Caller is responsible for closing emitter.
        private emitDeclarations(document: Document, declarationEmitter?: DeclarationEmitter): DeclarationEmitter {
            var script = document.script;
            if (this.canEmitDeclarations(script)) {
                if (!declarationEmitter) {
                    var declareFileName = this.emitOptions.mapOutputFileName(document.fileName, TypeScriptCompiler.mapToDTSFileName);
                    declarationEmitter = new DeclarationEmitter(
                        declareFileName, this.useUTF8ForFile(script), this.semanticInfoChain, this.emitOptions);
                }

                declarationEmitter.fileName = document.fileName;
                declarationEmitter.emitDeclarations(script);
            }

            return declarationEmitter;
        }

        // Will not throw exceptions.
        public emitAllDeclarations(): IDiagnostic[] {
            if (this.canEmitDeclarations()) {
                var sharedEmitter: DeclarationEmitter = null;
                var fileNames = this.fileNameToDocument.getAllKeys();

                for (var i = 0, n = fileNames.length; i < n; i++) {
                    var fileName = fileNames[i];

                    try {
                        var document = this.getDocument(fileNames[i]);

                        if (this.emitOptions.outputMany) {
                            var singleEmitter = this.emitDeclarations(document);
                            if (singleEmitter) {
                                singleEmitter.close();
                            }
                        }
                        else {
                            // Create or reuse file
                            sharedEmitter = this.emitDeclarations(document, sharedEmitter);
                        }
                    }
                    catch (ex1) {
                        return Emitter.handleEmitterError(fileName, ex1);
                    }
                }

                if (sharedEmitter) {
                    try {
                        sharedEmitter.close();
                    }
                    catch (ex2) {
                        return Emitter.handleEmitterError(sharedEmitter.fileName, ex2);
                    }
                }
            }

            return [];
        }

        static mapToFileNameExtension(extension: string, fileName: string, wholeFileNameReplaced: boolean) {
            if (wholeFileNameReplaced) {
                // The complete output is redirected in this file so do not change extension
                return fileName;
            } else {
                // Change the extension of the file
                var splitFname = fileName.split(".");
                splitFname.pop();
                return splitFname.join(".") + extension;
            }
        }

        static mapToJSFileName(fileName: string, wholeFileNameReplaced: boolean) {
            return TypeScriptCompiler.mapToFileNameExtension(".js", fileName, wholeFileNameReplaced);
        }

        // Caller is responsible for closing the returned emitter.
        // May throw exceptions.
        private emit(document: Document,
                     inputOutputMapper?: (inputName: string, outputName: string) => void ,
                     emitter?: Emitter): Emitter {

            var script = document.script;
            if (!script.isDeclareFile) {
                var typeScriptFileName = document.fileName;
                if (!emitter) {
                    var javaScriptFileName = this.emitOptions.mapOutputFileName(typeScriptFileName, TypeScriptCompiler.mapToJSFileName);
                    var outFile = this.createFile(javaScriptFileName, this.useUTF8ForFile(script));

                    emitter = new Emitter(javaScriptFileName, outFile, this.emitOptions, this.semanticInfoChain);

                    if (this.settings.mapSourceFiles) {
                        var sourceMapFileName = javaScriptFileName + SourceMapper.MapFileExtension;
                        emitter.setSourceMappings(new SourceMapper(typeScriptFileName, javaScriptFileName, sourceMapFileName, outFile,
                        this.createFile(sourceMapFileName, /*isUTF8:*/ false), this.settings.emitFullSourceMapPath));
                    }

                    if (inputOutputMapper) {
                        // Remember the name of the outfile for this source file
                        inputOutputMapper(typeScriptFileName, javaScriptFileName);
                    }
                }
                else if (this.settings.mapSourceFiles) {
                    emitter.setSourceMappings(new SourceMapper(typeScriptFileName, emitter.emittingFileName, emitter.sourceMapper.sourceMapFileName, emitter.outfile,
                    emitter.sourceMapper.sourceMapOut, this.settings.emitFullSourceMapPath));
                }

                // Set location info
                emitter.setDocument(document);
                emitter.emitJavascript(script, false);
            }

            return emitter;
        }

        // Will not throw exceptions.
        public emitAll(ioHost: EmitterIOHost, inputOutputMapper?: (inputFile: string, outputFile: string) => void ): IDiagnostic[] {
            var optionsDiagnostic = this.parseEmitOption(ioHost);
            if (optionsDiagnostic) {
                return [optionsDiagnostic];
            }
            
            var startEmitTime = (new Date()).getTime();

            var fileNames = this.fileNameToDocument.getAllKeys();
            var sharedEmitter: Emitter = null;

            // Iterate through the files, as long as we don't get an error.
            for (var i = 0, n = fileNames.length; i < n; i++) {
                var fileName = fileNames[i];

                var document = this.getDocument(fileName);

                try {
                    if (this.emitOptions.outputMany) {
                        // We're outputting to mulitple files.  We don't want to reuse an emitter in that case.
                        var singleEmitter = this.emit(document, inputOutputMapper);

                        // Close the emitter after each emitted file.
                        if (singleEmitter) {
                            singleEmitter.emitSourceMapsAndClose();
                        }
                    }
                    else {
                        // We're not outputting to multiple files.  Keep using the same emitter and don't
                        // close until below.
                        sharedEmitter = this.emit(document, inputOutputMapper, sharedEmitter);
                    }
                }
                catch (ex1) {
                    return Emitter.handleEmitterError(fileName, ex1);
                }
            }

            this.logger.log("Emit: " + ((new Date()).getTime() - startEmitTime));

            if (sharedEmitter) {
                try {
                    sharedEmitter.emitSourceMapsAndClose();
                }
                catch (ex2) {
                    return Emitter.handleEmitterError(sharedEmitter.document.fileName, ex2);
                }
            }

            return [];
        }

        private outputScriptToUTF8(script: Script): boolean {
            return script.containsUnicodeChar || (this.emitOptions.compilationSettings.emitComments && script.containsUnicodeCharInComment);
        }

        private outputScriptsToUTF8(scripts: Script[]): boolean {
            for (var i = 0, len = scripts.length; i < len; i++) {
                var script = scripts[i];
                if (this.outputScriptToUTF8(script)) {
                    return true;
                }
            }
            return false;
        }

        private createFile(fileName: string, useUTF8: boolean): ITextWriter {
            // Creating files can cause exceptions, they will be caught higher up in TypeScriptCompiler.emit
            return this.emitOptions.ioHost.createFile(fileName, useUTF8);
        }

        //
        // Pull typecheck infrastructure
        //

        public pullResolveFile(fileName: string): boolean {
            if (!this.pullTypeChecker) {
                return false;
            }

            var unit = this.semanticInfoChain.getUnit(fileName);

            if (!unit) {
                return false;
            }

            this.pullTypeChecker.setUnit(fileName);
            this.pullTypeChecker.resolver.resolveBoundDecls(unit.getTopLevelDecls()[0], new PullTypeResolutionContext());

            return true;
        }

        public getSyntacticDiagnostics(fileName: string): IDiagnostic[]{
            return this.getDocument(fileName).diagnostics();
        }

        /** Used for diagnostics in tests */
        private getSyntaxTree(fileName: string): SyntaxTree {
            return this.getDocument(fileName).syntaxTree();
        }
        private getScript(fileName: string): Script {
            return this.getDocument(fileName).script;
        }

        public getSemanticDiagnostics(fileName: string): IDiagnostic[] {
            return this.timeFunction("getSemanticDiagnostics - " + fileName + ": ", () => {
                var errors: IDiagnostic[] = [];

                var unit = this.semanticInfoChain.getUnit(fileName);

                if (unit) {
                    var document = this.getDocument(fileName);
                    var script = document.script;

                    if (script) {
                        this.pullTypeChecker.typeCheckScript(script, fileName, this);

                        unit.getDiagnostics(errors);
                    }
                }

                return errors;
            } );
        }

        public pullTypeCheck() {
            return this.timeFunction("pullTypeCheck()", () => {

                this.semanticInfoChain = new SemanticInfoChain();
                this.pullTypeChecker = new PullTypeChecker(this.settings, this.semanticInfoChain);

                var declCollectionContext: DeclCollectionContext = null;
                var i: number, n: number;

                var createDeclsStartTime = new Date().getTime();

                var fileNames = this.fileNameToDocument.getAllKeys();
                for (var i = 0, n = fileNames.length; i < n; i++) {
                    var fileName = fileNames[i];
                    var document = this.getDocument(fileName);
                    var semanticInfo = new SemanticInfo(fileName);

                    declCollectionContext = new DeclCollectionContext(semanticInfo);
                    declCollectionContext.scriptName = fileName;

                    // create decls
                    getAstWalkerFactory().walk(document.script, preCollectDecls, postCollectDecls, null, declCollectionContext);

                    semanticInfo.addTopLevelDecl(declCollectionContext.getParent());

                    this.semanticInfoChain.addUnit(semanticInfo);
                }

                var createDeclsEndTime = new Date().getTime();

                // bind declaration symbols
                var bindStartTime = new Date().getTime();

                var binder = new PullSymbolBinder(this.settings, this.semanticInfoChain);

                // start at '1', so as to skip binding for global primitives such as 'any'
                for (var i = 1; i < this.semanticInfoChain.units.length; i++) {
                    binder.bindDeclsForUnit(this.semanticInfoChain.units[i].getPath());
                }

                var bindEndTime = new Date().getTime();

                var findErrorsStartTime = new Date().getTime();

                //// type check
                for (var i = 0, n = fileNames.length; i < n; i++) {
                    fileName = fileNames[i];

                    this.logger.log("Type checking " + fileName);
                    this.pullTypeChecker.typeCheckScript(this.getDocument(fileName).script, fileName, this);
                }

                var findErrorsEndTime = new Date().getTime();

                this.logger.log("Decl creation: " + (createDeclsEndTime - createDeclsStartTime));
                this.logger.log("Binding: " + (bindEndTime - bindStartTime));
                this.logger.log("    Time in findSymbol: " + time_in_findSymbol);
                this.logger.log("Find errors: " + (findErrorsEndTime - findErrorsStartTime));
            } );
        }

        private pullUpdateScript(oldDocument: Document, newDocument: Document): void {
            this.timeFunction("pullUpdateScript: ", () => {

                var oldScript = oldDocument.script;
                var newScript = newDocument.script;
                
                // want to name the new script semantic info the same as the old one
                var newScriptSemanticInfo = new SemanticInfo(oldDocument.fileName);
                var oldScriptSemanticInfo = this.semanticInfoChain.getUnit(oldDocument.fileName);

                lastBoundPullDeclId = pullDeclID;
                lastBoundPullSymbolID = pullSymbolID;

                var declCollectionContext = new DeclCollectionContext(newScriptSemanticInfo);

                declCollectionContext.scriptName = oldDocument.fileName;

                // create decls
                getAstWalkerFactory().walk(newScript, preCollectDecls, postCollectDecls, null, declCollectionContext);

                var oldTopLevelDecl = oldScriptSemanticInfo.getTopLevelDecls()[0];
                var newTopLevelDecl = declCollectionContext.getParent();

                newScriptSemanticInfo.addTopLevelDecl(newTopLevelDecl);

                var diffStartTime = new Date().getTime();
                var diffResults = PullDeclDiffer.diffDecls(oldTopLevelDecl, oldScriptSemanticInfo, newTopLevelDecl, newScriptSemanticInfo);

                var diffEndTime = new Date().getTime();
                this.logger.log("Update Script - Diff time: " + (diffEndTime - diffStartTime));

                // replace the old semantic info
                this.semanticInfoChain.updateUnit(oldScriptSemanticInfo, newScriptSemanticInfo);

                // Re-bind - we do this even if there aren't changes in the decls so as to relate the
                // existing symbols to new decls and ASTs
                var innerBindStartTime = new Date().getTime();

                var topLevelDecls = newScriptSemanticInfo.getTopLevelDecls();

                this.semanticInfoChain.update(oldDocument.fileName);

                var binder = new PullSymbolBinder(this.settings, this.semanticInfoChain);
                binder.setUnit(oldDocument.fileName);

                for (var i = 0; i < topLevelDecls.length; i++) {
                    binder.bindDeclToPullSymbol(topLevelDecls[i], true);
                }

                var innerBindEndTime = new Date().getTime();

                this.logger.log("Update Script - Inner bind time: " + (innerBindEndTime - innerBindStartTime));
                if (diffResults.length) {

                    // propagate changes
                    var graphUpdater = new PullSymbolGraphUpdater(this.semanticInfoChain);
                    var diff: PullDeclDiff;

                    var traceStartTime = new Date().getTime();
                    for (var i = 0; i < diffResults.length; i++) {
                        diff = diffResults[i];

                        if (diff.kind === PullDeclEdit.DeclRemoved) {
                            graphUpdater.removeDecl(diff.oldDecl);
                        }
                        else if (diff.kind === PullDeclEdit.DeclAdded) {
                            graphUpdater.addDecl(diff.newDecl);
                            graphUpdater.invalidateType(diff.oldDecl.getSymbol());
                        }
                        else {
                            // PULLTODO: Other kinds of edits
                            graphUpdater.invalidateType(diff.newDecl.getSymbol());
                        }
                    }

                    var traceEndTime = new Date().getTime();

                    // Don't re-typecheck or re-report errors just yet
                    //this.pullTypeChecker.typeCheckScript(newScript, newScript.locationInfo.fileName, this);

                    this.logger.log("Update Script - Trace time: " + (traceEndTime - traceStartTime));
                    this.logger.log("Update Script - Number of diffs: " + diffResults.length);
                }
            } );
        }

        public getSymbolOfDeclaration(decl: PullDecl) {
            if (!decl) {
                return null;
            }
            var ast = this.pullTypeChecker.resolver.getASTForDecl(decl);
            if (!ast) {
                return null;
            }
            var enlosingDecl = this.pullTypeChecker.resolver.getEnclosingDecl(decl);
            if (ast.nodeType === NodeType.Member) {
                return this.getSymbolOfDeclaration(enlosingDecl);
            }
            var resolutionContext = new PullTypeResolutionContext();
            return this.pullTypeChecker.resolver.resolveDeclaration(ast, resolutionContext, enlosingDecl);
        }

        public resolvePosition(pos: number, document: Document): PullTypeInfoAtPositionInfo {

            // find the enclosing decl
            var declStack: PullDecl[] = [];
            var resultASTs: AST[] = [];
            var script = document.script;
            var scriptName = document.fileName;

            var semanticInfo = this.semanticInfoChain.getUnit(scriptName);
            var lastDeclAST: AST = null;
            var foundAST: AST = null;
            var symbol: PullSymbol = null;
            var candidateSignature: PullSignatureSymbol = null;
            var callSignatures: PullSignatureSymbol[] = null;

            // these are used to track intermediate nodes so that we can properly apply contextual types
            var lambdaAST: FunctionDeclaration = null;
            var declarationInitASTs: VariableDeclarator[] = [];
            var objectLitAST: UnaryExpression = null;
            var asgAST: BinaryExpression = null;
            var typeAssertionASTs: UnaryExpression[] = [];
            var resolutionContext = new PullTypeResolutionContext();
            var inTypeReference = false;
            var enclosingDecl: PullDecl = null;
            var isConstructorCall = false;

            var pre = (cur: AST, parent: AST): AST => {
                if (isValidAstNode(cur)) {
                    if (pos >= cur.minChar && pos <= cur.limChar) {

                        var previous = resultASTs[resultASTs.length - 1];

                        if (previous === undefined || (cur.minChar >= previous.minChar && cur.limChar <= previous.limChar)) {

                            var decl = semanticInfo.getDeclForAST(cur);

                            if (decl) {
                                declStack[declStack.length] = decl;
                                lastDeclAST = cur;
                            }

                            if (cur.nodeType === NodeType.FunctionDeclaration && hasFlag((<FunctionDeclaration>cur).getFunctionFlags(), FunctionFlags.IsFunctionExpression)) {
                                lambdaAST = <FunctionDeclaration>cur;
                            }
                            else if (cur.nodeType === NodeType.VariableDeclarator) {
                                declarationInitASTs[declarationInitASTs.length] = <VariableDeclarator>cur;
                            }
                            else if (cur.nodeType === NodeType.ObjectLiteralExpression) {
                                objectLitAST = <UnaryExpression>cur;
                            }
                            else if (cur.nodeType === NodeType.CastExpression) {
                                typeAssertionASTs[typeAssertionASTs.length] = <UnaryExpression>cur;
                            }
                            else if (cur.nodeType === NodeType.AssignmentExpression) {
                                asgAST = <BinaryExpression>cur;
                            }
                            else if (cur.nodeType === NodeType.TypeRef) {
                                inTypeReference = true;
                            }

                            resultASTs[resultASTs.length] = cur;
                        }
                    }
                }
                return cur;
            }

            getAstWalkerFactory().walk(script, pre);

            if (resultASTs.length) {
                this.pullTypeChecker.setUnit(scriptName);

                foundAST = resultASTs[resultASTs.length - 1];

                // Check if is a name of a container
                if (foundAST.nodeType === NodeType.Name && resultASTs.length > 1) {
                    var previousAST = resultASTs[resultASTs.length - 2];
                    switch (previousAST.nodeType) {
                        case NodeType.InterfaceDeclaration:
                        case NodeType.ClassDeclaration:
                        case NodeType.ModuleDeclaration:
                            if (foundAST === (<NamedDeclaration>previousAST).name) {
                                foundAST = previousAST;
                            }
                            break;

                        case NodeType.VariableDeclarator:
                            if (foundAST === (<VariableDeclarator>previousAST).id) {
                                foundAST = previousAST;
                            }
                            break;

                        case NodeType.FunctionDeclaration:
                            if (foundAST === (<FunctionDeclaration>previousAST).name) {
                                foundAST = previousAST;
                            }
                            break;
                    }
                }

                // are we within a decl?  if so, just grab its symbol
                var funcDecl: FunctionDeclaration = null;
                if (lastDeclAST === foundAST) {
                    symbol = declStack[declStack.length - 1].getSymbol();
                    this.pullTypeChecker.resolver.resolveDeclaredSymbol(symbol, null, resolutionContext);
                    enclosingDecl = declStack[declStack.length - 1].getParentDecl();
                    if (foundAST.nodeType === NodeType.FunctionDeclaration) {
                        funcDecl = <FunctionDeclaration>foundAST;
                    }
                }
                else {
                    // otherwise, it's an expression that needs to be resolved, so we must pull...

                    // first, find the enclosing decl
                    for (var i = declStack.length - 1; i >= 0; i--) {
                        if (!(declStack[i].getKind() & (PullElementKind.Variable | PullElementKind.Parameter))) {
                            enclosingDecl = declStack[i];
                            break;
                        }
                    }

                    // next, obtain the assigning AST, if applicable
                    // (this would be the ast for the last decl on the decl stack)

                    // if the found AST is a named, we want to check for previous dotted expressions,
                    // since those will give us the right typing
                    var callExpression: CallExpression = null;
                    if ((foundAST.nodeType === NodeType.SuperExpression || foundAST.nodeType === NodeType.ThisExpression || foundAST.nodeType === NodeType.Name) &&
                    resultASTs.length > 1) {
                        for (var i = resultASTs.length - 2; i >= 0; i--) {
                            if (resultASTs[i].nodeType === NodeType.MemberAccessExpression &&
                            (<BinaryExpression>resultASTs[i]).operand2 === resultASTs[i + 1]) {
                                foundAST = resultASTs[i];
                            }
                            else if ((resultASTs[i].nodeType === NodeType.InvocationExpression || resultASTs[i].nodeType === NodeType.ObjectCreationExpression) &&
                            (<CallExpression>resultASTs[i]).target === resultASTs[i + 1]) {
                                callExpression = <CallExpression>resultASTs[i];
                                break;
                            } else if (resultASTs[i].nodeType === NodeType.FunctionDeclaration && (<FunctionDeclaration>resultASTs[i]).name === resultASTs[i + 1]) {
                                funcDecl = <FunctionDeclaration>resultASTs[i];
                                break;
                            } else {
                                break;
                            }
                        }
                    }

                    // if it's a list, we may not have an exact AST, so find the next nearest one
                    if (foundAST.nodeType === NodeType.List) {
                        for (var i = 0; i < (<ASTList>foundAST).members.length; i++) {
                            if ((<ASTList>foundAST).members[i].minChar > pos) {
                                foundAST = (<ASTList>foundAST).members[i];
                                break;
                            }
                        }
                    }

                    resolutionContext.resolveAggressively = true;
                    resolutionContext.searchTypeSpace = inTypeReference;

                    var inContextuallyTypedAssignment = false;

                    if (declarationInitASTs.length) {
                        var assigningAST: VariableDeclarator;
                        var varSymbol: PullSymbol;

                        for (var i = 0; i < declarationInitASTs.length; i++) {

                            assigningAST = declarationInitASTs[i];
                            inContextuallyTypedAssignment = (assigningAST !== null) && (assigningAST.typeExpr !== null);

                            this.pullTypeChecker.resolver.resolveDeclaration(assigningAST, resolutionContext);
                            varSymbol = this.semanticInfoChain.getSymbolForAST(assigningAST, scriptName);

                            if (varSymbol && inContextuallyTypedAssignment) {
                                var contextualType = varSymbol.getType();
                                resolutionContext.pushContextualType(contextualType, false, null);
                            }

                            if (assigningAST.init) {
                                this.pullTypeChecker.resolver.resolveAST(assigningAST.init, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                            }
                        }
                    }

                    if (typeAssertionASTs.length) {
                        for (var i = 0; i < typeAssertionASTs.length; i++) {
                            this.pullTypeChecker.resolver.resolveAST(typeAssertionASTs[i], inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                        }
                    }

                    if (asgAST) {
                        this.pullTypeChecker.resolver.resolveAST(asgAST, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                    }

                    if (objectLitAST) {
                        this.pullTypeChecker.resolver.resolveAST(objectLitAST, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                    }

                    if (lambdaAST) {
                        this.pullTypeChecker.resolver.resolveAST(lambdaAST, true, enclosingDecl, resolutionContext);
                        enclosingDecl = semanticInfo.getDeclForAST(lambdaAST);
                    }

                    symbol = this.pullTypeChecker.resolver.resolveAST(foundAST, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                    if (callExpression) {
                        var isPropertyOrVar = symbol.getKind() === PullElementKind.Property || symbol.getKind() === PullElementKind.Variable;
                        var typeSymbol = symbol.getType();
                        if (isPropertyOrVar) {
                            isPropertyOrVar = (typeSymbol.getKind() !== PullElementKind.Interface && typeSymbol.getKind() !== PullElementKind.ObjectType) || typeSymbol.getName() === "";
                        }

                        if (!isPropertyOrVar) {
                            isConstructorCall = foundAST.nodeType === NodeType.SuperExpression || callExpression.nodeType === NodeType.ObjectCreationExpression;

                            if (foundAST.nodeType === NodeType.SuperExpression) {
                                if (symbol.getKind() === PullElementKind.Class) {
                                    callSignatures = (<PullClassTypeSymbol>symbol).getConstructorMethod().getType().getConstructSignatures();
                                }
                            } else {
                                callSignatures = callExpression.nodeType === NodeType.InvocationExpression ? typeSymbol.getCallSignatures() : typeSymbol.getConstructSignatures();
                            }

                            var callResolutionResults = new PullAdditionalCallResolutionData();
                            if (callExpression.nodeType === NodeType.InvocationExpression) {
                                this.pullTypeChecker.resolver.resolveCallExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            } else {
                                this.pullTypeChecker.resolver.resolveNewExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            }

                            if (callResolutionResults.candidateSignature) {
                                candidateSignature = callResolutionResults.candidateSignature;
                            }
                            if (callResolutionResults.targetSymbol && callResolutionResults.targetSymbol.getName() !== "") {
                                symbol = callResolutionResults.targetSymbol;
                            }
                            foundAST = callExpression;
                        }
                    }
                }

                if (funcDecl) {
                    if (symbol && symbol.getKind() !== PullElementKind.Property) {
                        var signatureInfo = PullHelpers.getSignatureForFuncDecl(funcDecl, this.semanticInfoChain.getUnit(scriptName));
                        candidateSignature = signatureInfo.signature;
                        callSignatures = signatureInfo.allSignatures;
                    }
                } else if (!callSignatures && symbol &&
                (symbol.getKind() === PullElementKind.Method || symbol.getKind() === PullElementKind.Function)) {
                    var typeSym = symbol.getType()
                    if (typeSym) {
                        callSignatures = typeSym.getCallSignatures();
                    }
                }
            }

            var enclosingScopeSymbol = this.getSymbolOfDeclaration(enclosingDecl);

            return {
                symbol: symbol,
                ast: foundAST,
                enclosingScopeSymbol: enclosingScopeSymbol,
                candidateSignature: candidateSignature,
                callSignatures: callSignatures,
                isConstructorCall: isConstructorCall
            };
        }

        private extractResolutionContextFromPath(path: AstPath, document: Document): { ast: AST; enclosingDecl: PullDecl; resolutionContext: PullTypeResolutionContext; inContextuallyTypedAssignment: boolean; } {
            var script = document.script;
            var scriptName = document.fileName;

            var semanticInfo = this.semanticInfoChain.getUnit(scriptName);
            var enclosingDecl: PullDecl = null;
            var inContextuallyTypedAssignment = false;

            var resolutionContext = new PullTypeResolutionContext();
            resolutionContext.resolveAggressively = true;

            if (path.count() === 0) {
                return null;
            }

            this.pullTypeChecker.setUnit(semanticInfo.getPath());

            // Extract infromation from path
            for (var i = 0 , n = path.count(); i < n; i++) {
                var current = path.asts[i];

                switch (current.nodeType) {
                    case NodeType.FunctionDeclaration:
                        if (hasFlag((<FunctionDeclaration>current).getFunctionFlags(), FunctionFlags.IsFunctionExpression)) {
                            this.pullTypeChecker.resolver.resolveAST((<FunctionDeclaration>current), true, enclosingDecl, resolutionContext);
                        }

                        break;

                    case NodeType.VariableDeclarator:
                        var assigningAST = <VariableDeclarator> current;
                        inContextuallyTypedAssignment = (assigningAST.typeExpr !== null);

                        this.pullTypeChecker.resolver.resolveDeclaration(assigningAST, resolutionContext);
                        var varSymbol = this.semanticInfoChain.getSymbolForAST(assigningAST, scriptName);

                        if (varSymbol && inContextuallyTypedAssignment) {
                            var contextualType = varSymbol.getType();
                            resolutionContext.pushContextualType(contextualType, false, null);
                        }

                        if (assigningAST.init) {
                            this.pullTypeChecker.resolver.resolveAST(assigningAST.init, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                        }

                        break;

                    case NodeType.InvocationExpression:
                    case NodeType.ObjectCreationExpression:
                        var isNew = current.nodeType === NodeType.ObjectCreationExpression;
                        var callExpression = <CallExpression>current;

                        // Check if we are in an argumnt for a call, propagate the contextual typing
                        if ((i + 1 < n) && callExpression.arguments === path.asts[i + 1]) {
                            var callResolutionResults = new PullAdditionalCallResolutionData();
                            if (isNew) {
                                this.pullTypeChecker.resolver.resolveNewExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            }
                            else {
                                this.pullTypeChecker.resolver.resolveCallExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext, callResolutionResults);
                            }

                            // Find the index in the arguments list
                            if (callResolutionResults.actualParametersContextTypeSymbols) {
                                var argExpression = path.asts[i + 1].nodeType === NodeType.List ? path.asts[i + 2] : path.asts[i + 1];
                                for (var j = 0, m = callExpression.arguments.members.length; j < m; j++) {
                                    if (callExpression.arguments.members[j] === argExpression) {
                                        var callContextualType = callResolutionResults.actualParametersContextTypeSymbols[j];
                                        if (callContextualType) {
                                            resolutionContext.pushContextualType(callContextualType, false, null);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            // Just resolve the call expression
                            if (isNew) {
                                this.pullTypeChecker.resolver.resolveNewExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                            }
                            else {
                                this.pullTypeChecker.resolver.resolveCallExpression(callExpression, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                            }
                        }

                        break;

                    case NodeType.ArrayLiteralExpression:
                        this.pullTypeChecker.resolver.resolveAST(current, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);

                        // Propagate the child element type
                        var currentContextualType = resolutionContext.getContextualType();
                        if (currentContextualType && currentContextualType.isArray()) {
                            resolutionContext.pushContextualType(currentContextualType.getElementType(), false, null);
                        }

                        break;

                    case NodeType.ObjectLiteralExpression:
                        this.pullTypeChecker.resolver.resolveAST((<UnaryExpression>current), inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                        break;

                    case NodeType.AssignmentExpression:
                        this.pullTypeChecker.resolver.resolveAST((<BinaryExpression>current), inContextuallyTypedAssignment, enclosingDecl, resolutionContext);
                        break;

                    case NodeType.CastExpression:
                        if (i + 1 < n && path.asts[i + 1] === (<UnaryExpression>current).castTerm) {
                            // We are inside the cast term
                            resolutionContext.searchTypeSpace = true;
                        }

                        var typeSymbol = this.pullTypeChecker.resolver.resolveTypeAssertionExpression(current, inContextuallyTypedAssignment, enclosingDecl, resolutionContext);

                        // Set the context type
                        if (typeSymbol) {
                            resolutionContext.pushContextualType(typeSymbol, false, null);
                        }

                        break;

                    case NodeType.TypeRef:
                    case NodeType.TypeParameter:
                        resolutionContext.searchTypeSpace = true;
                        break;
                }

                // Record enclosing Decl
                var decl = semanticInfo.getDeclForAST(current);
                if (decl && !(decl.getKind() & (PullElementKind.Variable | PullElementKind.Parameter | PullElementKind.TypeParameter))) {
                    enclosingDecl = decl;
                }
            }

            // Other possible type space references
            if (path.isNameOfInterface() || path.isInClassImplementsList() || path.isInInterfaceExtendsList()) {
                resolutionContext.searchTypeSpace = true;
            }

            // if the found AST is a named, we want to check for previous dotted expressions,
            // since those will give us the right typing
            if (path.ast().nodeType === NodeType.Name && path.count() > 1) {
                for (var i = path.count() - 1; i >= 0; i--) {
                    if (path.asts[path.top - 1].nodeType === NodeType.MemberAccessExpression &&
                    (<BinaryExpression>path.asts[path.top - 1]).operand2 === path.asts[path.top]) {
                        path.pop();
                    }
                    else {
                        break;
                    }
                }
            }

            return {
                ast: path.ast(),
                enclosingDecl: enclosingDecl,
                resolutionContext: resolutionContext,
                inContextuallyTypedAssignment: inContextuallyTypedAssignment
            };
        }

        public pullGetSymbolInformationFromPath(path: AstPath, document: Document): PullSymbolInfo {
            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var symbol = this.pullTypeChecker.resolver.resolveAST(path.ast(), context.inContextuallyTypedAssignment, context.enclosingDecl, context.resolutionContext);

            return {
                symbol: symbol,
                ast: path.ast(),
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        }

        public pullGetDeclarationSymbolInformation(path: AstPath, document: Document): PullSymbolInfo {
            var script = document.script;
            var scriptName = document.fileName;

            var ast = path.ast();

            if (ast.nodeType !== NodeType.ClassDeclaration && ast.nodeType !== NodeType.InterfaceDeclaration && ast.nodeType !== NodeType.ModuleDeclaration && ast.nodeType !== NodeType.FunctionDeclaration && ast.nodeType !== NodeType.VariableDeclarator) {
                return null;
            }

            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var semanticInfo = this.semanticInfoChain.getUnit(scriptName);
            var decl = semanticInfo.getDeclForAST(ast);
            var symbol = (decl.getKind() & PullElementKind.SomeSignature) ? decl.getSignatureSymbol() : decl.getSymbol();
            this.pullTypeChecker.resolver.resolveDeclaredSymbol(symbol, null, context.resolutionContext);

            return {
                symbol: symbol,
                ast: path.ast(),
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        }

        public pullGetCallInformationFromPath(path: AstPath, document: Document): PullCallSymbolInfo {
            // AST has to be a call expression
            if (path.ast().nodeType !== NodeType.InvocationExpression && path.ast().nodeType !== NodeType.ObjectCreationExpression) {
                return null;
            }

            var isNew = (path.ast().nodeType === NodeType.ObjectCreationExpression);

            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var callResolutionResults = new PullAdditionalCallResolutionData();

            if (isNew) {
                this.pullTypeChecker.resolver.resolveNewExpression(<CallExpression>path.ast(), context.inContextuallyTypedAssignment, context.enclosingDecl, context.resolutionContext, callResolutionResults);
            }
            else {
                this.pullTypeChecker.resolver.resolveCallExpression(<CallExpression>path.ast(), context.inContextuallyTypedAssignment, context.enclosingDecl, context.resolutionContext, callResolutionResults);
            }

            return {
                targetSymbol: callResolutionResults.targetSymbol,
                resolvedSignatures: callResolutionResults.resolvedSignatures,
                candidateSignature: callResolutionResults.candidateSignature,
                ast: path.ast(),
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl),
                isConstructorCall: isNew
            };
        }

        public pullGetVisibleMemberSymbolsFromPath(path: AstPath, document: Document): PullVisibleSymbolsInfo {
            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var symbols = this.pullTypeChecker.resolver.getVisibleMembersFromExpression(path.ast(), context.enclosingDecl, context.resolutionContext);
            if (!symbols) {
                return null;
            }

            return {
                symbols: symbols,
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        }

        public pullGetVisibleSymbolsFromPath(path: AstPath, document: Document): PullVisibleSymbolsInfo {
            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var symbols = this.pullTypeChecker.resolver.getVisibleSymbols(context.enclosingDecl, context.resolutionContext);
            if (!symbols) {
                return null;
            }

            return {
                symbols: symbols,
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        }

        public pullGetContextualMembersFromPath(path: AstPath, document: Document): PullVisibleSymbolsInfo {
            // Input has to be an object literal
            if (path.ast().nodeType !== NodeType.ObjectLiteralExpression) {
                return null;
            }

            var context = this.extractResolutionContextFromPath(path, document);
            if (!context) {
                return null;
            }

            var members = this.pullTypeChecker.resolver.getVisibleContextSymbols(context.enclosingDecl, context.resolutionContext);

            return {
                symbols: members,
                enclosingScopeSymbol: this.getSymbolOfDeclaration(context.enclosingDecl)
            };
        }

        public pullGetTypeInfoAtPosition(pos: number, document: Document): PullTypeInfoAtPositionInfo {
            return this.timeFunction("pullGetTypeInfoAtPosition for pos " + pos + ":", () => {
                return this.resolvePosition(pos, document);
            });
        }

        public getTopLevelDeclarations(scriptName: string): PullDecl[] {
            this.pullResolveFile(scriptName);

            var unit = this.semanticInfoChain.getUnit(scriptName);

            if (!unit) {
                return null;
            }

            return unit.getTopLevelDecls();
        }

        public reportDiagnostics(errors: IDiagnostic[], errorReporter: TypeScript.IDignosticsReporter): void {
            for (var i = 0; i < errors.length; i++) {
                errorReporter.addDiagnostic(errors[i]);
            }
        }
    }
}