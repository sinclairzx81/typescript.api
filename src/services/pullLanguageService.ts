// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescriptServices.ts' />

module Services {
    export class LanguageService implements ILanguageService {
        private logger: TypeScript.ILogger;
        private compilerState: CompilerState;
        private formattingRulesProvider: TypeScript.Formatting.RulesProvider;

        private currentFileName: string = "";
        private currentFileVersion: number = -1;
        private currentFileSyntaxTree: TypeScript.SyntaxTree = null;

        constructor(public host: ILanguageServiceHost) {
            this.logger = this.host;
            this.compilerState = new CompilerState(this.host);
        }

        public refresh(): void {
            TypeScript.timeFunction(this.logger, "refresh()", () => {
                this.compilerState.refresh();
            });
        }

        private minimalRefresh(): void {
            TypeScript.timeFunction(this.logger, "minimalRefresh()", () => {
                this.compilerState.minimalRefresh();
            });
        }

        public getReferencesAtPosition(fileName: string, pos: number): ReferenceEntry[] {
            this.refresh();

            var result: ReferenceEntry[] = [];

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;
              
            /// TODO: this does not allow getting references on "constructor"

            var path = this.getAstPathToPosition(script, pos);
            if (path.ast() === null || path.ast().nodeType !== TypeScript.NodeType.Name) {
                this.logger.log("No name found at the given position");
                return result;
            }

            var symbolInfoAtPosition = this.compilerState.getSymbolInformationFromPath(path, document);
            if (symbolInfoAtPosition === null || symbolInfoAtPosition.symbol === null) {
                this.logger.log("No symbol found at the given position");
                return result;
            }

            var symbol = symbolInfoAtPosition.symbol;
            
            var fileNames = this.compilerState.getFileNames();
            for (var i = 0, len = fileNames.length; i < len; i++) {
                result = result.concat(this.getReferencesInFile(fileNames[i], symbol));
            }

            return result;
        }

        public getOccurrencesAtPosition(fileName: string, pos: number): ReferenceEntry[]{
            this.refresh();

            var result: ReferenceEntry[] = [];

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            /// TODO: this does not allow getting references on "constructor"

            var path = this.getAstPathToPosition(script, pos);
            if (path.ast() === null || path.ast().nodeType !== TypeScript.NodeType.Name) {
                this.logger.log("No name found at the given position");
                return result;
            }

            var symbolInfoAtPosition = this.compilerState.getSymbolInformationFromPath(path, document);
            if (symbolInfoAtPosition === null || symbolInfoAtPosition.symbol === null) {
                this.logger.log("No symbol found at the given position");
                return result;
            }

            var symbol = symbolInfoAtPosition.symbol;
            return this.getReferencesInFile(fileName, symbol);
        }

        public getImplementorsAtPosition(fileName: string, position: number): ReferenceEntry[] {
            return [];
        }

        private getReferencesInFile(fileName: string, symbol: TypeScript.PullSymbol): ReferenceEntry[] {
            var result: ReferenceEntry[] = [];
            var symbolName = symbol.getDisplayName();
            
            var possiblePositions = this.getPossibleSymbolReferencePositions(fileName, symbol);
            if (possiblePositions && possiblePositions.length > 0) {
                var document = this.compilerState.getDocument(fileName);
                var script = document.script;

                possiblePositions.forEach(p => {
                    var path = this.getAstPathToPosition(script, p);
                    if (path.ast() === null || path.ast().nodeType !== TypeScript.NodeType.Name) {
                        return;
                    }

                    var searchSymbolInfoAtPosition = this.compilerState.getSymbolInformationFromPath(path, document);
                    if (searchSymbolInfoAtPosition !== null && searchSymbolInfoAtPosition.symbol === symbol) {
                        var isWriteAccess = false; // this.isWriteAccess(searchSymbolInfoAtPosition.ast, searchSymbolInfoAtPosition.parentAST);
                        result.push(new ReferenceEntry(fileName, searchSymbolInfoAtPosition.ast, isWriteAccess));
                    }
                });
            }
            

            return result;
        }

        private getPossibleSymbolReferencePositions(fileName: string, symbol: TypeScript.PullSymbol): number []{
            var positions: number[] = [];

            /// TODO: Cache symbol existence for files to save text search
            /// TODO: Use a smarter search mechanism to avoid picking up partial matches, matches in comments and in string literals

            var sourceText = this.compilerState.getScriptSnapshot(fileName);
            var text = sourceText.getText(0, sourceText.getLength());
            var symbolName = symbol.getDisplayName();

            var position = text.indexOf(symbolName);
            while (position >= 0) {
                positions.push(position);
                position = text.indexOf(symbolName, position + symbolName.length + 1);
            }

            return positions;
        }

        public getSignatureAtPosition(fileName: string, position: number): SignatureInfo {
            this.refresh();

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            // If "pos" is the "EOF" position
            var atEOF = (position === script.limChar);

            var path = this.getAstPathToPosition(script, position);
            if (path.count() == 0) {
                return null;
            }

            // First check whether we are in a comment where quick info should not be displayed
            if (path.nodeType() === TypeScript.NodeType.Comment) {
                this.logger.log("position is inside a comment");
                return null;
            }

            // Find call expression
            while (path.count() >= 2) {
                if (path.ast().nodeType === TypeScript.NodeType.InvocationExpression ||
                    path.ast().nodeType === TypeScript.NodeType.ObjectCreationExpression ||  // Valid call or new expressions
                    path.isTargetOfCall() || path.isTargetOfNew() || // If on target eg. fo/*caretPos*/o no signature help
                    (path.isDeclaration() && position > path.ast().minChar)) // Its a declaration node - call expression cannot be in parent scope
                {
                    break;
                }

                path.pop();
            }

            if (path.ast().nodeType !== TypeScript.NodeType.InvocationExpression && path.ast().nodeType !== TypeScript.NodeType.ObjectCreationExpression) {
                this.logger.log("No call expression for the given position");
                return null;
            }

            var callExpression = <TypeScript.CallExpression>path.ast();
            var isNew = (callExpression.nodeType === TypeScript.NodeType.ObjectCreationExpression);

            //var closeParenLimChar = Math.max(callExpression.arguments.minChar, callExpression.arguments.limChar + callExpression.arguments.trailingTriviaWidth);
            if (position < callExpression.target.limChar + callExpression.target.trailingTriviaWidth || position > callExpression.arguments.limChar + callExpression.arguments.trailingTriviaWidth) {
                this.logger.log("Outside argument list");
                return null;
            }

            // Resolve symbol
            var callSymbolInfo = this.compilerState.getCallInformationFromPath(path, document);
            if (!callSymbolInfo || !callSymbolInfo.targetSymbol || !callSymbolInfo.resolvedSignatures) {
                this.logger.log("Could not find symbol for call expression");
                return null;
            }

            // Build the result
            var result = new SignatureInfo();

            result.formal = this.convertSignatureSymbolToSignatureInfo(callSymbolInfo.targetSymbol, isNew, callSymbolInfo.resolvedSignatures, callSymbolInfo.enclosingScopeSymbol);
            result.actual = this.convertCallExprToActualSignatureInfo(callExpression, position);
            result.activeFormal = (callSymbolInfo.resolvedSignatures && callSymbolInfo.candidateSignature) ? callSymbolInfo.resolvedSignatures.indexOf(callSymbolInfo.candidateSignature) : -1;
            
            if (result.actual === null || result.formal === null || result.activeFormal === null) {
                this.logger.log("Can't compute actual and/or formal signature of the call expression");
                return null;
            }

            return result;
        }

        private convertSignatureSymbolToSignatureInfo(symbol: TypeScript.PullSymbol, isNew: boolean, signatures: TypeScript.PullSignatureSymbol[], enclosingScopeSymbol: TypeScript.PullSymbol) {
            var signatureGroup: FormalSignatureItemInfo[] = [];

            var hasOverloads = signatures.length > 1;
            signatures
                // Same test as in "typeFlow.str: resolveOverload()": filter out the definition signature if there are overloads
                .filter(signature => !(hasOverloads && signature.isDefinition()))
                .forEach(signature => {
                    var signatureGroupInfo = new FormalSignatureItemInfo();
                    var paramIndexInfo: number[] = [];
                    var functionName = signature.getScopedNameEx(enclosingScopeSymbol).toString();
                    if (!functionName) {
                        functionName = symbol.getDisplayName();
                    }
                    var signatureMemberName = signature.getSignatureTypeNameEx(functionName, false, false, enclosingScopeSymbol, true);
                    signatureGroupInfo.signatureInfo = TypeScript.MemberName.memberNameToString(signatureMemberName, paramIndexInfo);
                    signatureGroupInfo.docComment = this.compilerState.getDocComments(signature);
                    var parameters = signature.getParameters();
                    parameters.forEach((p, i) => {
                        var signatureParameterInfo = new FormalParameterInfo();
                        signatureParameterInfo.isVariable = signature.hasVariableParamList() && (i === parameters.length - 1);
                        signatureParameterInfo.name = p.getDisplayName();
                        signatureParameterInfo.docComment = this.compilerState.getDocComments(p);
                        signatureParameterInfo.minChar = paramIndexInfo[2 * i];
                        signatureParameterInfo.limChar = paramIndexInfo[2 * i + 1];
                        signatureGroupInfo.parameters.push(signatureParameterInfo);
                    });
                    signatureGroup.push(signatureGroupInfo);
                });
            return signatureGroup;
        }

        private convertCallExprToActualSignatureInfo(ast: TypeScript.CallExpression, caretPosition: number): ActualSignatureInfo {
            if (!TypeScript.isValidAstNode(ast))
                return null;

            if (!TypeScript.isValidAstNode(ast.arguments))
                return null;

            var result = new ActualSignatureInfo();
            result.openParenMinChar = ast.arguments.minChar;
            result.closeParenLimChar = Math.max(ast.arguments.minChar, ast.arguments.limChar + ast.arguments.trailingTriviaWidth);

            result.currentParameter = 0;
            for (var index = 0; index < ast.arguments.members.length; index++) {
                if (caretPosition > ast.arguments.members[index].limChar + ast.arguments.members[index].trailingTriviaWidth) {
                    result.currentParameter++;
                }
            }

            return result;
        }

        public getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo {
            this.refresh();

            var result: DefinitionInfo = null;

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            var path = this.getAstPathToPosition(script, position);
            if (path.count() == 0) {
                return null;
            }

            var symbolInfo = this.compilerState.getSymbolInformationFromPath(path, document);
            if (symbolInfo == null || symbolInfo.symbol == null) {
                this.logger.log("No identifier at the specified location.");
                return result;
            }

            var declarations = symbolInfo.symbol.getDeclarations();
            if (declarations == null || declarations.length === 0) {
                this.logger.log("Could not find declaration for symbol.");
                return result;
            }

            var symbolName = symbolInfo.symbol.getDisplayName();
            var symbolKind = this.mapPullElementKind(symbolInfo.symbol.getKind(), symbolInfo.symbol);//this.getSymbolElementKind(sym),
            var container = symbolInfo.symbol.getContainer();
            var containerName = container ? container.getDisplayName() : "<global>";//this.getSymbolContainerName(sym)
            var containerKind = "";//this.getSymbolContainerKind(sym)

            var entries: DefinitionInfo[] = [];
            var mainEntry = 0;
            for (var i = 0, n = declarations.length; i < n; i++) {
                var declaration = declarations[i];
                var span = declaration.getSpan();

                // For functions, pick the definition to be the main entry
                var signature = declaration.getSignatureSymbol();
                if (signature && signature.isDefinition()) {
                    mainEntry = i;
                }
                // TODO: find a better way of selecting the main entry for none-function overloaded types instead of selecting the first one

                entries.push(new DefinitionInfo(declaration.getScriptName(), span.start(), span.end(), symbolKind, symbolName, containerKind, containerName, null));
            }

            result = entries[mainEntry];
            if (entries.length > 1) {
                // Remove the main entry
                entries.splice(mainEntry, 1);
                result.overloads = entries;
            }
            
            return result;
        }

        public getNavigateToItems(searchValue: string): NavigateToItem[] {
            return null;
        }

        public getScriptLexicalStructure(fileName: string): NavigateToItem[] {
            this.refresh();

            var declarations = this.compilerState.getTopLevelDeclarations(fileName);
            if (!declarations) {
                return null;
            }

            var result: NavigateToItem[] = [];
            this.mapPullDeclsToNavigateToItem(declarations, result);
            return result;
        }

        private mapPullDeclsToNavigateToItem(declarations: TypeScript.PullDecl[], result: NavigateToItem[], parentSymbol?: TypeScript.PullSymbol, parentkindName?: string, includeSubcontainers:boolean = true): void {
            for (var i = 0, n = declarations.length; i < n; i++) {
                var declaration = declarations[i];
                var symbol = declaration.getSymbol();
                var kindName = this.mapPullElementKind(declaration.getKind(), symbol);
                var fileName = declaration.getScriptName();

                if (this.shouldIncludeDeclarationInNavigationItems(declaration, includeSubcontainers)) {
                    var item = new NavigateToItem();
                    item.name = this.getNavigationItemDispalyName(declaration);
                    item.matchKind = MatchKind.exact;
                    item.kind = kindName;
                    item.kindModifiers = symbol ? this.getScriptElementKindModifiers(symbol) : "";
                    item.fileName = fileName;
                    item.minChar = declaration.getSpan().start();
                    item.limChar = declaration.getSpan().end();
                    item.containerName = parentSymbol ? parentSymbol.fullName() : "";
                    item.containerKind = parentkindName || "";

                    result.push(item);
                }
                
                if (includeSubcontainers && this.isContainerDeclaration(declaration)) {
                    // process child declarations
                    this.mapPullDeclsToNavigateToItem(declaration.getChildDecls(), result, symbol, kindName, /*includeSubcontainers*/ true);

                    if (symbol) {
                        // Process declarations in other files
                        var otherDeclarations = symbol.getDeclarations();
                        if (otherDeclarations.length > 1) {
                            for (var j = 0, m = otherDeclarations.length; j < m; j++) {
                                var otherDeclaration = otherDeclarations[j];
                                if (otherDeclaration.getScriptName() === fileName) {
                                    // this has already been processed 
                                    continue;
                                }
                                this.mapPullDeclsToNavigateToItem(otherDeclaration.getChildDecls(), result, symbol, kindName, /*includeSubcontainers*/ false);
                            }
                        }
                    }
                }
            }
        }

        private isContainerDeclaration(declaration: TypeScript.PullDecl): boolean {
            switch (declaration.getKind()) {
                case TypeScript.PullElementKind.Script:
                case TypeScript.PullElementKind.Container:
                case TypeScript.PullElementKind.Class:
                case TypeScript.PullElementKind.Interface:
                case TypeScript.PullElementKind.DynamicModule:                
                case TypeScript.PullElementKind.Enum:
                    return true;
            }

            return false;
        }

        private shouldIncludeDeclarationInNavigationItems(declaration: TypeScript.PullDecl, includeSubcontainers: boolean): boolean {
            switch (declaration.getKind()) {
                case TypeScript.PullElementKind.Script:
                    // Do not include the script item
                    return false;
                case TypeScript.PullElementKind.Variable:
                case TypeScript.PullElementKind.Property:
                    // Do not include the value side of modules or classes, as thier types has already been included
                    var symbol = declaration.getSymbol();
                    return !this.isModule(symbol) && !this.isDynamicModule(symbol)  && !this.isConstructorMethod(symbol) && !this.isClass(symbol);
                case TypeScript.PullElementKind.EnumMember:
                    // Ignore the _map for enums. this should be removed once enum new implmentation is in place
                    return declaration.getName() !== "_map";
                case TypeScript.PullElementKind.FunctionExpression:
                case TypeScript.PullElementKind.Function:
                    // Ignore anonomus functions
                    return declaration.getName() !== "";
            }

            if (this.isContainerDeclaration(declaration)) {
                return includeSubcontainers;
            }

            return true;
        }

        private getNavigationItemDispalyName(declaration: TypeScript.PullDecl): string {
            switch (declaration.getKind()) {
                case TypeScript.PullElementKind.ConstructorMethod:
                    return "constructor";
                case TypeScript.PullElementKind.CallSignature:
                    return "()";
                case TypeScript.PullElementKind.ConstructSignature:
                    return "new()";
                case TypeScript.PullElementKind.IndexSignature:
                    return "[]";
            }

            return declaration.getDisplayName();
        }

        public getSyntacticDiagnostics(fileName: string): TypeScript.IDiagnostic[] {
            this.compilerState.refresh();
            return this.compilerState.getSyntacticDiagnostics(fileName);
        }

        public getSemanticDiagnostics(fileName: string): TypeScript.IDiagnostic[] {
            this.compilerState.refresh();
            return this.compilerState.getSemanticDiagnostics(fileName);
        }

        public getEmitOutput(fileName: string): IOutputFile[] {
            return [];
        }

        ///
        /// Return the stack of AST nodes containing "position"
        ///
        public getAstPathToPosition(script: TypeScript.AST, pos: number, useTrailingTriviaAsLimChar = true, options = TypeScript.GetAstPathOptions.Default): TypeScript.AstPath {
            if (this.logger.information()) {
                this.logger.log("getAstPathToPosition(" + script + ", " + pos + ")");
            }

            return TypeScript.getAstPathToPosition(script, pos, useTrailingTriviaAsLimChar, options);
        }

        public getIdentifierPathToPosition(script: TypeScript.AST, pos: number): TypeScript.AstPath {
            this.logger.log("getIdentifierPathToPosition(" + script + ", " + pos + ")");

            var path = this.getAstPathToPosition(script, pos, true, TypeScript.GetAstPathOptions.EdgeInclusive);
            if (path.count() == 0)
                return null;

            if (path.nodeType() !== TypeScript.NodeType.Name) {
                return null;
            }

            return path;
        }

        private getFullNameOfSymbol(symbol: TypeScript.PullSymbol, enclosingScopeSymbol: TypeScript.PullSymbol) {
            var container = symbol.getContainer();
            if (this.isLocal(symbol) ||
                symbol.getKind() == TypeScript.PullElementKind.Parameter) {
                // Local var
                return symbol.getScopedName(enclosingScopeSymbol);
            }

            if (symbol.getKind() == TypeScript.PullElementKind.Primitive) {
                // Primitive type symbols - do not use symbol name
                return "";
            }

            return symbol.fullName(enclosingScopeSymbol);
        }

        //
        // New Pull stuff
        //

        private getTypeInfoEligiblePath(fileName: string, position: number, isConstructorValidPosition: boolean) {
            this.refresh();

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            var path = this.getAstPathToPosition(script, position, false);
            if (path.count() == 0) {
                return null;
            }

            var cur = path.ast();
            switch (cur.nodeType) {
                default:
                    return null;
                case TypeScript.NodeType.FunctionDeclaration:
                    var funcDecl = <TypeScript.FunctionDeclaration>cur;
                    // constructor keyword
                    if (!isConstructorValidPosition || !funcDecl.isConstructor || !(position >= funcDecl.minChar && position <= funcDecl.minChar + 11 /*constructor*/)) {
                        return null;
                    }
                case TypeScript.NodeType.MemberAccessExpression:
                case TypeScript.NodeType.SuperExpression:
                case TypeScript.NodeType.StringLiteral:
                case TypeScript.NodeType.ThisExpression:
                case TypeScript.NodeType.Name:
                    return path;
            }
        }

        public getTypeAtPosition(fileName: string, position: number): TypeInfo {
            var path = this.getTypeInfoEligiblePath(fileName, position, true);
            if (!path) {
                return null;
            }

            var document = this.compilerState.getDocument(fileName);
            var ast: TypeScript.AST;
            var symbol: TypeScript.PullSymbol;
            var typeSymbol: TypeScript.PullTypeSymbol;
            var enclosingScopeSymbol: TypeScript.PullSymbol;
            var isCallExpression: boolean = false;
            var resolvedSignatures: TypeScript.PullSignatureSymbol[];
            var candidateSignature: TypeScript.PullSignatureSymbol;
            var isConstructorCall: boolean;

            if (path.isNameOfClass() || path.isNameOfInterface() || path.isNameOfFunction() || path.isNameOfVariable()) {
                // Skip the name and get to the declaration
                path.pop();
            }
            
            if (path.isDeclaration()) {
                var declarationInformation = this.compilerState.getDeclarationSymbolInformation(path, document);

                ast = declarationInformation.ast;
                symbol = declarationInformation.symbol;
                enclosingScopeSymbol = declarationInformation.enclosingScopeSymbol;

                if (path.ast().nodeType === TypeScript.NodeType.FunctionDeclaration) {
                    var funcDecl = <TypeScript.FunctionDeclaration>(path.ast());
                    if (symbol && symbol.getKind() != TypeScript.PullElementKind.Property) {
                        var signatureInfo = TypeScript.PullHelpers.getSignatureForFuncDecl(funcDecl, this.compilerState.getSemanticInfoChain().getUnit(fileName));
                        isCallExpression = true;
                        candidateSignature = signatureInfo.signature;
                        resolvedSignatures = signatureInfo.allSignatures;
                    }
                }
            }
            else if (path.isCallExpression() || path.isCallExpressionTarget()) {
                // If this is a call we need to get the call singuatures as well
                // Move the cursor to point to the call expression
                while (!path.isCallExpression()) {
                    path.pop();
                }

                // Get the call expression symbol
                var callExpressionInformation = this.compilerState.getCallInformationFromPath(path, document);

                if (!callExpressionInformation.targetSymbol) {
                    return null;
                }

                ast = callExpressionInformation.ast;
                symbol = callExpressionInformation.targetSymbol;
                enclosingScopeSymbol = callExpressionInformation.enclosingScopeSymbol;

                // Check if this is a property or a variable, if so do not treat it as a fuction, but rather as a variable with function type
                var isPropertyOrVar = symbol.getKind() == TypeScript.PullElementKind.Property || symbol.getKind() == TypeScript.PullElementKind.Variable;
                typeSymbol = symbol.getType();
                if (isPropertyOrVar) {
                    if (typeSymbol.getName() != "") {
                        symbol = typeSymbol;
                    }
                    isPropertyOrVar = (typeSymbol.getKind() != TypeScript.PullElementKind.Interface && typeSymbol.getKind() != TypeScript.PullElementKind.ObjectType) || typeSymbol.getName() == "";
                }

                if (!isPropertyOrVar) {
                    isCallExpression = true;
                    resolvedSignatures = callExpressionInformation.resolvedSignatures;
                    candidateSignature = callExpressionInformation.candidateSignature;
                    isConstructorCall = callExpressionInformation.isConstructorCall;
                }
            }
            else {
                var symbolInformation = this.compilerState.getSymbolInformationFromPath(path, document);

                if (!symbolInformation.symbol) {
                    return null;
                }

                ast = symbolInformation.ast;
                symbol = symbolInformation.symbol;
                enclosingScopeSymbol = symbolInformation.enclosingScopeSymbol;

               
                if (symbol.getKind() === TypeScript.PullElementKind.Method || symbol.getKind() == TypeScript.PullElementKind.Function) {
                    typeSymbol = symbol.getType()
                    if (typeSymbol) {
                        isCallExpression = true;
                        resolvedSignatures = typeSymbol.getCallSignatures();
                    }
                }
            }

            if (resolvedSignatures && (!candidateSignature || candidateSignature.isDefinition())) {
                for (var i = 0, len = resolvedSignatures.length; i < len; i++) {
                    if (len > 1 && resolvedSignatures[i].isDefinition()) {
                        continue;
                    }

                    candidateSignature = resolvedSignatures[i];
                    break;
                }
            }

            var memberName = isCallExpression ?
            TypeScript.PullSignatureSymbol.getSignatureTypeMemberName(candidateSignature, resolvedSignatures, enclosingScopeSymbol) :
            symbol.getTypeNameEx(enclosingScopeSymbol, true);
            var kind = this.mapPullElementKind(symbol.getKind(), symbol, !isCallExpression, isCallExpression, isConstructorCall);
            var docComment = this.compilerState.getDocComments(candidateSignature || symbol, !isCallExpression);
            var symbolName = this.getFullNameOfSymbol(symbol, enclosingScopeSymbol);
            var minChar = ast ? ast.minChar : -1;
            var limChar = ast ? ast.limChar : -1;

            return new TypeInfo(memberName, docComment, symbolName, kind, minChar, limChar);
        }

        public getCompletionsAtPosition(fileName: string, position: number, isMemberCompletion: boolean): CompletionInfo {
            this.refresh();

            var completions = new CompletionInfo();

            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            if (this.isCompletionListBlocker(document.syntaxTree(), position)) {
                this.logger.log("Returning an empty list because completion was blocked.");
                return null;
            }

            var path = this.getAstPathToPosition(script, position);

            var isRightOfDot = false;
            if (path.count() >= 1 &&
                path.asts[path.top].nodeType === TypeScript.NodeType.MemberAccessExpression
                && (<TypeScript.BinaryExpression>path.asts[path.top]).operand1.limChar < position) {
                isRightOfDot = true;
                path.push((<TypeScript.BinaryExpression>path.asts[path.top]).operand1);
            }
            else if (path.count() >= 2 &&
                    path.asts[path.top].nodeType === TypeScript.NodeType.Name &&
                    path.asts[path.top - 1].nodeType === TypeScript.NodeType.MemberAccessExpression &&
                    (<TypeScript.BinaryExpression>path.asts[path.top - 1]).operand2 === path.asts[path.top]) {
                isRightOfDot = true;
                path.pop();
                path.push((<TypeScript.BinaryExpression>path.asts[path.top]).operand1);
            }

            if (isRightOfDot) {
                var members = this.compilerState.getVisibleMemberSymbolsFromPath(path, document);
                if (!members) {
                    return null;
                }
                completions.isMemberCompletion = true;
                completions.entries = this.getCompletionEntriesFromSymbols(members);
            }
            // Handle object literal diffrentlly
            else if (this.isInObjectExpressionContext(path)) {
                completions.isMemberCompletion = true;

                // Get the object literal node
                while (path.ast().nodeType !== TypeScript.NodeType.ObjectLiteralExpression) {
                    path.pop();
                }

                // Try to get the object members form contextual typing
                var contextualMembers = this.compilerState.geContextualMembersFromPath(path, document);
                if (contextualMembers && contextualMembers.symbols && contextualMembers.symbols.length > 0) {
                    // get existing members
                    var existingMembers = this.compilerState.getVisibleMemberSymbolsFromPath(path, document);

                    // Add filtterd items to the completion list
                    completions.entries = this.getCompletionEntriesFromSymbols({
                        symbols: this.filterContextualMembersList(contextualMembers.symbols, existingMembers),
                        enclosingScopeSymbol: contextualMembers.enclosingScopeSymbol
                    });
                }
            }
            // Get scope memebers
            else {
                completions.isMemberCompletion = false;
                var symbols = this.compilerState.getVisibleSymbolsFromPath(path, document);
                completions.entries = this.getCompletionEntriesFromSymbols(symbols);
            }

            // Add keywords if this is not a member completion list
            if (!completions.isMemberCompletion) {
                completions.entries = completions.entries.concat(KeywordCompletions.getKeywordCompltions());
            }

            return completions;
        }

        private getCompletionEntriesFromSymbols(symbolInfo: TypeScript.PullVisibleSymbolsInfo): CompletionEntry[] {
            var result: CompletionEntry[] = [];

            symbolInfo.symbols.forEach((symbol) => {
                var entry = new CompletionEntry();
                entry.name = symbol.getDisplayName();
                entry.type = symbol.getTypeName(symbolInfo.enclosingScopeSymbol, true);
                entry.kind = this.mapPullElementKind(symbol.getKind(), symbol, true);
                entry.fullSymbolName = this.getFullNameOfSymbol(symbol, symbolInfo.enclosingScopeSymbol);
                var type = symbol.getType();
                var symbolForDocComments = symbol;
                if (type && type.hasOnlyOverloadCallSignatures()) {
                    symbolForDocComments = type.getCallSignatures()[0];
                }
                entry.docComment = this.compilerState.getDocComments(symbolForDocComments, true);
                entry.kindModifiers = this.getScriptElementKindModifiers(symbol);
                result.push(entry);
            });
            return result;
        }

        private filterContextualMembersList(contextualMemberSymbols: TypeScript.PullSymbol[], existingMembers: TypeScript.PullVisibleSymbolsInfo): TypeScript.PullSymbol[] {
            if (!existingMembers || !existingMembers.symbols || existingMembers.symbols.length === 0) {
                return contextualMemberSymbols;
            }

            var existingMemberSymbols = existingMembers.symbols;
            var existingMemberNames: { [s: string]: boolean; } = {};
            for (var i = 0, n = existingMemberSymbols.length; i < n; i++) {
                existingMemberNames[existingMemberSymbols[i].getDisplayName()]= true;
            }

            var filteredMembers: TypeScript.PullSymbol[] = [];
            for (var j = 0, m = contextualMemberSymbols.length; j < m; j++) {
                var contextualMemberSymbol = contextualMemberSymbols[j];
                if (!existingMemberNames[contextualMemberSymbol.getDisplayName()]) {
                    filteredMembers.push(contextualMemberSymbol);
                }
            }

            return filteredMembers;
        }

        private isRightOfDot(path: TypeScript.AstPath, position: number): boolean {
            return (path.count() >= 1 && path.asts[path.top].nodeType === TypeScript.NodeType.MemberAccessExpression && (<TypeScript.BinaryExpression>path.asts[path.top]).operand1.limChar < position) ||
                   (path.count() >= 2 && path.asts[path.top].nodeType === TypeScript.NodeType.Name && path.asts[path.top - 1].nodeType === TypeScript.NodeType.MemberAccessExpression && (<TypeScript.BinaryExpression>path.asts[path.top - 1]).operand2 === path.asts[path.top]);
        }

        private isInObjectExpressionContext(path: TypeScript.AstPath): boolean {
            return (path.count() >= 1 && path.asts[path.top].nodeType === TypeScript.NodeType.ObjectLiteralExpression) || // var x = {
                (path.count() >= 2 && path.asts[path.top].nodeType === TypeScript.NodeType.List && path.asts[path.top - 1].nodeType === TypeScript.NodeType.ObjectLiteralExpression) || // var x = { a:1, 
                (path.count() >= 4 && path.asts[path.top].nodeType === TypeScript.NodeType.Name && path.asts[path.top - 1].nodeType === TypeScript.NodeType.Member && path.asts[path.top - 2].nodeType === TypeScript.NodeType.List && path.asts[path.top - 3].nodeType === TypeScript.NodeType.ObjectLiteralExpression); // var x = { ab
        }

        private isCompletionListBlocker(syntaxTree: TypeScript.SyntaxTree, position: number): boolean {
            // This method uses Fidelity completelly. Some information can be reached using the AST, but not everything.
            return TypeScript.Syntax.isEntirelyInsideComment(syntaxTree.sourceUnit(), position) ||
                TypeScript.Syntax.isEntirelyInStringOrRegularExpressionLiteral(syntaxTree.sourceUnit(), position) ||
                this.isIdentifierDefinitionLocation(syntaxTree.sourceUnit(), position) ||
                this.isRightOfIllegalDot(syntaxTree.sourceUnit(), position);
        }

        private isIdentifierDefinitionLocation(sourceUnit: TypeScript.SourceUnitSyntax, position: number): boolean {
            var positionedToken = this.getNonIdentifierCompleteTokenOnLeft(sourceUnit, position);

            if (positionedToken) {
                var containingNodeKind = positionedToken.containingNode() && positionedToken.containingNode().kind();
                switch (positionedToken.kind()) {
                    case TypeScript.SyntaxKind.CommaToken:
                        return containingNodeKind === TypeScript.SyntaxKind.ParameterList ||
                            containingNodeKind === TypeScript.SyntaxKind.VariableDeclaration;

                    case TypeScript.SyntaxKind.OpenParenToken:
                        return containingNodeKind === TypeScript.SyntaxKind.ParameterList ||
                            containingNodeKind === TypeScript.SyntaxKind.CatchClause;

                    case TypeScript.SyntaxKind.PublicKeyword:
                    case TypeScript.SyntaxKind.PrivateKeyword:
                    case TypeScript.SyntaxKind.StaticKeyword:
                    case TypeScript.SyntaxKind.DotDotDotToken:
                        return containingNodeKind === TypeScript.SyntaxKind.Parameter;

                    case TypeScript.SyntaxKind.ClassKeyword:
                    case TypeScript.SyntaxKind.ModuleKeyword:
                    case TypeScript.SyntaxKind.EnumKeyword:
                    case TypeScript.SyntaxKind.InterfaceKeyword:
                    case TypeScript.SyntaxKind.FunctionKeyword:
                    case TypeScript.SyntaxKind.VarKeyword:
                    case TypeScript.SyntaxKind.GetKeyword:
                    case TypeScript.SyntaxKind.SetKeyword:
                        return true;
                }

                // Previous token may have been a keyword that was converted to an identifier.
                switch (positionedToken.token().text()) {
                    case "class":
                    case "interface":
                    case "enum":
                    case "module":
                        return true;
                }
            }

            return false;
        }

        private getNonIdentifierCompleteTokenOnLeft(sourceUnit: TypeScript.SourceUnitSyntax, position: number): TypeScript.PositionedToken {
            var positionedToken = sourceUnit.findCompleteTokenOnLeft(position, /*includeSkippedTokens*/true);

            if (positionedToken && position === positionedToken.end() && positionedToken.kind() == TypeScript.SyntaxKind.EndOfFileToken) {
                // EndOfFile token is not intresting, get the one before it
                positionedToken = positionedToken.previousToken(/*includeSkippedTokens*/true);
            }

            if (positionedToken && position === positionedToken.end() && positionedToken.kind() === TypeScript.SyntaxKind.IdentifierName) {
                // The caret is at the end of an identifier, the decession to provide completion depends on the previous token
                positionedToken = positionedToken.previousToken(/*includeSkippedTokens*/true);
            }

            return positionedToken;
        }

        private isRightOfIllegalDot(sourceUnit: TypeScript.SourceUnitSyntax, position: number): boolean {
            var positionedToken = this.getNonIdentifierCompleteTokenOnLeft(sourceUnit, position);

            if (positionedToken) {
                switch (positionedToken.kind()) {
                    case TypeScript.SyntaxKind.DotToken:
                        var leftOfDotPositionedToken = positionedToken.previousToken(/*includeSkippedTokens*/true);
                        return leftOfDotPositionedToken && leftOfDotPositionedToken.kind() === TypeScript.SyntaxKind.NumericLiteral;

                    case TypeScript.SyntaxKind.NumericLiteral:
                        var text = positionedToken.token().text();
                        return text.charAt(text.length - 1) === ".";
                }
            }

            return false;
        }

        private isLocal(symbol: TypeScript.PullSymbol) {
            var container = symbol.getContainer();
            if (container) {
                var containerKind = container.getKind();
                if (containerKind & (TypeScript.PullElementKind.SomeFunction | TypeScript.PullElementKind.FunctionType)) {
                    return true;
                }

                if (containerKind == TypeScript.PullElementKind.ConstructorType && !symbol.hasFlag(TypeScript.PullElementFlags.Static)) {
                    return true;
                }
            }

            return false;
        }

        private isModule(symbol: TypeScript.PullSymbol) {
            return this.isOneDeclarationOfKind(symbol, TypeScript.PullElementKind.Container);
        }

        private isDynamicModule(symbol: TypeScript.PullSymbol) {
            return this.isOneDeclarationOfKind(symbol, TypeScript.PullElementKind.DynamicModule);
        }

        private isConstructorMethod(symbol: TypeScript.PullSymbol): boolean {
            return this.isOneDeclarationOfKind(symbol, TypeScript.PullElementKind.ConstructorMethod);
        }

        private isClass(symbol: TypeScript.PullSymbol): boolean {
            return this.isOneDeclarationOfKind(symbol, TypeScript.PullElementKind.Class);
        }

        private isOneDeclarationOfKind(symbol: TypeScript.PullSymbol, kind: TypeScript.PullElementKind): boolean {
            var decls = symbol.getDeclarations();
            for (var i = 0; i < decls.length; i++) {
                if (decls[i].getKind() === kind) {
                    return true;
                }
            }

            return false;
        }

        private mapPullElementKind(kind: TypeScript.PullElementKind, symbol?: TypeScript.PullSymbol, useConstructorAsClass?: boolean, varIsFunction?: boolean, functionIsConstructor?: boolean): string {
            if (functionIsConstructor) {
                return ScriptElementKind.constructorImplementationElement;
            }

            if (varIsFunction) {
                switch (kind) {
                    case TypeScript.PullElementKind.Container:
                    case TypeScript.PullElementKind.DynamicModule:
                    case TypeScript.PullElementKind.TypeAlias:
                    case TypeScript.PullElementKind.Interface:
                    case TypeScript.PullElementKind.Class:
                    case TypeScript.PullElementKind.Parameter:
                        return ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.Variable:
                        return (symbol && this.isLocal(symbol)) ? ScriptElementKind.localFunctionElement : ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.Property:
                        return ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.Function:
                        return (symbol && this.isLocal(symbol)) ? ScriptElementKind.localFunctionElement : ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.ConstructorMethod:
                        return ScriptElementKind.constructorImplementationElement;
                    case TypeScript.PullElementKind.Method:
                        return ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.FunctionExpression:
                        return ScriptElementKind.localFunctionElement;
                    case TypeScript.PullElementKind.GetAccessor:
                        return ScriptElementKind.memberGetAccessorElement;
                    case TypeScript.PullElementKind.SetAccessor:
                        return ScriptElementKind.memberSetAccessorElement;
                    case TypeScript.PullElementKind.CallSignature:
                        return ScriptElementKind.callSignatureElement;
                    case TypeScript.PullElementKind.ConstructSignature:
                        return ScriptElementKind.constructSignatureElement;
                    case TypeScript.PullElementKind.IndexSignature:
                        return ScriptElementKind.indexSignatureElement;
                    case TypeScript.PullElementKind.TypeParameter:
                        return ScriptElementKind.typeParameterElement;
                    case TypeScript.PullElementKind.Primitive:
                        return ScriptElementKind.primitiveType;
                }
            } else {
                switch (kind) {
                    case TypeScript.PullElementKind.Script:
                        return ScriptElementKind.scriptElement;
                    case TypeScript.PullElementKind.Container:
                    case TypeScript.PullElementKind.DynamicModule:
                    case TypeScript.PullElementKind.TypeAlias:
                        return ScriptElementKind.moduleElement;
                    case TypeScript.PullElementKind.Interface:
                        return ScriptElementKind.interfaceElement;
                    case TypeScript.PullElementKind.Class:
                        return ScriptElementKind.classElement;
                    case TypeScript.PullElementKind.Enum:
                        return ScriptElementKind.enumElement;
                    case TypeScript.PullElementKind.Variable:
                        if (symbol && this.isModule(symbol)) {
                            return ScriptElementKind.moduleElement;
                        }
                        return (symbol && this.isLocal(symbol)) ? ScriptElementKind.localVariableElement : ScriptElementKind.variableElement;
                    case TypeScript.PullElementKind.Parameter:
                        return ScriptElementKind.parameterElement;
                    case TypeScript.PullElementKind.Property:
                        return ScriptElementKind.memberVariableElement;
                    case TypeScript.PullElementKind.Function:
                        return (symbol && this.isLocal(symbol)) ? ScriptElementKind.localFunctionElement : ScriptElementKind.functionElement;
                    case TypeScript.PullElementKind.ConstructorMethod:
                        return useConstructorAsClass ? ScriptElementKind.classElement : ScriptElementKind.constructorImplementationElement;
                    case TypeScript.PullElementKind.Method:
                        return ScriptElementKind.memberFunctionElement;
                    case TypeScript.PullElementKind.FunctionExpression:
                        return ScriptElementKind.localFunctionElement;
                    case TypeScript.PullElementKind.GetAccessor:
                        return ScriptElementKind.memberGetAccessorElement;
                    case TypeScript.PullElementKind.SetAccessor:
                        return ScriptElementKind.memberSetAccessorElement;
                    case TypeScript.PullElementKind.CallSignature:
                        return ScriptElementKind.callSignatureElement;
                    case TypeScript.PullElementKind.ConstructSignature:
                        return ScriptElementKind.constructSignatureElement;
                    case TypeScript.PullElementKind.IndexSignature:
                        return ScriptElementKind.indexSignatureElement;
                    case TypeScript.PullElementKind.EnumMember:
                        return ScriptElementKind.memberVariableElement;
                    case TypeScript.PullElementKind.TypeParameter:
                        return ScriptElementKind.typeParameterElement;
                    case TypeScript.PullElementKind.Primitive:
                        return ScriptElementKind.primitiveType;
                }
            }

            return ScriptElementKind.unknown;
        }

        private getScriptElementKindModifiers(symbol: TypeScript.PullSymbol): string {
            var result = [];

            if (symbol.hasFlag(TypeScript.PullElementFlags.Exported)) {
                result.push(ScriptElementKindModifier.exportedModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Ambient)) {
                result.push(ScriptElementKindModifier.ambientModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Public)) {
                result.push(ScriptElementKindModifier.publicMemberModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Private)) {
                result.push(ScriptElementKindModifier.privateMemberModifier);
            }
            if (symbol.hasFlag(TypeScript.PullElementFlags.Static)) {
                result.push(ScriptElementKindModifier.staticModifier);
            }

            return result.length > 0 ? result.join(',') : ScriptElementKindModifier.none;
        }

        // 
        // Syntactic Single-File features
        //

        public getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): SpanInfo {
            var path = this.getTypeInfoEligiblePath(fileName, startPos, false);

            if (!path) {
                return null;
            }

            while (path.count() > 0) {
                if (path.isMemberOfMemberAccessExpression()) {
                    path.pop();
                } else {
                    break;
                }
            }
            var cur = path.ast();
            var spanInfo = new SpanInfo(cur.minChar, cur.limChar);
            return spanInfo;
        }

        // Gets breakpoint span in the statement depending on context
        private getBreakpointInStatement(pos: number, astSpan: TypeScript.ASTSpan, verifyASTPos: boolean,
            existingResult: TypeScript.ASTSpan, forceFirstStatement: boolean, isAst: boolean): TypeScript.ASTSpan {
            if (existingResult || !astSpan || (verifyASTPos && pos > astSpan.limChar)) {
                return existingResult;
            }

            if (!isAst) {
                // Satisfies the result
                return astSpan;
            }

            var ast = <TypeScript.AST>astSpan;
            var astList: TypeScript.ASTList = null;
            if (ast.nodeType == TypeScript.NodeType.Block) {
                var block = <TypeScript.Block>ast;
                astList = block.statements;
            } else if (ast.nodeType == TypeScript.NodeType.List) {
                astList = <TypeScript.ASTList>ast;
            } else {
                return ast;
            }

            if (astList.members.length > 0) {
                var lastAST = astList.members[astList.members.length - 1];
                if (!forceFirstStatement && pos > lastAST.limChar) {
                    // Use last one if the character after last statement in the block
                    return lastAST;
                } else {
                    return astList.members[0];
                }
            }

            return null;
        }

        public getBreakpointStatementAtPosition(fileName: string, pos: number): SpanInfo {
            this.refresh();
            var document = this.compilerState.getDocument(fileName);
            var script = document.script;

            var containerASTs: TypeScript.AST[] = [];
            var lineMap = document.lineMap;

            // find line and col
            var lineCol = { line: -1, character: -1 };
            lineMap.fillLineAndCharacterFromPosition(pos, lineCol);

            // Get the valid breakpoint location container list till position so we could choose where to set breakpoint
            var pre = (cur: TypeScript.AST, parent: TypeScript.AST, walker: TypeScript.IAstWalker): TypeScript.AST => {
                if (TypeScript.isValidAstNode(cur)) {
                    if (pos >= cur.minChar && pos <= cur.limChar) {
                        switch (cur.nodeType) {
                            // Can be used as breakpoint location
                            case TypeScript.NodeType.ModuleDeclaration:
                            case TypeScript.NodeType.ClassDeclaration:
                            case TypeScript.NodeType.FunctionDeclaration:
                            case TypeScript.NodeType.BreakStatement:
                            case TypeScript.NodeType.ContinueStatement:
                                containerASTs.push(cur);
                                break;

                            // These are statements or expressions that cant be used as valid breakpoint statements
                            case TypeScript.NodeType.Script:
                            case TypeScript.NodeType.List:
                            case TypeScript.NodeType.NumericLiteral:
                            case TypeScript.NodeType.RegularExpressionLiteral:
                            case TypeScript.NodeType.StringLiteral:
                            case TypeScript.NodeType.ArrayLiteralExpression:
                            case TypeScript.NodeType.ObjectLiteralExpression:
                            case TypeScript.NodeType.CastExpression:
                            case TypeScript.NodeType.PlusExpression:
                            case TypeScript.NodeType.NegateExpression:
                            case TypeScript.NodeType.BitwiseNotExpression:
                            case TypeScript.NodeType.LogicalNotExpression:
                            case TypeScript.NodeType.Block:
                            case TypeScript.NodeType.ExpressionStatement:
                                break;

                            // Type Reference cannot have breakpoint, nor can its children
                            case TypeScript.NodeType.TypeRef:
                                walker.options.goChildren = false;
                                break;

                            default:
                                // If it is a statement or expression - they are debuggable
                                // But expressions are debuggable as standalone statement only
                                if (cur.isStatementOrExpression() &&
                                    (!cur.isExpression() ||
                                     containerASTs.length == 0 ||
                                     (!containerASTs[containerASTs.length - 1].isExpression() &&
                                      (containerASTs[containerASTs.length - 1].nodeType != TypeScript.NodeType.VariableDeclarator &&
                                       containerASTs[containerASTs.length - 1].nodeType != TypeScript.NodeType.Parameter) ||
                                      containerASTs[containerASTs.length - 1].nodeType == TypeScript.NodeType.ConditionalExpression))) {
                                    containerASTs.push(cur);
                                }
                                break;
                        }
                    } else {
                        walker.options.goChildren = false;
                    }
                }
                return cur;
            }
            TypeScript.getAstWalkerFactory().walk(script, pre);

            if (containerASTs.length == 0) {
                return null;
            }

            // We have container list in resultAST
            // Use it to determine where to set the breakpoint
            var resultAST: TypeScript.ASTSpan = null;
            var cur = containerASTs[containerASTs.length - 1];
            var customSpan: TypeScript.ASTSpan = null;

            switch (cur.nodeType) {
                // TODO : combine these as interface and use custom method instead of duplicate logic
                case TypeScript.NodeType.ModuleDeclaration:
                    var moduleDecl = <TypeScript.ModuleDeclaration>cur;
                    // If inside another module the whole module is debuggable
                    if (containerASTs.length > 1) {
                        resultAST = moduleDecl;
                    } else {
                        // Use first statement - whatever it is 
                        resultAST = this.getBreakpointInStatement(pos, moduleDecl.members, false, null, false, true);
                    }
                    // Can use ending token and if it cant find anything breakpoint cannot be set at this declaration
                    customSpan = moduleDecl.endingToken;
                    break;

                case TypeScript.NodeType.FunctionDeclaration:
                    var funcDecl = <TypeScript.FunctionDeclaration>cur;
                    // If function is inside module/class then it can be used completely as statement
                    if (containerASTs.length > 1) {
                        resultAST = funcDecl;
                    } else {
                        // We want to use first statement in the body if present
                        resultAST = this.getBreakpointInStatement(pos, funcDecl.block, false, null, false, true);
                    }
                    // Can use ending token and if it cant find anything breakpoint cannot be set at this declaration
                    customSpan = funcDecl.block ? funcDecl.block.closeBraceSpan : null;
                    break;

                case TypeScript.NodeType.ClassDeclaration:
                    var classDecl = <TypeScript.ClassDeclaration>cur;
                    // If class is inside module then it can be used completely as statement
                    if (containerASTs.length > 1) {
                        resultAST = classDecl;
                    } else {
                        // We want to use first statement in the body if present
                        resultAST = this.getBreakpointInStatement(pos, classDecl.members, false, null, false, true);
                    }
                    // Can use ending token and if it cant find anything breakpoint cannot be set at this declaration
                    customSpan = classDecl.endingToken;
                    break;

                case TypeScript.NodeType.VariableDeclarator:
                    // Use varDecl only if it has initializer
                    var varDecl = <TypeScript.BoundDecl>cur;
                    if (varDecl.init) {
                        resultAST = varDecl;
                        if (containerASTs.length > 1 && containerASTs[containerASTs.length - 2].nodeType == TypeScript.NodeType.VariableStatement) {
                            var varStatement = <TypeScript.VariableStatement>containerASTs[containerASTs.length - 2];
                            if (varStatement.declaration.declarators.members.length && varStatement.declaration.declarators.members[0] == resultAST) {
                                resultAST = varStatement;
                            }
                        }
                    }
                    break;

                case TypeScript.NodeType.IfStatement:
                    var ifStatement = <TypeScript.IfStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, ifStatement.statement, true, resultAST, false, false);
                    resultAST = this.getBreakpointInStatement(pos, ifStatement.thenBod, true, resultAST, false, true);
                    resultAST = this.getBreakpointInStatement(pos, ifStatement.elseBod, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.ForInStatement:
                    var forInStatement = <TypeScript.ForInStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, forInStatement.statement, true, resultAST, false, false);
                    resultAST = this.getBreakpointInStatement(pos, forInStatement.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.ForStatement:
                    var forStatement = <TypeScript.ForStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, forStatement.init, true, null, false, true);
                    resultAST = this.getBreakpointInStatement(pos, forStatement.cond, true, resultAST, false, true);
                    resultAST = this.getBreakpointInStatement(pos, forStatement.incr, true, resultAST, false, true);
                    resultAST = this.getBreakpointInStatement(pos, forStatement.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.WhileStatement:
                    var whileStatement = <TypeScript.WhileStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, whileStatement.cond, true, null, false, true);
                    resultAST = this.getBreakpointInStatement(pos, whileStatement.body, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.DoStatement:
                    var doWhileStatement = <TypeScript.DoStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, doWhileStatement.body, true, null, false, true);
                    resultAST = this.getBreakpointInStatement(pos, doWhileStatement.cond, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.SwitchStatement:
                    var switchStatement = <TypeScript.SwitchStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, switchStatement.statement, true, resultAST, false, false);
                    // Loop through case statements and find the best one
                    var caseListCount = switchStatement.caseList.members.length;
                    if (caseListCount > 0) {
                        var lastCase = switchStatement.caseList.members[caseListCount - 1];
                        var caseToUse: TypeScript.CaseClause;
                        if (pos >= lastCase.limChar) {
                            // Use last one if the character after last statement in the block
                            caseToUse = <TypeScript.CaseClause>lastCase;
                            resultAST = this.getBreakpointInStatement(pos, caseToUse.body.members[0], false, resultAST, false, true);
                        } else {
                            caseToUse = <TypeScript.CaseClause>switchStatement.caseList.members[0];
                            resultAST = this.getBreakpointInStatement(pos, caseToUse.body.members[0], false, resultAST, true, true);
                        }
                    }
                    break;

                case TypeScript.NodeType.CaseClause:
                    var caseStatement = <TypeScript.CaseClause>cur;
                    resultAST = this.getBreakpointInStatement(pos, caseStatement.body.members[0], false, null, false, true);
                    break;

                case TypeScript.NodeType.WithStatement:
                    var withStatement = <TypeScript.WithStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, withStatement.body, false, null, false, true);
                    break;

                case TypeScript.NodeType.TryStatement:
                    var tryNode = <TypeScript.TryStatement>cur;
                    resultAST = this.getBreakpointInStatement(pos, tryNode.tryBody, true, null, false, false);
                    resultAST = this.getBreakpointInStatement(pos, tryNode.catchClause, true, resultAST, false, false);
                    resultAST = this.getBreakpointInStatement(pos, tryNode.finallyBody, false, resultAST, false, true);
                    break;

                case TypeScript.NodeType.CatchClause:
                    var catchNode = <TypeScript.CatchClause>cur;
                    resultAST = this.getBreakpointInStatement(pos, catchNode.statement, true, null, false, false);
                    resultAST = this.getBreakpointInStatement(pos, catchNode.body, false, resultAST, false, true);
                    break;

                default:
                    resultAST = cur;
                    break;
            }

            // If we have custom span check if it is better option
            if (TypeScript.isValidAstNode(customSpan) && pos >= customSpan.minChar && pos <= customSpan.limChar) {
                resultAST = customSpan;
            }

            // Use result AST to create span info
            if (resultAST) {
                var result = new SpanInfo(resultAST.minChar, resultAST.limChar);
                return result;
            }

            return null;
        }

        public getFormattingEditsForRange(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);
           
            return manager.formatSelection(minChar, limChar);
        }

        public getFormattingEditsForDocument(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);

            return manager.formatDocument(minChar, limChar);
        }

        public getFormattingEditsOnPaste(fileName: string, minChar: number, limChar: number, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);

            return manager.formatOnPaste(minChar, limChar);
        }

        public getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextEdit[] {
            this.minimalRefresh();

            var manager = this.getFormattingManager(fileName, options);

            if (key === "}") {
                return manager.formatOnClosingCurlyBrace(position);
            }
            else if (key === ";") {
                return manager.formatOnSemicolon(position);
            }
            else if (key === "\n") {
                return manager.formatOnEnter(position);
            }

            return [];
        }

        private getFormattingManager(fileName: string, options: FormatCodeOptions) {
            // Ensure rules are initialized and up to date wrt to formatting options
            if (this.formattingRulesProvider == null) {
                this.formattingRulesProvider = new TypeScript.Formatting.RulesProvider(this.logger);
            }

            this.formattingRulesProvider.ensureUptodate(options);

            // Get the Syntax Tree
            var syntaxTree = this.getSyntaxTree(fileName);

            // Convert IScriptSnapshot to ITextSnapshot
            var scriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var scriptText = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);
            var textSnapshot = new TypeScript.Formatting.TextSnapshot(scriptText);

            var manager = new TypeScript.Formatting.FormattingManager(syntaxTree, textSnapshot, this.formattingRulesProvider, options);

            return manager;
        }

        public getOutliningRegions(fileName: string): TypeScript.TextSpan[] {
            this.minimalRefresh();

            var syntaxTree = this.getSyntaxTree(fileName);

            return OutliningElementsCollector.collectElements(syntaxTree.sourceUnit());
        }

        // Given a script name and position in the script, return a string representing 
        // the desired smart indent text (assuming the line is empty).
        // Return "null" in case the smart indent cannot be determined.
        public getSmartIndentAtLineNumber(fileName: string, position: number, editorOptions: EditorOptions): number {
            this.minimalRefresh();

            var syntaxTree = this.getSyntaxTree(fileName);

            var scriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var scriptText = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);
            var textSnapshot = new TypeScript.Formatting.TextSnapshot(scriptText);
            var options = new FormattingOptions(!editorOptions.ConvertTabsToSpaces, editorOptions.TabSize, editorOptions.IndentSize, editorOptions.NewLineCharacter)
            
            return TypeScript.Formatting.SingleTokenIndenter.getIndentationAmount(position, syntaxTree.sourceUnit(), textSnapshot, options);
        }

        // Given a script name and position in the script, return a pair of text range if the 
        // position corresponds to a "brace matchin" characters (e.g. "{" or "(", etc.)
        // If the position is not on any range, return "null".
        public getBraceMatchingAtPosition(fileName: string, position: number): TypeScript.TextSpan[] {
            this.minimalRefresh();

            var syntaxTree = this.getSyntaxTree(fileName);

            return BraceMatcher.getMatchSpans(syntaxTree, position);
        }

        //
        // Manage Single file syntax tree state
        //
        private getSyntaxTree(fileName: string): TypeScript.SyntaxTree {
            var version = this.compilerState.getScriptVersion(fileName);
            var syntaxTree: TypeScript.SyntaxTree = null;

            if (this.currentFileSyntaxTree === null || this.currentFileName !== fileName) {
                syntaxTree = this.createSyntaxTree(fileName);
            }
            else if (this.currentFileVersion !== version) {
                syntaxTree = this.updateSyntaxTree(fileName, this.currentFileSyntaxTree, this.currentFileVersion);
            }

            if (syntaxTree !== null) {
                // All done, ensure state is up to date
                this.currentFileVersion = version;
                this.currentFileName = fileName;
                this.currentFileSyntaxTree = syntaxTree;
            }

            return this.currentFileSyntaxTree;
        }

        private createSyntaxTree(fileName: string): TypeScript.SyntaxTree {
            var scriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var text = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);

            var syntaxTree = TypeScript.Parser.parse(fileName, text, TypeScript.isDTSFile(fileName));

            return syntaxTree
        }

        private updateSyntaxTree(fileName: string, previousSyntaxTree: TypeScript.SyntaxTree, previousFileVersion: number): TypeScript.SyntaxTree {
            var editRange = this.compilerState.getScriptTextChangeRangeSinceVersion(fileName, previousFileVersion);

            // If "no changes", tree is good to go as is
            if (editRange === null) {
                return previousSyntaxTree;
            }

            // Debug.assert(newLength >= 0);

            var newScriptSnapshot = this.compilerState.getScriptSnapshot(fileName);
            var newSegmentedScriptSnapshot = TypeScript.SimpleText.fromScriptSnapshot(newScriptSnapshot);

            var nextSyntaxTree = TypeScript.Parser.incrementalParse(
                previousSyntaxTree, editRange, newSegmentedScriptSnapshot);

            return nextSyntaxTree;
        }
    }
}