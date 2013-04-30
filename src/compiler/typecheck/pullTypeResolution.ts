// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='..\typescript.ts' />


module TypeScript {
    export interface IPullTypeCollection {
        // returns null when types are exhausted
        getLength(): number;
        setTypeAtIndex(index: number, type: PullTypeSymbol): void;
        getTypeAtIndex(index: number): PullTypeSymbol;
    }

    export interface IPullResolutionData {
        actuals: PullTypeSymbol[];
        exactCandidates: PullSignatureSymbol[];
        conversionCandidates: PullSignatureSymbol[];

        id: number;
    }

    export class PullResolutionDataCache {
        public cacheSize = 16;
        public rdCache: IPullResolutionData[] = [];
        public nextUp: number = 0;

        constructor() {
            for (var i = 0; i < this.cacheSize; i++) {
                this.rdCache[i] = {
                    actuals: <PullTypeSymbol[]>[],
                    exactCandidates: <PullSignatureSymbol[]>[],
                    conversionCandidates: <PullSignatureSymbol[]>[],
                    id: i
                };
            }
        }

        public getResolutionData(): IPullResolutionData {
            var rd: IPullResolutionData = null;

            if (this.nextUp < this.cacheSize) {
                rd = this.rdCache[this.nextUp];
            }

            if (rd === null) {
                this.cacheSize++;
                rd = {
                    actuals: <PullTypeSymbol[]>[],
                    exactCandidates: <PullSignatureSymbol[]>[],
                    conversionCandidates: <PullSignatureSymbol[]>[],
                    id: this.cacheSize
                };
                this.rdCache[this.cacheSize] = rd;
            }

            // cache operates as a stack - RD is always served up in-order
            this.nextUp++;

            return rd;
        }

        public returnResolutionData(rd: IPullResolutionData) {
            // Pop to save on array allocations, which are a bottleneck
            // REVIEW: On some VMs, Array.pop doesn't always pop the last value in the array
            rd.actuals.length = 0;
            rd.exactCandidates.length = 0;
            rd.conversionCandidates.length = 0;

            this.nextUp = rd.id;
        }
    }

    export interface PullApplicableSignature {
        signature: PullSignatureSymbol;
        hadProvisionalErrors: boolean;
    }

    export class PullAdditionalCallResolutionData {
        public targetSymbol: PullSymbol = null;
        public targetTypeSymbol: PullTypeSymbol = null;
        public resolvedSignatures: PullSignatureSymbol[] = null;
        public candidateSignature: PullSignatureSymbol = null;
        public actualParametersContextTypeSymbols: PullTypeSymbol[] = null;
    }

    // The resolver associates types with a given AST
    export class PullTypeResolver {
        private cachedArrayInterfaceType: PullTypeSymbol = null;
        private cachedNumberInterfaceType: PullTypeSymbol = null;
        private cachedStringInterfaceType: PullTypeSymbol = null;
        private cachedBooleanInterfaceType: PullTypeSymbol = null;
        private cachedObjectInterfaceType: PullTypeSymbol = null;
        private cachedFunctionInterfaceType: PullTypeSymbol = null;
        private cachedIArgumentsInterfaceType: PullTypeSymbol = null;
        private cachedRegExpInterfaceType: PullTypeSymbol = null;

        private cachedFunctionArgumentsSymbol: PullSymbol = null;

        private assignableCache: any[] = <any>{};
        private subtypeCache: any[] = <any>{};
        private identicalCache: any[] = <any>{};

        private resolutionDataCache = new PullResolutionDataCache();

        private currentUnit: SemanticInfo = null;

        constructor(private compilationSettings: CompilationSettings,
            public semanticInfoChain: SemanticInfoChain,
            private unitPath: string) {
            this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", [], PullElementKind.Interface);
            this.cachedNumberInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Number", [], PullElementKind.Interface);
            this.cachedStringInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("String", [], PullElementKind.Interface);
            this.cachedBooleanInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Boolean", [], PullElementKind.Interface);
            this.cachedObjectInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Object", [], PullElementKind.Interface);
            this.cachedFunctionInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Function", [], PullElementKind.Interface);
            this.cachedIArgumentsInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("IArguments", [], PullElementKind.Interface);
            this.cachedRegExpInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("RegExp", [], PullElementKind.Interface);

            this.cachedFunctionArgumentsSymbol = new PullSymbol("arguments", PullElementKind.Variable);
            this.cachedFunctionArgumentsSymbol.setType(this.cachedIArgumentsInterfaceType ? this.cachedIArgumentsInterfaceType : this.semanticInfoChain.anyTypeSymbol);
            this.cachedFunctionArgumentsSymbol.setResolved();

            this.currentUnit = this.semanticInfoChain.getUnit(unitPath);
        }

        public getUnitPath() { return this.unitPath; }

        public setUnitPath(unitPath: string) {
            this.unitPath = unitPath;

            this.currentUnit = this.semanticInfoChain.getUnit(unitPath);
        }

        public getDeclForAST(ast: AST, unitPath?: string) {
            return this.semanticInfoChain.getDeclForAST(ast, unitPath ? unitPath : this.unitPath);
        }

        public getSymbolForAST(ast: AST, context: PullTypeResolutionContext, unitPath?: string) {
            return this.semanticInfoChain.getSymbolForAST(ast, unitPath ? unitPath : this.unitPath);
        }

        public setSymbolForAST(ast: AST, symbol: PullSymbol, context: PullTypeResolutionContext, unitPath?: string): void {

            if (context && (context.inProvisionalResolution() || context.inSpecialization)) {
                return;
            }

            this.semanticInfoChain.setSymbolForAST(ast, symbol, unitPath ? unitPath : this.unitPath);
        }

        public getASTForSymbol(symbol: PullSymbol, unitPath?: string) {
            return this.semanticInfoChain.getASTForSymbol(symbol, unitPath ? unitPath : this.unitPath);
        }

        public getASTForDecl(decl: PullDecl) {
            return this.semanticInfoChain.getASTForDecl(decl);
        }

        public getCachedArrayType() {
            return this.cachedArrayInterfaceType;
        }

        public getNewErrorTypeSymbol(diagnostic: Diagnostic): PullErrorTypeSymbol {
            return new PullErrorTypeSymbol(diagnostic, this.semanticInfoChain.anyTypeSymbol);
        }

        // returns a list of decls leading up to decl, inclusive
        // PULLTODO: Don't bother using spans - obtain cached Decls from syntax nodes
        public getPathToDecl(decl: PullDecl): PullDecl[] {

            if (!decl) {
                return [];
            }

            //var parentDecl: PullDecl = decl.getParentDecl();
            //var decls: PullDecl[] = [];

            //while (parentDecl) {
            //    decls[decls.length] = parentDecl;
            //    parentDecl = parentDecl.getParentDecl();
            //}

            //return decls;

            var decls: PullDecl[] = [];
            var searchDecls = this.semanticInfoChain.getUnit(decl.getScriptName()).getTopLevelDecls();

            var spanToFind = decl.getSpan();
            var candidateSpan: TextSpan = null;
            var searchKinds = PullElementKind.SomeType | PullElementKind.SomeFunction | PullElementKind.SomeBlock;
            var found = false;

            while (true) {
                // Of the top-level decls, find the one to search off of
                found = false;
                for (var i = 0; i < searchDecls.length; i++) {
                    candidateSpan = searchDecls[i].getSpan();

                    if (spanToFind.start() >= candidateSpan.start() && spanToFind.end() <= candidateSpan.end()) {
                        if (searchDecls[i].getKind() & searchKinds) { // only consider types, which have scopes
                            if (!(searchDecls[i].getKind() & PullElementKind.ObjectLiteral)) {
                                decls[decls.length] = searchDecls[i];
                            }
                            searchDecls = searchDecls[i].getChildDecls();
                            found = true;
                        }
                    }
                }

                if (!found) {
                    break;
                }
            }

            var parent = decl.getParentDecl();

            // if the decl is a function expression, it would not have been parented during binding
            if (decls.length && (decl.getKind() & (PullElementKind.SomeFunction |
                PullElementKind.ObjectType |
                PullElementKind.FunctionType |
                PullElementKind.ConstructorType)) &&
                (decls[decls.length - 1] != decl)) {

                if (parent && decls[decls.length - 1] != parent && !(parent.getKind() & PullElementKind.ObjectLiteral)) {
                    decls[decls.length] = parent;
                }

                decls[decls.length] = decl;
            }

            return decls;
        }

        public getEnclosingDecl(decl: PullDecl): PullDecl {
            var declPath = this.getPathToDecl(decl);

            if (!declPath.length) {
                return null;
            }
            else if (declPath.length > 1 && declPath[declPath.length - 1] === decl) {
                return declPath[declPath.length - 2];
            }
            else {
                return declPath[declPath.length - 1];
            }
        }

        //  Given a path to a name, e.g. ["foo"] or ["Foo", "Baz", "bar"], find the associated symbol
        public findSymbolForPath(pathToName: string[], enclosingDecl: PullDecl, declKind: PullElementKind): PullSymbol {

            if (!pathToName.length) {
                return null;
            }

            var symbolName = pathToName[pathToName.length - 1];
            var contextDeclPath = this.getPathToDecl(enclosingDecl);

            var contextSymbolPath: string[] = [];
            var nestedSymbolPath: string[] = [];

            // first, search within the given symbol path
            // (copy path to name so as not to mutate the input array)
            for (var i = 0; i < pathToName.length; i++) {
                nestedSymbolPath[nestedSymbolPath.length] = pathToName[i];
            }

            var symbol: PullSymbol = null;

            while (nestedSymbolPath.length >= 2) {
                symbol = this.semanticInfoChain.findSymbol(nestedSymbolPath, declKind);

                if (symbol) {
                    return symbol;
                }
                nestedSymbolPath.length -= 2;
                nestedSymbolPath[nestedSymbolPath.length] = symbolName;
            }

            // next, try the enclosing context
            for (var i = 0; i < contextDeclPath.length; i++) {
                contextSymbolPath[contextSymbolPath.length] = contextDeclPath[i].getName();
            }

            for (var i = 0; i < pathToName.length; i++) {
                contextSymbolPath[contextSymbolPath.length] = pathToName[i];
            }

            while (contextSymbolPath.length >= 2) {
                symbol = this.semanticInfoChain.findSymbol(contextSymbolPath, declKind);

                if (symbol) {
                    return symbol;
                }
                contextSymbolPath.length -= 2;
                contextSymbolPath[contextSymbolPath.length] = symbolName;
            }

            // finally, try searching globally
            symbol = this.semanticInfoChain.findSymbol([symbolName], declKind);

            return symbol;
        }

        // search for an unqualified symbol name within a given decl path
        public getSymbolFromDeclPath(symbolName: string, declPath: PullDecl[], declSearchKind: PullElementKind): PullSymbol {
            var symbol: PullSymbol = null;

            // search backwards through the decl list
            //  - if the decl in question is a function, search its members
            //  - if the decl in question is a module, search the decl then the symbol
            //  - Otherwise, search globally

            var decl: PullDecl = null;
            var childDecls: PullDecl[];
            var declSymbol: PullTypeSymbol = null;
            var declMembers: PullSymbol[];
            var pathDeclKind: PullElementKind;
            var valDecl: PullDecl = null;
            var kind: PullElementKind;
            var instanceSymbol: PullSymbol = null;
            var instanceType: PullTypeSymbol = null;

            for (var i = declPath.length - 1; i >= 0; i--) {
                decl = declPath[i];
                pathDeclKind = decl.getKind();

                if (decl.getFlags() & PullElementFlags.DeclaredInAWithBlock) {
                    return this.semanticInfoChain.anyTypeSymbol;
                }

                if (pathDeclKind & (PullElementKind.Container | PullElementKind.DynamicModule)) {

                    // first check locally
                    childDecls = decl.searchChildDecls(symbolName, (declSearchKind & PullElementKind.SomeType) !== 0);

                    if (childDecls.length) {
                        return childDecls[0].getSymbol();
                    }

                    if (declSearchKind & PullElementKind.SomeValue) {

                        childDecls = decl.searchChildDecls(symbolName, true);

                        if (childDecls.length) {
                            valDecl = childDecls[0];

                            if (valDecl) {
                                return valDecl.getSymbol();
                            }
                        }

                        valDecl = decl.getValueDecl();

                        if (valDecl) {
                            decl = valDecl;
                        }
                    }

                    // otherwise, check the members
                    declSymbol = decl.getSymbol().getType();
                    declMembers = declSymbol.getMembers();

                    for (var j = 0; j < declMembers.length; j++) {
                        // PULLTODO: declkind should equal declkind, or is it ok to just mask the value?
                        if (declMembers[j].getName() === symbolName) {
                            kind = declMembers[j].getKind();

                            if ((kind & declSearchKind) != 0) {
                                return declMembers[j];
                            }
                        }
                    }

                }
                else if ((declSearchKind & PullElementKind.SomeType) || !(pathDeclKind & PullElementKind.Class)) {
                    var candidateSymbol: PullSymbol = null;

                    // If the decl is a function expression, we still want to check its children since it may be shadowed by one
                    // of its parameters
                    if (pathDeclKind === PullElementKind.FunctionExpression && symbolName === (<PullFunctionExpressionDecl>decl).getFunctionExpressionName()) {
                        candidateSymbol = decl.getSymbol();
                    }

                    childDecls = decl.searchChildDecls(symbolName, (declSearchKind & PullElementKind.SomeType) !== 0);

                    if (childDecls.length) {
                        return childDecls[0].getSymbol();
                    }

                    if (candidateSymbol) {
                        return candidateSymbol;
                    }
                }
            }

            // otherwise, search globally
            symbol = this.semanticInfoChain.findSymbol([symbolName], declSearchKind);

            return symbol;
        }

        public getVisibleSymbolsFromDeclPath(declPath: PullDecl[], declSearchKind: PullElementKind): PullSymbol[] {
            var symbols: PullSymbol[] = [];
            var decl: PullDecl = null;
            var childDecls: PullDecl[];
            var pathDeclKind: PullElementKind;
            var parameters: PullTypeParameterSymbol[];

            for (var i = declPath.length - 1; i >= 0; i--) {
                decl = declPath[i];
                pathDeclKind = decl.getKind();
                var declSymbol = <PullTypeSymbol>decl.getSymbol();
                var declKind = decl.getKind();

                // First add locals
                // Child decls of classes and interfaces are members, and should only be visible as members of 'this'
                if (declKind !== PullElementKind.Class && declKind !== PullElementKind.Interface) {
                    this.addSymbolsFromDecls(decl.getChildDecls(), declSearchKind, symbols);
                }

                switch (declKind) {
                    case PullElementKind.Container:
                    case PullElementKind.DynamicModule:
                        // Add members
                        var members: PullSymbol[] = [];
                        if (declSymbol) {
                            // Look up all symbols on the module type
                            members = declSymbol.getMembers();
                        }

                        // Look up all symbols on the module instance type if it exists
                        var instanceSymbol = (<PullContainerTypeSymbol > declSymbol).getInstanceSymbol();
                        var searchTypeSymbol = instanceSymbol && instanceSymbol.getType();

                        if (searchTypeSymbol) {
                            members = members.concat(searchTypeSymbol.getMembers());
                        }

                        for (var j = 0; j < members.length; j++) {
                            // PULLTODO: declkind should equal declkind, or is it ok to just mask the value?
                            if ((members[j].getKind() & declSearchKind) != 0) {
                                symbols.push(members[j]);
                            }
                        }

                        break;

                    case PullElementKind.Class:
                    case PullElementKind.Interface:
                        // Add generic types prameters
                        if (declSymbol && declSymbol.isGeneric()) {
                            parameters = declSymbol.getTypeParameters();
                            for (var k = 0; k < parameters.length; k++) {
                                symbols.push(parameters[k]);
                            }
                        }

                        break;

                    case PullElementKind.FunctionExpression:
                        var functionExpressionName = (<PullFunctionExpressionDecl>decl).getFunctionExpressionName();
                        if (declSymbol && functionExpressionName) {
                            symbols.push(declSymbol);
                        }
                        // intentional fall through

                    case PullElementKind.Function:
                    case PullElementKind.ConstructorMethod:
                    case PullElementKind.Method:
                        if (declSymbol) {
                            var functionType = declSymbol.getType();
                            if (functionType.getHasGenericSignature()) {
                                var signatures = (pathDeclKind === PullElementKind.ConstructorMethod) ? functionType.getConstructSignatures() : functionType.getCallSignatures();
                                if (signatures && signatures.length) {
                                    for (var j = 0; j < signatures.length; j++) {
                                        var signature = signatures[j];
                                        if (signature.isGeneric()) {
                                            parameters = signature.getTypeParameters();
                                            for (var k = 0; k < parameters.length; k++) {
                                                symbols.push(parameters[k]);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        break;
                }
            }

            // Get the global symbols
            var units = this.semanticInfoChain.units;

            for (var i = 0, n = units.length; i < n; i++) {
                var unit = units[i];
                if (unit === this.currentUnit && declPath.length != 0) {
                    // Current unit has already been processed. skip it.
                    continue;
                }
                var topLevelDecls = unit.getTopLevelDecls();
                if (topLevelDecls.length) {
                    for (var j = 0, m = topLevelDecls.length; j < m; j++) {
                        var topLevelDecl = topLevelDecls[j];
                        if (topLevelDecl.getKind() === PullElementKind.Script || topLevelDecl.getKind() === PullElementKind.Global) {
                            this.addSymbolsFromDecls(topLevelDecl.getChildDecls(), declSearchKind, symbols);
                        }
                    }
                }
            }

            return symbols;
        }

        private addSymbolsFromDecls(decls: PullDecl[], declSearchKind: PullElementKind, symbols: PullSymbol[]): void {
            if (decls.length) {
                for (var i = 0, n = decls.length; i < n; i++) {
                    if (decls[i].getKind() & declSearchKind) {
                        var symbol = decls[i].getSymbol();
                        if (symbol) {
                            symbols.push(symbol);
                        }
                    }
                }
            }
        }

        public getVisibleSymbols(enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol[] {

            var declPath: PullDecl[] = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];

            if (enclosingDecl && !declPath.length) {
                declPath = [enclosingDecl];
            }

            var declSearchKind: PullElementKind = PullElementKind.SomeType | PullElementKind.SomeValue;

            return this.getVisibleSymbolsFromDeclPath(declPath, declSearchKind);
        }

        public getVisibleContextSymbols(enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol[] {
            var contextualTypeSymbol = context.getContextualType();
            if (!contextualTypeSymbol || this.isAnyOrEquivalent(contextualTypeSymbol)) {
                return null;
            }

            var declSearchKind: PullElementKind = PullElementKind.SomeType | PullElementKind.SomeValue;
            var members: PullSymbol[] = contextualTypeSymbol.getAllMembers(declSearchKind, /*includePrivate*/ false);

            return members;
        }

        public getVisibleMembersFromExpression(expression: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol[] {
            var lhs: PullSymbol = this.resolveStatementOrExpression(expression, false, enclosingDecl, context);
            var lhsType = lhs.getType();

            if (!lhsType) {
                return null;
            }

            if (this.isAnyOrEquivalent(lhsType)) {
                return null;
            }

            // Figure out if privates are available under the current scope
            var includePrivate = false;
            var containerSymbol = lhsType;
            if (containerSymbol.getKind() === PullElementKind.ConstructorType) {
                containerSymbol = containerSymbol.getConstructSignatures()[0].getReturnType();
            }

            if (containerSymbol && containerSymbol.isClass()) {
                var declPath = this.getPathToDecl(enclosingDecl);
                if (declPath && declPath.length) {
                    var declarations = containerSymbol.getDeclarations();
                    for (var i = 0, n = declarations.length; i < n; i++) {
                        var declaration = declarations[i];
                        if (declPath.indexOf(declaration) >= 0) {
                            includePrivate = true;
                            break;
                        }
                    }
                }
            }

            var declSearchKind: PullElementKind = PullElementKind.SomeType | PullElementKind.SomeValue;

            var members: PullSymbol[] = [];

            // could be a type parameter with a contraint
            if (lhsType.isTypeParameter()) {
                var constraint = (<PullTypeParameterSymbol>lhsType).getConstraint();

                if (constraint) {
                    lhsType = constraint;
                    members = lhsType.getAllMembers(declSearchKind, /*includePrivate*/ false);
                }
            }
            else {
                // could be a number
                if (lhsType === this.semanticInfoChain.numberTypeSymbol && this.cachedNumberInterfaceType) {
                    lhsType = this.cachedNumberInterfaceType;
                }
                // could be a string
                else if (lhsType === this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {
                    lhsType = this.cachedStringInterfaceType;
                }
                // could be a boolean
                else if (lhsType === this.semanticInfoChain.booleanTypeSymbol && this.cachedBooleanInterfaceType) {
                    lhsType = this.cachedBooleanInterfaceType;
                }

                if (!lhsType.isResolved()) {
                    var potentiallySpecializedType = <PullTypeSymbol>this.resolveDeclaredSymbol(lhsType, enclosingDecl, context);

                    if (potentiallySpecializedType != lhsType) {
                        if (!lhs.isType()) {
                            context.setTypeInContext(lhs, potentiallySpecializedType);
                        }

                        lhsType = potentiallySpecializedType;
                    }
                }

                members = lhsType.getAllMembers(declSearchKind, includePrivate);

                if (lhsType.isContainer()) {
                    var associatedInstance = (<PullContainerTypeSymbol>lhsType).getInstanceSymbol();
                    if (associatedInstance) {
                        var instanceType = associatedInstance.getType();
                        var instanceMembers = instanceType.getAllMembers(declSearchKind, includePrivate);
                        members = members.concat(instanceMembers);
                    }
                }
                // Constructor types have a "prototype" property
                else if (lhsType.isConstructor()) {
                    var prototypeStr = "prototype";
                    var prototypeSymbol = new PullSymbol(prototypeStr, PullElementKind.Property);
                    var parentDecl = lhsType.getDeclarations()[0];
                    var prototypeDecl = new PullDecl(prototypeStr, prototypeStr, parentDecl.getKind(), parentDecl.getFlags(), parentDecl.getSpan(), parentDecl.getScriptName());
                    prototypeDecl.setParentDecl(parentDecl);
                    prototypeSymbol.addDeclaration(prototypeDecl);
                    // prototypeSymbol.setType(lhsType);
                    members.push(prototypeSymbol);
                }
                else {
                    var associatedContainerSymbol = lhsType.getAssociatedContainerType();
                    if (associatedContainerSymbol) {
                        var containerType = associatedContainerSymbol.getType();
                        var containerMembers = containerType.getAllMembers(declSearchKind, includePrivate);
                        members = members.concat(containerMembers);
                    }
                }
            }

            // could be an enum
            if ((lhsType.getKind() === PullElementKind.Enum) && this.cachedNumberInterfaceType) {
                members = members.concat(this.cachedNumberInterfaceType.getAllMembers(declSearchKind, /*includePrivate*/ false));
            }

            // could be a function symbol
            else if (lhsType.getCallSignatures().length && this.cachedFunctionInterfaceType) {
                members = members.concat(this.cachedFunctionInterfaceType.getAllMembers(declSearchKind, /*includePrivate*/ false));
            }

            return members;
        }

        public isAnyOrEquivalent(type: PullTypeSymbol) {
            return (type === this.semanticInfoChain.anyTypeSymbol) || type.isError();
        }

        public isNumberOrEquivalent(type: PullTypeSymbol) {
            return (type === this.semanticInfoChain.numberTypeSymbol) || (this.cachedNumberInterfaceType && type === this.cachedNumberInterfaceType);
        }

        public isTypeArgumentOrWrapper(type: PullTypeSymbol) {
            if (!type) {
                return false;
            }

            if (!type.isGeneric()) {
                return false;
            }

            if (type.isTypeParameter()) {
                return true;
            }

            if (type.isArray()) {
                return this.isTypeArgumentOrWrapper((<PullArrayTypeSymbol>type).getElementType());
            }

            var typeArguments = type.getTypeArguments();

            if (typeArguments) {
                for (var i = 0; i < typeArguments.length; i++) {
                    if (this.isTypeArgumentOrWrapper(typeArguments[i])) {
                        return true;
                    }
                }
            }
            else {
                // if there are no type arguments, but the type is generic, we're just returning
                // the unspecialized version of the type (e.g., via a recursive call)
                return true;
            }

            return false;
        }

        public findTypeSymbolForDynamicModule(idText: string, currentFileName: string, search: (id: string) => PullTypeSymbol): PullTypeSymbol {
            var originalIdText = idText;
            var symbol = search(idText);

            if (symbol === null) {
                // perhaps it's a dynamic module?
                if (!symbol) {
                    idText = swapQuotes(originalIdText);
                    symbol = search(idText);
                }

                // Check the literal path first
                if (!symbol) {
                    idText = stripQuotes(originalIdText) + ".ts";
                    symbol = search(idText);
                }

                if (!symbol) {
                    idText = stripQuotes(originalIdText) + ".d.ts";
                    symbol = search(idText);
                }

                // If the literal path doesn't work, begin the search
                if (!symbol && !isRelative(originalIdText)) {
                    // check the full path first, as this is the most likely scenario
                    idText = originalIdText;

                    var strippedIdText = stripQuotes(idText);

                    // REVIEW: Technically, we shouldn't have to normalize here - we should normalize in addUnit.
                    // Still, normalizing here alows any language services to be free of assumptions
                    var path = getRootFilePath(switchToForwardSlashes(currentFileName));

                    while (symbol === null && path != "") {
                        idText = normalizePath(path + strippedIdText + ".ts");
                        symbol = search(idText);

                        // check for .d.ts
                        if (symbol === null) {
                            idText = changePathToDTS(idText);
                            symbol = search(idText);
                        }

                        if (symbol === null) {
                            if (path === '/') {
                                path = '';
                            } else {
                                path = normalizePath(path + "..");
                                path = path && path != '/' ? path + '/' : path;
                            }
                        }
                    }
                }
            }

            return symbol;
        }

        // Declaration Resolution

        public resolveDeclaration(declAST: AST, context: PullTypeResolutionContext, enclosingDecl?: PullDecl): PullSymbol {
            switch (declAST.nodeType) {
                case NodeType.CatchClause:
                case NodeType.WithStatement:
                case NodeType.Script:
                    return null;

                case NodeType.ModuleDeclaration:
                    return this.resolveModuleDeclaration(<ModuleDeclaration>declAST, context);
                case NodeType.InterfaceDeclaration:
                    return this.resolveInterfaceDeclaration(<TypeDeclaration>declAST, context);
                case NodeType.ClassDeclaration:
                    return this.resolveClassDeclaration(<ClassDeclaration>declAST, context);
                case NodeType.FunctionDeclaration:
                    {
                        var funcDecl = <FunctionDeclaration>declAST;

                        if (funcDecl.isGetAccessor()) {
                            return this.resolveGetAccessorDeclaration(funcDecl, context);
                        }
                        else if (funcDecl.isSetAccessor()) {
                            return this.resolveSetAccessorDeclaration(funcDecl, context);
                        }
                        else {
                            return this.resolveFunctionDeclaration(<FunctionDeclaration>declAST, context);
                        }
                    }
                case NodeType.VariableDeclarator:
                case NodeType.Parameter:
                    return this.resolveVariableDeclaration(<BoundDecl>declAST, context, enclosingDecl);

                case NodeType.TypeParameter:
                    return this.resolveTypeParameterDeclaration(<TypeParameter>declAST, context);

                case NodeType.ImportDeclaration:
                    return this.resolveImportDeclaration(<ImportDeclaration>declAST, context);

                case NodeType.ObjectLiteralExpression:
                    return this.resolveObjectLiteralExpression(declAST, false, enclosingDecl, context);

                default:
                    throw new Error("Invalid declaration type");
            }
        }

        // PULLTODO: VERY IMPORTANT
        // Right now, the assumption is that the declaration's parse tree is still in memory
        // we need to add a cache-in/cache-out mechanism so that we can break the dependency on in-memory ASTs
        public resolveDeclaredSymbol(symbol: PullSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            if (!symbol || symbol.isResolved()) {
                return symbol;
            }

            if (symbol.isResolving()) {
                if (!symbol.currentlyBeingSpecialized()) {
                    if (!symbol.isType()) {
                    symbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }
                    
                    return symbol;
                }                
            }

            var thisUnit = this.unitPath;

            var decls = symbol.getDeclarations();

            var ast: AST = null;

            // We want to walk and resolve all associated decls, so we can catch
            // cases like function overloads that may be spread across multiple
            // logical declarations
            for (var i = 0; i < decls.length; i++) {
                var decl = decls[i];

                ast = this.semanticInfoChain.getASTForDecl(decl);

                // if it's an object literal member, just return the symbol and wait for
                // the object lit to be resolved
                if (!ast || ast.nodeType === NodeType.Member) {
                    //var span = decl.getSpan();
                    //context.postError(span.minChar, span.limChar - span.minChar, this.unitPath, "Could not resolve location for symbol '" + symbol.getName() +"'", enclosingDecl);

                    // We'll return the cached results, and let the decl be corrected on the next invalidation
                    this.setUnitPath(thisUnit);
                    return symbol;
                }

                this.setUnitPath(decl.getScriptName());
                this.resolveDeclaration(ast, context, enclosingDecl);
            }

            var typeArgs = symbol.isType() ? (<PullTypeSymbol>symbol).getTypeArguments() : null;

            if (typeArgs && typeArgs.length) {
                var typeParameters = (<PullTypeSymbol>symbol).getTypeParameters();
                var typeCache: any = {}

                for (var i = 0; i < typeParameters.length; i++) {
                    typeCache[typeParameters[i].getSymbolID().toString()] = typeArgs[i];
                }

                context.pushTypeSpecializationCache(typeCache);

                var specializedSymbol = specializeType((<PullTypeSymbol>symbol), typeArgs, this, enclosingDecl, context, ast);

                context.popTypeSpecializationCache();

                symbol = specializedSymbol;
            }

            this.setUnitPath(thisUnit);

            return symbol;
        }

        //
        // Resolve a module declaration
        //
        //
        public resolveModuleDeclaration(ast: ModuleDeclaration, context: PullTypeResolutionContext): PullTypeSymbol {
            var containerSymbol = <PullContainerTypeSymbol>this.getSymbolForAST(ast, context, this.unitPath);

            if (containerSymbol.isResolved()) {
                return containerSymbol;
            }

            containerSymbol.setResolved();

            var containerDecl = this.getDeclForAST(ast);

            if (containerDecl.getKind() != PullElementKind.Enum) {

                var instanceSymbol = containerSymbol.getInstanceSymbol();

                // resolve the instance variable, if neccesary
                if (instanceSymbol) {
                    this.resolveDeclaredSymbol(instanceSymbol, containerDecl.getParentDecl(), context);
                }
            }

            return containerSymbol;
        }

        //
        // Resolve a reference type (class or interface) type parameters, implements and extends clause, members, call, construct and index signatures
        //
        private resolveReferenceTypeDeclaration(typeDeclAST: TypeDeclaration, context: PullTypeResolutionContext): PullSymbol {
            var typeDecl: PullDecl = this.getDeclForAST(typeDeclAST);
            var enclosingDecl = this.getEnclosingDecl(typeDecl);
            var typeDeclSymbol = <PullTypeSymbol>typeDecl.getSymbol();
            var typeDeclIsClass = typeDeclAST.nodeType === NodeType.ClassDeclaration;
            var hasVisited = this.getSymbolForAST(typeDeclAST, context) != null;

            if ((typeDeclSymbol.isResolved() && hasVisited) || (typeDeclSymbol.isResolving() && !context.isInBaseTypeResolution())) {
                return typeDeclSymbol;
            }

            typeDeclSymbol.startResolving();

            // Resolve Type Parameters

            if (!typeDeclSymbol.isResolved()) {
                var typeDeclTypeParameters = typeDeclSymbol.getTypeParameters();
                for (var i = 0; i < typeDeclTypeParameters.length; i++) {
                    this.resolveDeclaredSymbol(typeDeclTypeParameters[i], typeDecl, context);
                }
            }

            var wasInBaseTypeResolution = context.startBaseTypeResolution();

            // if it's a "split" interface type, we'll need to consider constituent extends lists separately
            if (!typeDeclIsClass && !hasVisited && typeDeclSymbol.isResolved()) {
                typeDeclSymbol.resetKnownBaseTypeCount();
            }

            // Extends list
            if (typeDeclAST.extendsList) {
                var savedIsResolvingClassExtendedType = context.isResolvingClassExtendedType;
                if (typeDeclIsClass) {
                    context.isResolvingClassExtendedType = true;
                }

                for (var i = typeDeclSymbol.getKnownBaseTypeCount(); i < typeDeclAST.extendsList.members.length; i = typeDeclSymbol.getKnownBaseTypeCount()) {
                    typeDeclSymbol.incrementKnownBaseCount();
                    var parentType = this.resolveTypeReference(new TypeReference(typeDeclAST.extendsList.members[i], 0), typeDecl, context);

                    if (typeDeclSymbol.isValidBaseKind(parentType, true)) {
                        var resolvedParentType = parentType;
                        if (parentType.isGeneric() && parentType.isResolved() && !parentType.getIsSpecialized()) {
                            parentType = this.specializeTypeToAny(parentType, enclosingDecl, context);
                        }
                        if (!typeDeclSymbol.hasBase(parentType)) {
                            this.setSymbolForAST(typeDeclAST.extendsList.members[i], resolvedParentType, context);
                            typeDeclSymbol.addExtendedType(parentType);
                        }
                    }
                }

                context.isResolvingClassExtendedType = savedIsResolvingClassExtendedType;
            }

            if (typeDeclAST.implementsList && typeDeclIsClass) {
                var extendsCount = typeDeclAST.extendsList ? typeDeclAST.extendsList.members.length : 0;
                for (var i = typeDeclSymbol.getKnownBaseTypeCount(); (i - extendsCount) < typeDeclAST.implementsList.members.length; i = typeDeclSymbol.getKnownBaseTypeCount()) {
                    typeDeclSymbol.incrementKnownBaseCount();
                    var implementedType = this.resolveTypeReference(new TypeReference(typeDeclAST.implementsList.members[i - extendsCount], 0), typeDecl, context);

                    if (typeDeclSymbol.isValidBaseKind(implementedType, false)) {
                        var resolvedImplementedType = implementedType;
                        if (implementedType.isGeneric() && implementedType.isResolved() && !implementedType.getIsSpecialized()) {
                            implementedType = this.specializeTypeToAny(implementedType, enclosingDecl, context);
                        }

                        if (!typeDeclSymbol.hasBase(implementedType)) {
                            this.setSymbolForAST(typeDeclAST.implementsList.members[i - extendsCount], resolvedImplementedType, context);
                            typeDeclSymbol.addImplementedType(implementedType);
                        }
                    }
                }
            }
            context.doneBaseTypeResolution(wasInBaseTypeResolution);
            if (wasInBaseTypeResolution) {
                // Do not resolve members as yet
                return typeDeclSymbol;
            }

            if (!typeDeclSymbol.isResolved()) {
                // Resolve members
                var typeDeclMembers = typeDeclSymbol.getMembers();
                for (var i = 0; i < typeDeclMembers.length; i++) {
                    this.resolveDeclaredSymbol(typeDeclMembers[i], typeDecl, context);
                }

                if (!typeDeclIsClass) {
                    // Resolve call, construct and index signatures
                    var callSignatures = typeDeclSymbol.getCallSignatures();
                    for (var i = 0; i < callSignatures.length; i++) {
                        this.resolveDeclaredSymbol(callSignatures[i], typeDecl, context);
                    }

                    var constructSignatures = typeDeclSymbol.getConstructSignatures();
                    for (var i = 0; i < constructSignatures.length; i++) {
                        this.resolveDeclaredSymbol(constructSignatures[i], typeDecl, context);
                    }

                    var indexSignatures = typeDeclSymbol.getIndexSignatures();
                    for (var i = 0; i < indexSignatures.length; i++) {
                        this.resolveDeclaredSymbol(indexSignatures[i], typeDecl, context);
                    }
                }
            }

            this.setSymbolForAST(typeDeclAST.name, typeDeclSymbol, context);
            this.setSymbolForAST(typeDeclAST, typeDeclSymbol, context);

            typeDeclSymbol.setResolved();

            return typeDeclSymbol;
        }

        //
        // Resolve a class declaration
        //
        // A class's implements and extends lists are not pre-bound, so they must be bound here
        // Once bound, we can add the parent type's members to the class
        //
        public resolveClassDeclaration(classDeclAST: ClassDeclaration, context: PullTypeResolutionContext): PullTypeSymbol {
            var classDecl: PullDecl = this.getDeclForAST(classDeclAST);
            var classDeclSymbol = <PullClassTypeSymbol>classDecl.getSymbol();
            if (classDeclSymbol.isResolved()) {
                return classDeclSymbol;
            }

            this.resolveReferenceTypeDeclaration(classDeclAST, context);
            if (!classDeclSymbol.isResolved()) {
                return classDeclSymbol;
            }

            var constructorMethod = classDeclSymbol.getConstructorMethod();
            var extendedTypes = classDeclSymbol.getExtendedTypes();
            var parentType = extendedTypes.length ? extendedTypes[0] : null;

            if (constructorMethod) {
                var constructorTypeSymbol = constructorMethod.getType();

                var constructSignatures = constructorTypeSymbol.getConstructSignatures();

                if (!constructSignatures.length) {
                    var constructorSignature: PullSignatureSymbol;

                    // inherit parent's constructor signatures
                    if (parentType) {
                        var parentClass = <PullClassTypeSymbol>parentType;
                        var parentConstructor = parentClass.getConstructorMethod();
                        var parentConstructorType = parentConstructor.getType();
                        var parentConstructSignatures = parentConstructorType.getConstructSignatures();

                        var parentConstructSignature: PullSignatureSymbol;
                        var parentParameters: PullSymbol[];
                        for (var i = 0; i < parentConstructSignatures.length; i++) {
                            // create a new signature for each parent constructor
                            parentConstructSignature = parentConstructSignatures[i];
                            parentParameters = parentConstructSignature.getParameters();

                            constructorSignature = parentConstructSignature.isDefinition() ?
                                new PullDefinitionSignatureSymbol(PullElementKind.ConstructSignature) : new PullSignatureSymbol(PullElementKind.ConstructSignature);
                            constructorSignature.setReturnType(classDeclSymbol);

                            for (var j = 0; j < parentParameters.length; j++) {
                                constructorSignature.addParameter(parentParameters[j], parentParameters[j].getIsOptional());
                            }

                            constructorTypeSymbol.addConstructSignature(constructorSignature);
                            constructorSignature.addDeclaration(classDecl);
                        }
                    }
                    else { // PULLREVIEW: This likely won't execute, unless there's some serious out-of-order resolution issues
                        constructorSignature = new PullSignatureSymbol(PullElementKind.ConstructSignature);
                        constructorSignature.setReturnType(classDeclSymbol);
                        constructorTypeSymbol.addConstructSignature(constructorSignature);
                        constructorSignature.addDeclaration(classDecl);
                    }
                }

                var constructorMembers = constructorTypeSymbol.getMembers();

                this.resolveDeclaredSymbol(constructorMethod, classDecl, context);

                for (var i = 0; i < constructorMembers.length; i++) {
                    this.resolveDeclaredSymbol(constructorMembers[i], classDecl, context);
                }

                if (parentType) {
                    var parentConstructorSymbol = (<PullClassTypeSymbol>parentType).getConstructorMethod();
                    var parentConstructorTypeSymbol = parentConstructorSymbol.getType();

                    if (!constructorTypeSymbol.hasBase(parentConstructorTypeSymbol)) {
                        constructorTypeSymbol.addExtendedType(parentConstructorTypeSymbol);
                    }
                }
            }

            return classDeclSymbol;
        }

        public resolveInterfaceDeclaration(interfaceDeclAST: TypeDeclaration, context: PullTypeResolutionContext): PullTypeSymbol {
            var interfaceDecl: PullDecl = this.getDeclForAST(interfaceDeclAST);
            var interfaceDeclSymbol = <PullTypeSymbol>interfaceDecl.getSymbol();

            this.resolveReferenceTypeDeclaration(interfaceDeclAST, context);
            return interfaceDeclSymbol;
        }

        public resolveImportDeclaration(importStatementAST: ImportDeclaration, context: PullTypeResolutionContext): PullTypeSymbol {
            // internal or external? (Does it matter?)
            var importDecl: PullDecl = this.getDeclForAST(importStatementAST);
            var enclosingDecl = this.getEnclosingDecl(importDecl);
            var importDeclSymbol = <PullTypeAliasSymbol>importDecl.getSymbol();

            var aliasName = importStatementAST.id.text;
            var aliasedType: PullTypeSymbol = null;

            if (importDeclSymbol.isResolved()) {
                return importDeclSymbol;
            }

            importDeclSymbol.startResolving();

            // the alias name may be a string literal, in which case we'll need to convert it to a type
            // reference
            if (importStatementAST.alias.nodeType === NodeType.TypeRef) { // dotted name
                aliasedType = this.resolveTypeReference(<TypeReference>importStatementAST.alias, enclosingDecl, context);
            }
            else if (importStatementAST.alias.nodeType === NodeType.Name) { // name or dynamic module name
                var text = (<Identifier>importStatementAST.alias).actualText;

                if (!isQuoted(text)) {
                    aliasedType = this.resolveTypeReference(new TypeReference(importStatementAST.alias, 0), enclosingDecl, context);
                }
                else { // dynamic module name (string literal)
                    var modPath = (<StringLiteral>importStatementAST.alias).actualText;
                    var declPath = this.getPathToDecl(enclosingDecl);

                    importStatementAST.isDynamicImport = true;

                    aliasedType = this.findTypeSymbolForDynamicModule(modPath, importDecl.getScriptName(), (s: string) => <PullTypeSymbol>this.getSymbolFromDeclPath(s, declPath, PullElementKind.SomeType));

                    if (aliasedType) {
                        this.currentUnit.addDynamicModuleImport(importDeclSymbol);
                    }
                    else {
                        importDecl.addDiagnostic(
                            new Diagnostic(this.currentUnit.getPath(), importStatementAST.minChar, importStatementAST.getLength(), "Unable to resolve external module '{0}'.", [text]));
                        aliasedType = this.semanticInfoChain.anyTypeSymbol;
                    }
                }
            }

            if (aliasedType) {
                if (!aliasedType.isContainer()) {
                    importDecl.addDiagnostic(
                        new Diagnostic(this.currentUnit.getPath(), importStatementAST.minChar, importStatementAST.getLength(), "Module cannot be aliased to a non-module type.", null));
                }

                importDeclSymbol.setAliasedType(aliasedType);
                importDeclSymbol.setResolved();

                this.setSymbolForAST(importStatementAST.alias, aliasedType, context);
            }

            return importDeclSymbol;
        }

        public resolveFunctionTypeSignature(funcDeclAST: FunctionDeclaration, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol {
            var funcDeclSymbol = <PullFunctionTypeSymbol>this.getSymbolForAST(funcDeclAST, context, this.unitPath);

            if (!funcDeclSymbol) {
                var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                var declCollectionContext = new DeclCollectionContext(semanticInfo);

                declCollectionContext.scriptName = this.unitPath;

                if (enclosingDecl) {
                    declCollectionContext.pushParent(enclosingDecl);
                }

                getAstWalkerFactory().walk(funcDeclAST, preCollectDecls, postCollectDecls, null, declCollectionContext);

                var functionDecl = this.getDeclForAST(funcDeclAST);

                var binder = new PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);
                binder.setUnit(this.unitPath);
                if (functionDecl.getKind() === PullElementKind.ConstructorType) {
                    binder.bindConstructorTypeDeclarationToPullSymbol(functionDecl);
                }
                else {
                    binder.bindFunctionTypeDeclarationToPullSymbol(functionDecl);
                }

                funcDeclSymbol = <PullFunctionTypeSymbol>functionDecl.getSymbol();
            }

            var signature = funcDeclSymbol.getKind() === PullElementKind.ConstructorType ? funcDeclSymbol.getConstructSignatures()[0] : funcDeclSymbol.getCallSignatures()[0];

            // resolve the return type annotation
            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, enclosingDecl, context);

                signature.setReturnType(returnTypeSymbol);

                if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                    signature.setHasGenericParameter();

                    if (funcDeclSymbol) {
                        funcDeclSymbol.getType().setHasGenericSignature();
                    }
                }
            }
            else {
                signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
            }

            // link parameters and resolve their annotations
            if (funcDeclAST.arguments) {
                for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                    this.resolveFunctionTypeSignatureParameter(<Parameter>funcDeclAST.arguments.members[i], null, signature, enclosingDecl, context);
                }
            }

            if (signature.hasGenericParameter()) {
                // PULLREVIEW: This is split into a spearate if statement to make debugging slightly easier...
                if (funcDeclSymbol) {
                    funcDeclSymbol.getType().setHasGenericSignature();
                }
            }

            funcDeclSymbol.setResolved();

            return funcDeclSymbol;
        }

        public resolveFunctionTypeSignatureParameter(argDeclAST: Parameter, contextParam: PullSymbol, signature: PullSignatureSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {

            var paramSymbol = this.getSymbolForAST(argDeclAST, context, this.unitPath);

            if (argDeclAST.typeExpr) {
                var typeRef = this.resolveTypeReference(<TypeReference>argDeclAST.typeExpr, enclosingDecl, context);

                if (paramSymbol.getIsVarArg() && !typeRef.isArray()) {
                    var diagnostic = context.postError(this.unitPath, argDeclAST.minChar, argDeclAST.getLength(), "Rest parameters must be array types.", null, enclosingDecl);
                    typeRef = this.getNewErrorTypeSymbol(diagnostic);
                }

                context.setTypeInContext(paramSymbol, typeRef);

                // if the typeExprSymbol is generic, set the "hasGenericParameter" field on the enclosing signature
                if (this.isTypeArgumentOrWrapper(typeRef)) {
                    signature.setHasGenericParameter();
                }
            } // PULLTODO: default values?
            else {
                if (paramSymbol.getIsVarArg() && paramSymbol.getType()) {
                    if (this.cachedArrayInterfaceType) {
                        context.setTypeInContext(paramSymbol, specializeToArrayType(this.cachedArrayInterfaceType, paramSymbol.getType(), this, context));
                    }
                    else {
                        context.setTypeInContext(paramSymbol, paramSymbol.getType());
                    }
                }
                else if (contextParam) {
                    context.setTypeInContext(paramSymbol, contextParam.getType());
                }
                else {
                    context.setTypeInContext(paramSymbol, this.semanticInfoChain.anyTypeSymbol);
                }
            }

            paramSymbol.setResolved();
        }

        public resolveFunctionExpressionParameter(argDeclAST: Parameter, contextParam: PullSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {

            var paramSymbol = this.getSymbolForAST(argDeclAST, context);

            if (argDeclAST.typeExpr) {
                var typeRef = this.resolveTypeReference(<TypeReference>argDeclAST.typeExpr, enclosingDecl, context);

                if (paramSymbol.getIsVarArg() && !typeRef.isArray()) {
                    var diagnostic = context.postError(this.unitPath, argDeclAST.minChar, argDeclAST.getLength(), "Rest parameters must be array types.", null, enclosingDecl);
                    typeRef = this.getNewErrorTypeSymbol(diagnostic);
                }

                context.setTypeInContext(paramSymbol, typeRef);
            } // PULLTODO: default values?
            else {
                if (paramSymbol.getIsVarArg() && paramSymbol.getType()) {
                    if (this.cachedArrayInterfaceType) {
                        context.setTypeInContext(paramSymbol, specializeToArrayType(this.cachedArrayInterfaceType, paramSymbol.getType(), this, context));
                    }
                    else {
                        context.setTypeInContext(paramSymbol, paramSymbol.getType());
                    }
                }
                else if (contextParam) {
                    context.setTypeInContext(paramSymbol, contextParam.getType());
                }
                else {
                    context.setTypeInContext(paramSymbol, this.semanticInfoChain.anyTypeSymbol);
                }
            }

            paramSymbol.setResolved();
        }

        public resolveInterfaceTypeReference(interfaceDeclAST: NamedDeclaration, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol {

            var interfaceSymbol = <PullTypeSymbol>this.getSymbolForAST(interfaceDeclAST, context, this.unitPath);//new PullTypeSymbol("", PullElementKind.Interface);

            if (!interfaceSymbol) {
                var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                var declCollectionContext = new DeclCollectionContext(semanticInfo);

                declCollectionContext.scriptName = this.unitPath;

                if (enclosingDecl) {
                    declCollectionContext.pushParent(enclosingDecl);
                }

                getAstWalkerFactory().walk(interfaceDeclAST, preCollectDecls, postCollectDecls, null, declCollectionContext);

                var interfaceDecl = this.getDeclForAST(interfaceDeclAST);

                var binder = new PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);

                binder.setUnit(this.unitPath);
                binder.bindObjectTypeDeclarationToPullSymbol(interfaceDecl);

                interfaceSymbol = <PullFunctionTypeSymbol>interfaceDecl.getSymbol();
            }

            if (interfaceDeclAST.members) {

                var memberSymbol: PullSymbol = null;
                var memberType: PullTypeSymbol = null;
                var typeMembers = <ASTList> interfaceDeclAST.members;

                for (var i = 0; i < typeMembers.members.length; i++) {
                    memberSymbol = this.getSymbolForAST(typeMembers.members[i], context, this.unitPath);

                    this.resolveDeclaredSymbol(memberSymbol, enclosingDecl, context);

                    memberType = memberSymbol.getType();

                    if (memberType && memberType.isGeneric()) {
                        interfaceSymbol.setHasGenericMember();
                    }
                }
            }

            interfaceSymbol.setResolved();

            return interfaceSymbol;
        }

        public resolveTypeReference(typeRef: TypeReference, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol {
            // the type reference can be
            // a name
            // a function
            // an interface
            // a dotted name
            // an array of any of the above

            if (!typeRef) {
                return null;
            }

            var previousResolutionSymbol = this.getSymbolForAST(typeRef, context);

            if (previousResolutionSymbol) {
                return <PullTypeSymbol>previousResolutionSymbol;
            }

            var typeDeclSymbol: PullTypeSymbol = null;
            var prevResolvingTypeReference = context.resolvingTypeReference;
            var diagnostic: Diagnostic = null;

            // a name
            if (typeRef.term.nodeType === NodeType.Name) {
                var typeName = <Identifier>typeRef.term;

                context.resolvingTypeReference = true;

                typeDeclSymbol = <PullTypeSymbol>this.resolveTypeNameExpression(typeName, enclosingDecl, context);

                context.resolvingTypeReference = prevResolvingTypeReference;

                if (typeDeclSymbol.isError()) {
                    return typeDeclSymbol;
                }
            }

            // a function
            else if (typeRef.term.nodeType === NodeType.FunctionDeclaration) {

                typeDeclSymbol = this.resolveFunctionTypeSignature(<FunctionDeclaration>typeRef.term, enclosingDecl, context);
            }

            // an interface
            else if (typeRef.term.nodeType === NodeType.InterfaceDeclaration) {

                typeDeclSymbol = this.resolveInterfaceTypeReference(<NamedDeclaration>typeRef.term, enclosingDecl, context);
            }
            else if (typeRef.term.nodeType === NodeType.GenericType) {
                typeDeclSymbol = this.resolveGenericTypeReference(<GenericType>typeRef.term, enclosingDecl, context);
            }
            // a dotted name
            else if (typeRef.term.nodeType === NodeType.MemberAccessExpression) {

                // assemble the dotted name path
                var dottedName = <BinaryExpression> typeRef.term;

                // find the decl
                prevResolvingTypeReference = context.resolvingTypeReference;

                typeDeclSymbol = <PullTypeSymbol>this.resolveDottedTypeNameExpression(dottedName, enclosingDecl, context);

                context.resolvingTypeReference = prevResolvingTypeReference;

                if (typeDeclSymbol.isError()) {
                    return typeDeclSymbol;
                }
            }

            else if (typeRef.term.nodeType === NodeType.StringLiteral) {
                var stringConstantAST = <StringLiteral>typeRef.term;
                typeDeclSymbol = new PullStringConstantTypeSymbol(stringConstantAST.actualText);
                typeDeclSymbol.addDeclaration(new PullDecl(stringConstantAST.actualText, stringConstantAST.actualText,
                    typeDeclSymbol.getKind(), null,
                    new TextSpan(stringConstantAST.minChar, stringConstantAST.getLength()), enclosingDecl.getScriptName()));
            }

            if (!typeDeclSymbol) {
                diagnostic = context.postError(this.unitPath, typeRef.term.minChar, typeRef.term.getLength(), "Unable to resolve type.", null, enclosingDecl);
                return this.getNewErrorTypeSymbol(diagnostic);
            }

            // an array of any of the above
            // PULLTODO: Arity > 1
            if (typeRef.arrayCount) {

                var arraySymbol: PullTypeSymbol = typeDeclSymbol.getArrayType();

                // otherwise, create a new array symbol
                if (!arraySymbol) {
                    // for each member in the array interface symbol, substitute in the the typeDecl symbol for "_element"

                    if (!this.cachedArrayInterfaceType) {
                        this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), PullElementKind.Interface);
                    }

                    if (this.cachedArrayInterfaceType && !this.cachedArrayInterfaceType.isResolved()) {
                        this.resolveDeclaredSymbol(this.cachedArrayInterfaceType, enclosingDecl, context);
                    }

                    arraySymbol = specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, typeDeclSymbol, this, context);

                    if (!arraySymbol) {
                        arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                    }
                }

                if (this.cachedArrayInterfaceType && typeRef.arrayCount > 1) {
                    var arity = typeRef.arrayCount - 1;
                    var existingArraySymbol: PullTypeSymbol = null;

                    while (arity) {
                        existingArraySymbol = arraySymbol.getArrayType();

                        if (!existingArraySymbol) {
                            arraySymbol = specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, arraySymbol, this, context);
                        }
                        else {
                            arraySymbol = existingArraySymbol;
                        }

                        arity--;
                    }
                }

                typeDeclSymbol = arraySymbol;
            }

            if (!typeDeclSymbol.isGeneric() /*|| typeDeclSymbol.isArray()*/) {
                this.setSymbolForAST(typeRef, typeDeclSymbol, context);
            }

            return typeDeclSymbol;
        }

        // Also resolves parameter declarations
        public resolveVariableDeclaration(varDecl: BoundDecl, context: PullTypeResolutionContext, enclosingDecl?: PullDecl): PullSymbol {

            var decl: PullDecl = this.getDeclForAST(varDecl);
            var declSymbol = decl.getSymbol();
            var declParameterSymbol: PullSymbol = decl.getValueDecl() ? decl.getValueDecl().getSymbol() : null;
            var hadError = false;

            if (declSymbol.isResolved()) {
                return declSymbol.getType();
            }

            if (declSymbol.isResolving()) {
                // PULLTODO: Error or warning?
                if (!context.inSpecialization) {
                    declSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    declSymbol.setResolved();
                    return declSymbol;//this.semanticInfoChain.anyTypeSymbol;
                }               
            }

            declSymbol.startResolving();

            var wrapperDecl = this.getEnclosingDecl(decl);
            wrapperDecl = wrapperDecl ? wrapperDecl : enclosingDecl;

            var diagnostic: Diagnostic = null;

            // Does this have a type expression? If so, that's the type
            if (varDecl.typeExpr) {
                var typeExprSymbol = this.resolveTypeReference(<TypeReference>varDecl.typeExpr, wrapperDecl, context);

                if (!typeExprSymbol) {
                    diagnostic = context.postError(this.unitPath, varDecl.minChar, varDecl.getLength(), "Unable to resolve type of '{0}'.", [varDecl.id.actualText], decl);
                    declSymbol.setType(this.getNewErrorTypeSymbol(diagnostic));

                    if (declParameterSymbol) {
                        context.setTypeInContext(declParameterSymbol, this.semanticInfoChain.anyTypeSymbol);
                    }

                    hadError = true;
                }
                else {

                    if (typeExprSymbol.isNamedTypeSymbol() && typeExprSymbol.isGeneric() && !typeExprSymbol.isTypeParameter() && typeExprSymbol.isResolved() && !typeExprSymbol.getIsSpecialized()) {
                        typeExprSymbol = this.specializeTypeToAny(typeExprSymbol, enclosingDecl, context);
                    }

                    // PULLREVIEW: If the type annotation is a container type, use the module instance type
                    if (typeExprSymbol.isContainer()) {
                        var instanceSymbol = (<PullContainerTypeSymbol>typeExprSymbol.getType()).getInstanceSymbol()

                        if (!instanceSymbol) {
                            diagnostic = context.postError(this.unitPath, varDecl.minChar, varDecl.getLength(), "Tried to set variable type to uninitialized module type '{0}'.", [typeExprSymbol.toString()], decl);
                            typeExprSymbol = this.getNewErrorTypeSymbol(diagnostic);
                            hadError = true;
                        }
                        else {
                            typeExprSymbol = instanceSymbol.getType();
                        }
                    }
                    else if (declSymbol.getIsVarArg() && !typeExprSymbol.isArray() && this.cachedArrayInterfaceType) {
                        var diagnostic = context.postError(this.unitPath, varDecl.minChar, varDecl.getLength(), "Rest parameters must be array types.", null, enclosingDecl);
                        typeExprSymbol = this.getNewErrorTypeSymbol(diagnostic);
                        hadError = true;
                    }

                    context.setTypeInContext(declSymbol, typeExprSymbol);

                    if (declParameterSymbol) {
                        declParameterSymbol.setType(typeExprSymbol);
                    }

                    // if the typeExprSymbol is generic, set the "hasGenericParameter" field on the enclosing signature
                    // we filter out arrays, since for those we just want to know if their element type is a type parameter...
                    if ((varDecl.nodeType === NodeType.Parameter) && enclosingDecl && ((typeExprSymbol.isGeneric() && !typeExprSymbol.isArray()) || this.isTypeArgumentOrWrapper(typeExprSymbol))) {
                        var signature = enclosingDecl.getSpecializingSignatureSymbol();

                        if (signature) {
                            signature.setHasGenericParameter();
                        }
                    }
                }
            }
            // Does it have an initializer? If so, typecheck and use that
            else if (varDecl.init) {

                var initExprSymbol = this.resolveStatementOrExpression(varDecl.init, false, wrapperDecl, context);

                if (!initExprSymbol) {
                    diagnostic = context.postError(this.unitPath, varDecl.minChar, varDecl.getLength(), "Unable to resolve type of '{0}'.", [varDecl.id.actualText], decl);

                    context.setTypeInContext(declSymbol, this.getNewErrorTypeSymbol(diagnostic));

                    if (declParameterSymbol) {
                        context.setTypeInContext(declParameterSymbol, this.semanticInfoChain.anyTypeSymbol);
                    }

                    hadError = true;
                }
                else {

                    context.setTypeInContext(declSymbol, this.widenType(initExprSymbol.getType()));
                    initExprSymbol.addOutgoingLink(declSymbol, SymbolLinkKind.ProvidesInferredType);

                    if (declParameterSymbol) {
                        context.setTypeInContext(declParameterSymbol, initExprSymbol.getType());
                        initExprSymbol.addOutgoingLink(declParameterSymbol, SymbolLinkKind.ProvidesInferredType);
                    }
                }
            }
            else if (declSymbol.getKind() === PullElementKind.Container) { // module instance value
                instanceSymbol = (<PullContainerTypeSymbol>declSymbol).getInstanceSymbol();
                var instanceType = instanceSymbol.getType();

                if (instanceType) {
                    context.setTypeInContext(declSymbol, instanceType);
                }
                else {
                    context.setTypeInContext(declSymbol, this.semanticInfoChain.anyTypeSymbol);
                }
            }
            //else if () {} // class instance value
            // Otherwise, it's of type 'any'
            else {
                var defaultType = this.semanticInfoChain.anyTypeSymbol;

                if (declSymbol.getIsVarArg() && this.cachedArrayInterfaceType) {
                    defaultType = specializeToArrayType(this.cachedArrayInterfaceType, defaultType, this, context);
                }

                context.setTypeInContext(declSymbol, defaultType);

                if (declParameterSymbol) {
                    declParameterSymbol.setType(defaultType);
                }
            }

            declSymbol.setResolved();

            if (declParameterSymbol) {
                declParameterSymbol.setResolved();
            }

            return declSymbol;
        }

        public resolveTypeParameterDeclaration(typeParameterAST: TypeParameter, context: PullTypeResolutionContext): PullTypeSymbol {
            var typeParameterDecl = this.getDeclForAST(typeParameterAST);
            var typeParameterSymbol = <PullTypeParameterSymbol>typeParameterDecl.getSymbol();

            if (typeParameterSymbol.isResolved() || typeParameterSymbol.isResolving()) {
                return typeParameterSymbol;
            }

            typeParameterSymbol.startResolving();

            if (typeParameterAST.constraint) {
                var enclosingDecl = this.getEnclosingDecl(typeParameterDecl);
                var constraintTypeSymbol = this.resolveTypeReference(<TypeReference>typeParameterAST.constraint, enclosingDecl, context);

                if (constraintTypeSymbol.isNamedTypeSymbol() && constraintTypeSymbol.isGeneric() && !constraintTypeSymbol.isTypeParameter() && constraintTypeSymbol.isResolved && !constraintTypeSymbol.getIsSpecialized()) {
                    constraintTypeSymbol = this.specializeTypeToAny(constraintTypeSymbol, enclosingDecl, context);
                }

                if (!constraintTypeSymbol) {
                    context.postError(this.unitPath, typeParameterAST.minChar, typeParameterAST.getLength(), "Unable to resolve type parameter constraint.", null, enclosingDecl, true);
                }
                else if (constraintTypeSymbol.isPrimitive()) {
                    if (constraintTypeSymbol.isError()) {
                        var errorSymbol = (<PullErrorTypeSymbol>constraintTypeSymbol).getDiagnostic();
                        context.postError(this.unitPath, typeParameterAST.constraint.minChar, typeParameterAST.constraint.getLength(), errorSymbol.diagnosticKey(), errorSymbol.arguments(), enclosingDecl, true);
                    }
                    else {
                        context.postError(this.unitPath, typeParameterAST.constraint.minChar, typeParameterAST.constraint.getLength(), "Type parameter constraint cannot be a primitive type.", null, enclosingDecl, true);
                    }
                }
                else {
                    typeParameterSymbol.setConstraint(constraintTypeSymbol);
                }
            }

            typeParameterSymbol.setResolved();

            return typeParameterSymbol;
        }

        public resolveFunctionBodyReturnTypes(funcDeclAST: FunctionDeclaration, signature: PullSignatureSymbol, useContextualType: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            var returnStatements: {
                returnStatement: ReturnStatement; enclosingDecl: PullDecl;
            }[] = [];

            var enclosingDeclStack: PullDecl[] = [enclosingDecl];

            var preFindReturnExpressionTypes = (ast: AST, parent: AST, walker: IAstWalker) => {
                var go = true;

                switch (ast.nodeType) {
                    case NodeType.FunctionDeclaration:
                        // don't recurse into a function decl - we don't want to confuse a nested
                        // return type with the top-level function's return type
                        go = false;
                        break;

                    case NodeType.ReturnStatement:
                        var returnStatement: ReturnStatement = <ReturnStatement>ast;
                        returnStatements[returnStatements.length] = { returnStatement: returnStatement, enclosingDecl: enclosingDeclStack[enclosingDeclStack.length - 1]};
                        go = false;
                        break;

                    case NodeType.CatchClause:
                    case NodeType.WithStatement:
                        enclosingDeclStack[enclosingDeclStack.length] = this.getDeclForAST(ast);
                        break;

                    default:
                        break;
                }

                walker.options.goChildren = go;

                return ast;
            }

            var postFindReturnExpressionEnclosingDecls = function (ast: AST, parent: AST, walker: IAstWalker) {
                switch (ast.nodeType) {
                    case NodeType.CatchClause:
                    case NodeType.WithStatement:
                        enclosingDeclStack.length--;
                        break;
                    default:
                        break;
                    }

                walker.options.goChildren = true;

                return ast;
            }

            getAstWalkerFactory().walk(funcDeclAST.block, preFindReturnExpressionTypes, postFindReturnExpressionEnclosingDecls);

            if (!returnStatements.length) {
                if (useContextualType) {
                    var contextualType = this.widenType(context.getContextualType());

                    signature.setReturnType(contextualType);

                    var isVoidOrAny = this.isAnyOrEquivalent(contextualType) || contextualType === this.semanticInfoChain.voidTypeSymbol;

                    if (!isVoidOrAny) {
                        context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), "Function declared a non-void return type, but has no return expression.", null, enclosingDecl, true);
                    }
                }
                else {
                    signature.setReturnType(this.semanticInfoChain.voidTypeSymbol);
                }
            }

            else {
                var returnExpressionSymbols: PullTypeSymbol[] = [];
                var returnType: PullTypeSymbol;

                for (var i = 0; i < returnStatements.length; i++) {
                    if (returnStatements[i].returnStatement.returnExpression) {
                        returnType = this.resolveStatementOrExpression(returnStatements[i].returnStatement.returnExpression, useContextualType, returnStatements[i].enclosingDecl, context).getType();

                        if (returnType.isError()) {
                            signature.setReturnType(returnType);
                            return;
                        }

                        returnExpressionSymbols[returnExpressionSymbols.length] = returnType;
                    }
                }

                if (!returnExpressionSymbols.length) {
                    signature.setReturnType(this.semanticInfoChain.voidTypeSymbol);
                }
                else {

                    // combine return expression types for best common type
                    var collection: IPullTypeCollection = {
                        getLength: () => { return returnExpressionSymbols.length; } ,
                        setTypeAtIndex: (index: number, type: PullTypeSymbol) => { } ,
                        getTypeAtIndex: (index: number) => {
                            return returnExpressionSymbols[index].getType();
                        }
                    }

                    returnType = this.findBestCommonType(returnExpressionSymbols[0], null, collection, true, context, new TypeComparisonInfo());

                    signature.setReturnType(returnType ? this.widenType(returnType) : this.semanticInfoChain.anyTypeSymbol);

                    // link return expressions to signature type to denote inference
                    for (var i = 0; i < returnExpressionSymbols.length; i++) {
                        returnExpressionSymbols[i].addOutgoingLink(signature, SymbolLinkKind.ProvidesInferredType);
                    }
                }
            }
        }

        public resolveFunctionDeclaration(funcDeclAST: FunctionDeclaration, context: PullTypeResolutionContext): PullSymbol {

            var funcDecl: PullDecl = this.getDeclForAST(funcDeclAST);

            var funcSymbol = <PullFunctionTypeSymbol>funcDecl.getSymbol();

            var signature: PullSignatureSymbol = funcDecl.getSpecializingSignatureSymbol();

            var hadError = false;

            var isConstructor = funcDeclAST.isConstructor || hasFlag(funcDeclAST.getFunctionFlags(), FunctionFlags.ConstructMember);

            if (signature) {

                if (signature.isResolved()) {
                    return funcSymbol;
                }

                if (isConstructor && !signature.isResolving()) {
                    var classAST = funcDeclAST.classDecl;

                    if (classAST) {
                        var classDecl = this.getDeclForAST(classAST);
                        var classSymbol = classDecl.getSymbol();

                        if (!classSymbol.isResolved() && !classSymbol.isResolving()) {
                            this.resolveDeclaredSymbol(classSymbol, this.getEnclosingDecl(classDecl), context);
                        }
                    }
                }

                var diagnostic: Diagnostic;

                if (signature.isResolving()) {

                    // try to set the return type, even though we may be lacking in some information
                    if (funcDeclAST.returnTypeAnnotation) {
                        var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                        var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, funcDecl, context);
                        if (!returnTypeSymbol) {
                            diagnostic = context.postError(this.unitPath, funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), "Cannot resolve return type reference.", null, funcDecl);
                            signature.setReturnType(this.getNewErrorTypeSymbol(diagnostic));
                            hadError = true;
                        } else {
                            if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                                signature.setHasGenericParameter();
                                if (funcSymbol) {
                                    funcSymbol.getType().setHasGenericSignature();
                                }
                            }
                            signature.setReturnType(returnTypeSymbol);

                            if (isConstructor && returnTypeSymbol === this.semanticInfoChain.voidTypeSymbol) {
                                context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), "Constructors cannot have a return type of 'void'.", null, funcDecl, true);
                            }
                        }
                    }
                    else {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }

                    signature.setResolved();
                    return funcSymbol;
                }

                signature.startResolving();

                if (funcDeclAST.typeArguments) {
                    for (var i = 0; i < funcDeclAST.typeArguments.members.length; i++) {
                        this.resolveTypeParameterDeclaration(<TypeParameter>funcDeclAST.typeArguments.members[i], context);
                    }
                }

                // resolve parameter type annotations as necessary
                if (funcDeclAST.arguments) {
                    for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                        this.resolveVariableDeclaration(<BoundDecl>funcDeclAST.arguments.members[i], context, funcDecl);
                    }
                }

                if (signature.isGeneric()) {
                    // PULLREVIEW: This is split into a spearate if statement to make debugging slightly easier...
                    if (funcSymbol) {
                        funcSymbol.getType().setHasGenericSignature();
                    }
                }

                // resolve the return type annotation
                if (funcDeclAST.returnTypeAnnotation) {
                    returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;

                    // use the funcDecl for the enclosing decl, since we want to pick up any type parameters 
                    // on the function when resolving the return type
                    returnTypeSymbol = this.resolveTypeReference(returnTypeRef, funcDecl, context);

                    if (!returnTypeSymbol) {
                        diagnostic = context.postError(this.unitPath, funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), "Cannot resolve return type reference.", null, funcDecl);
                        signature.setReturnType(this.getNewErrorTypeSymbol(diagnostic));

                        hadError = true;
                    }
                    else {
                        if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                            signature.setHasGenericParameter();

                            if (funcSymbol) {
                                funcSymbol.getType().setHasGenericSignature();
                            }
                        }

                        signature.setReturnType(returnTypeSymbol);

                        if (isConstructor && returnTypeSymbol === this.semanticInfoChain.voidTypeSymbol) {
                            context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), "Constructors cannot have a return type of 'void'.", null, funcDecl, true);
                        }
                    }
                }
                // if there's no return-type annotation
                //     - if it's not a definition signature, set the return type to 'any'
                //     - if it's a definition sigature, take the best common type of all return expressions
                //     - if it's a constructor, we set the return type link during binding
                else if (!funcDeclAST.isConstructor) {
                    if (funcDeclAST.isSignature()) {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                    else {
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, false, funcDecl, new PullTypeResolutionContext());
                    }
                }

                if (!hadError) {
                    signature.setResolved();
                }
            }

            // don't resolve anything here that's not relevant to the type of the function!

            return funcSymbol;
        }

        public resolveGetAccessorDeclaration(funcDeclAST: FunctionDeclaration, context: PullTypeResolutionContext): PullSymbol {

            var funcDecl: PullDecl = this.getDeclForAST(funcDeclAST);
            var accessorSymbol = <PullAccessorSymbol> funcDecl.getSymbol();

            var getterSymbol = accessorSymbol.getGetter();
            var getterTypeSymbol = <PullFunctionTypeSymbol>getterSymbol.getType();

            var signature: PullSignatureSymbol = getterTypeSymbol.getCallSignatures()[0];

            var hadError = false;
            var diagnostic: Diagnostic;

            if (signature) {

                if (signature.isResolved()) {
                    return accessorSymbol;
                }

                if (signature.isResolving()) {
                    // PULLTODO: Error or warning?
                    signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    signature.setResolved();

                    return accessorSymbol;
                }

                signature.startResolving();

                // resolve parameter type annotations as necessary
                if (funcDeclAST.arguments) {
                    for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                        this.resolveVariableDeclaration(<BoundDecl>funcDeclAST.arguments.members[i], context, funcDecl);
                    }
                }

                if (signature.hasGenericParameter()) {
                    // PULLREVIEW: This is split into a spearate if statement to make debugging slightly easier...
                    if (getterSymbol) {
                        getterTypeSymbol.setHasGenericSignature();
                    }
                }

                // resolve the return type annotation
                if (funcDeclAST.returnTypeAnnotation) {
                    var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;

                    // use the funcDecl for the enclosing decl, since we want to pick up any type parameters 
                    // on the function when resolving the return type
                    var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, funcDecl, context);

                    if (!returnTypeSymbol) {
                        diagnostic = context.postError(this.unitPath, funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), "Cannot resolve return type reference.", null, funcDecl);
                        signature.setReturnType(this.getNewErrorTypeSymbol(diagnostic));

                        hadError = true;
                    }
                    else {

                        if (this.isTypeArgumentOrWrapper(returnTypeSymbol)) {
                            signature.setHasGenericParameter();

                            if (getterSymbol) {
                                getterTypeSymbol.setHasGenericSignature();
                            }
                        }

                        signature.setReturnType(returnTypeSymbol);
                    }
                }

                // if there's no return-type annotation
                //     - if it's not a definition signature, set the return type to 'any'
                //     - if it's a definition sigature, take the best common type of all return expressions
                else {
                    if (funcDeclAST.isSignature()) {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                    else {
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, false, funcDecl, new PullTypeResolutionContext());
                    }
                }


                if (!hadError) {
                    signature.setResolved();
                }
            }

            var accessorType = signature.getReturnType();

            var setter = accessorSymbol.getSetter();

            if (setter) {
                var setterType = setter.getType();
                var setterSig = setterType.getCallSignatures()[0];

                if (setterSig.isResolved()) {
                    // compare setter parameter type and getter return type
                    var setterParameters = setterSig.getParameters();

                    if (setterParameters.length) {
                        var setterParameter = setterParameters[0];
                        var setterParameterType = setterParameter.getType();

                        if (!this.typesAreIdentical(accessorType, setterParameterType)) {
                            diagnostic = context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), "'get' and 'set' accessor must have the same type.", null, this.getEnclosingDecl(funcDecl));
                            accessorSymbol.setType(this.getNewErrorTypeSymbol(diagnostic));
                        }
                    }
                }
                else {
                    accessorSymbol.setType(accessorType);
                }

            }
            else {
                accessorSymbol.setType(accessorType);
            }

            return accessorSymbol;
        }

        public resolveSetAccessorDeclaration(funcDeclAST: FunctionDeclaration, context: PullTypeResolutionContext): PullSymbol {

            var funcDecl: PullDecl = this.getDeclForAST(funcDeclAST);
            var accessorSymbol = <PullAccessorSymbol> funcDecl.getSymbol();

            var setterSymbol = accessorSymbol.getSetter();
            var setterTypeSymbol = <PullFunctionTypeSymbol>setterSymbol.getType();

            var signature: PullSignatureSymbol = setterTypeSymbol.getCallSignatures()[0];

            var hadError = false;

            if (signature) {

                if (signature.isResolved()) {
                    return accessorSymbol;
                }

                if (signature.isResolving()) {
                    // PULLTODO: Error or warning?
                    signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    signature.setResolved();

                    return accessorSymbol;
                }

                signature.startResolving();

                // resolve parameter type annotations as necessary
                if (funcDeclAST.arguments) {
                    for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                        this.resolveVariableDeclaration(<BoundDecl>funcDeclAST.arguments.members[i], context, funcDecl);
                    }
                }

                if (signature.hasGenericParameter()) {
                    // PULLREVIEW: This is split into a spearate if statement to make debugging slightly easier...
                    if (setterSymbol) {
                        setterTypeSymbol.setHasGenericSignature();
                    }
                }

                if (!hadError) {
                    signature.setResolved();
                }
            }

            var parameters = signature.getParameters();

            var getter = accessorSymbol.getGetter();

            var accessorType = parameters.length ? parameters[0].getType() : getter ? getter.getType() : this.semanticInfoChain.undefinedTypeSymbol;

            if (getter) {
                var getterType = getter.getType();
                var getterSig = getterType.getCallSignatures()[0];

                if (accessorType == this.semanticInfoChain.undefinedTypeSymbol) {
                    accessorType = getterType;
                }

                if (getterSig.isResolved()) {
                    // compare setter parameter type and getter return type
                    var getterReturnType = getterSig.getReturnType();

                    if (!this.typesAreIdentical(accessorType, getterReturnType)) {
                        if (this.isAnyOrEquivalent(accessorType)) {
                            accessorSymbol.setType(getterReturnType);
                            if (!accessorType.isError()) {
                                parameters[0].setType(getterReturnType);
                            }
                        }
                        else {
                            var diagnostic = context.postError(this.unitPath, funcDeclAST.minChar, funcDeclAST.getLength(), "'get' and 'set' accessor must have the same type.", null, this.getEnclosingDecl(funcDecl));
                            accessorSymbol.setType(this.getNewErrorTypeSymbol(diagnostic));
                        }
                    }
                }
                else {
                    accessorSymbol.setType(accessorType);
                }
            }
            else {
                accessorSymbol.setType(accessorType);
            }            

            return accessorSymbol;
        }


        // Expression resolution

        public resolveAST(ast: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            switch (ast.nodeType) {
                case NodeType.ModuleDeclaration:
                case NodeType.InterfaceDeclaration:
                case NodeType.ClassDeclaration:
                case NodeType.VariableDeclarator:
                case NodeType.Parameter:
                    return this.resolveDeclaration(ast, context, enclosingDecl);

                case NodeType.FunctionDeclaration:
                    if (inContextuallyTypedAssignment || ((<FunctionDeclaration>ast).getFunctionFlags() & FunctionFlags.IsFunctionExpression)) {
                        return this.resolveStatementOrExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);
                    }
                    else {
                        return this.resolveDeclaration(ast, context, enclosingDecl);
                    }

                default:
                    return this.resolveStatementOrExpression(ast, inContextuallyTypedAssignment, enclosingDecl, context);
            }
        }

        public resolveStatementOrExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            switch (expressionAST.nodeType) {
                case NodeType.Name:
                    if (context.searchTypeSpace) {
                        return this.resolveTypeNameExpression(<Identifier>expressionAST, enclosingDecl, context);
                    }
                    else {
                        return this.resolveNameExpression(<Identifier>expressionAST, enclosingDecl, context);
                    }
                case GenericType:
                    return this.resolveGenericTypeReference(<GenericType>expressionAST, enclosingDecl, context);
                case NodeType.MemberAccessExpression:
                    if (context.searchTypeSpace) {
                        return this.resolveDottedTypeNameExpression(<BinaryExpression>expressionAST, enclosingDecl, context);
                    }
                    else {
                        return this.resolveDottedNameExpression(<BinaryExpression>expressionAST, enclosingDecl, context);
                    }

                case NodeType.FunctionDeclaration:
                    {
                        var funcDecl = <FunctionDeclaration>expressionAST;

                        if (funcDecl.isGetAccessor()) {
                            return this.resolveGetAccessorDeclaration(funcDecl, context);
                        }
                        else if (funcDecl.isSetAccessor()) {
                            return this.resolveSetAccessorDeclaration(funcDecl, context);
                        }
                        else {
                            return this.resolveFunctionExpression(funcDecl, inContextuallyTypedAssignment, enclosingDecl, context);
                        }
                    }

                case NodeType.ObjectLiteralExpression:
                    return this.resolveObjectLiteralExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.ArrayLiteralExpression:
                    return this.resolveArrayLiteralExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.ThisExpression:
                    return this.resolveThisExpression(expressionAST, enclosingDecl, context);

                case NodeType.SuperExpression:
                    return this.resolveSuperExpression(expressionAST, enclosingDecl, context);

                case NodeType.InvocationExpression:
                    return this.resolveCallExpression(<CallExpression>expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.ObjectCreationExpression:
                    return this.resolveNewExpression(<CallExpression>expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.CastExpression:
                    return this.resolveTypeAssertionExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.TypeRef:
                    return this.resolveTypeReference(<TypeReference>expressionAST, enclosingDecl, context);

                // primitives
                case NodeType.NumericLiteral:
                    return this.semanticInfoChain.numberTypeSymbol;
                case NodeType.StringLiteral:
                    return this.semanticInfoChain.stringTypeSymbol;
                case NodeType.NullLiteral:
                    return this.semanticInfoChain.nullTypeSymbol;
                case NodeType.TrueLiteral:
                case NodeType.FalseLiteral:
                    return this.semanticInfoChain.booleanTypeSymbol;
                case NodeType.VoidExpression:
                    return this.semanticInfoChain.voidTypeSymbol;

                // assignment
                case NodeType.AssignmentExpression:
                    return this.resolveAssignmentStatement(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                // boolean operations
                case NodeType.LogicalNotExpression:
                case NodeType.NotEqualsWithTypeConversionExpression:
                case NodeType.EqualsWithTypeConversionExpression:
                case NodeType.EqualsExpression:
                case NodeType.NotEqualsExpression:
                case NodeType.LessThanExpression:
                case NodeType.LessThanOrEqualExpression:
                case NodeType.GreaterThanOrEqualExpression:
                case NodeType.GreaterThanExpression:
                    return this.semanticInfoChain.booleanTypeSymbol;

                case NodeType.AddExpression:
                case NodeType.AddAssignmentExpression:
                    return this.resolveArithmeticExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.SubtractAssignmentExpression:
                case NodeType.MultiplyAssignmentExpression:
                case NodeType.DivideAssignmentExpression:
                case NodeType.ModuloAssignmentExpression:
                case NodeType.OrAssignmentExpression:
                case NodeType.AndAssignmentExpression:

                case NodeType.BitwiseNotExpression:
                case NodeType.SubtractExpression:
                case NodeType.MultiplyExpression:
                case NodeType.DivideExpression:
                case NodeType.ModuloExpression:
                case NodeType.BitwiseOrExpression:
                case NodeType.BitwiseAndExpression:
                case NodeType.PlusExpression:
                case NodeType.NegateExpression:
                case NodeType.PostIncrementExpression:
                case NodeType.PreIncrementExpression:
                case NodeType.PostDecrementExpression:
                case NodeType.PreDecrementExpression:
                    return this.semanticInfoChain.numberTypeSymbol;

                case NodeType.LeftShiftExpression:
                case NodeType.SignedRightShiftExpression:
                case NodeType.UnsignedRightShiftExpression:
                case NodeType.LeftShiftAssignmentExpression:
                case NodeType.SignedRightShiftAssignmentExpression:
                case NodeType.UnsignedRightShiftAssignmentExpression:
                    return this.semanticInfoChain.numberTypeSymbol;

                case NodeType.ElementAccessExpression:
                    return this.resolveIndexExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.LogicalOrExpression:
                    return this.resolveLogicalOrExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);
                case NodeType.LogicalAndExpression:
                    return this.resolveLogicalAndExpression(expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.TypeOfExpression:
                    return this.semanticInfoChain.stringTypeSymbol;

                case NodeType.ThrowStatement:
                    return this.semanticInfoChain.voidTypeSymbol;

                case NodeType.DeleteExpression:
                    return this.semanticInfoChain.booleanTypeSymbol;

                case NodeType.ConditionalExpression:
                    return this.resolveConditionalExpression(<ConditionalExpression>expressionAST, enclosingDecl, context);

                case NodeType.RegularExpressionLiteral:
                    return this.cachedRegExpInterfaceType ? this.cachedRegExpInterfaceType : this.semanticInfoChain.anyTypeSymbol;

                case NodeType.ParenthesizedExpression:
                    return this.resolveParenthesizedExpression(<ParenthesizedExpression>expressionAST, enclosingDecl, context);

                case NodeType.ExpressionStatement:
                    return this.resolveExpressionStatement(<ExpressionStatement>expressionAST, inContextuallyTypedAssignment, enclosingDecl, context);

                case NodeType.InstanceOfExpression:
                    return this.semanticInfoChain.booleanTypeSymbol;
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        private isNameOrMemberAccessExpression(ast: AST): boolean {

            var checkAST = ast;

            while (checkAST) {
                if (checkAST.nodeType === NodeType.ExpressionStatement) {
                    checkAST = (<ExpressionStatement>checkAST).expression;
                }
                else if (checkAST.nodeType === NodeType.ParenthesizedExpression) {
                    checkAST = (<ParenthesizedExpression>checkAST).expression;
                }
                else if (checkAST.nodeType === NodeType.Name) {
                    return true;
                }
                else if (checkAST.nodeType === NodeType.MemberAccessExpression) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }

        public resolveNameSymbol(nameSymbol: PullSymbol, context: PullTypeResolutionContext) {
            if (nameSymbol && !context.searchTypeSpace && !context.canUseTypeSymbol && 
                nameSymbol != this.semanticInfoChain.undefinedTypeSymbol && nameSymbol != this.semanticInfoChain.nullTypeSymbol &&
                (nameSymbol.isPrimitive() ||
                !(nameSymbol.getKind() & TypeScript.PullElementKind.SomeValue))) {
                    nameSymbol = null;
            }

            return nameSymbol
        }

        public resolveNameExpression(nameAST: Identifier, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            if (nameAST.isMissing()) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            var nameSymbol: PullSymbol = this.getSymbolForAST(nameAST, context);

            if (nameSymbol /*&& nameSymbol.isResolved()*/) {
                if (!nameSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(nameSymbol, enclosingDecl, context);
                }
                return nameSymbol;
            }

            var id = nameAST.text;

            var declPath: PullDecl[] = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];

            if (enclosingDecl && !declPath.length) {
                declPath = [enclosingDecl];
            }

            nameSymbol = this.getSymbolFromDeclPath(id, declPath, PullElementKind.SomeValue);

            // PULLREVIEW: until further notice, search out for modules or enums
            if (!nameSymbol) {
                nameSymbol = this.getSymbolFromDeclPath(id, declPath, PullElementKind.SomeType);
                nameSymbol = this.resolveNameSymbol(nameSymbol, context);
            }

            if (!nameSymbol && id === "arguments" && enclosingDecl && (enclosingDecl.getKind() & PullElementKind.SomeFunction)) {
                nameSymbol = this.cachedFunctionArgumentsSymbol;
            }

            if (!nameSymbol) {
                var diagnostic = context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), "Could not find symbol '{0}'.", [nameAST.actualText], enclosingDecl);
                return this.getNewErrorTypeSymbol(diagnostic);
            }

            if (!nameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(nameSymbol, enclosingDecl, context);
            }

            this.setSymbolForAST(nameAST, nameSymbol, context);

            return nameSymbol;
        }

        public resolveDottedNameExpression(dottedNameAST: BinaryExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            if ((<Identifier>dottedNameAST.operand2).isMissing()) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            var nameSymbol: PullSymbol = this.getSymbolForAST(dottedNameAST, context);

            if (nameSymbol /*&& nameSymbol.isResolved()*/) {
                if (!nameSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(nameSymbol, enclosingDecl, context);
                }
                return nameSymbol;
            }

            // assemble the dotted name path
            var rhsName = (<Identifier>dottedNameAST.operand2).text;
            var prevCanUseTypeSymbol = context.canUseTypeSymbol;
            context.canUseTypeSymbol = true;
            var lhs: PullSymbol = this.resolveStatementOrExpression(dottedNameAST.operand1, false, enclosingDecl, context);
            context.canUseTypeSymbol = prevCanUseTypeSymbol;
            var lhsType = lhs.getType();
            var diagnostic: Diagnostic;

            if (lhs.isAlias()) {
                (<PullTypeAliasSymbol>lhs).setIsUsedAsValue();
            }

            if (this.isAnyOrEquivalent(lhsType)) {
                return lhsType;
            }

            if (!lhsType) {
                diagnostic = context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), "Could not find enclosing symbol for dotted name '{0}'.", [(<Identifier>dottedNameAST.operand2).actualText], enclosingDecl);
                return this.getNewErrorTypeSymbol(diagnostic);
            }

            // if we're resolving a type reference, we really only want to check the constructor type
            if (lhsType === this.semanticInfoChain.numberTypeSymbol && this.cachedNumberInterfaceType) {
                lhsType = this.cachedNumberInterfaceType;
            }
            else if (lhsType === this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {
                lhsType = this.cachedStringInterfaceType;
            }
            else if (lhsType === this.semanticInfoChain.booleanTypeSymbol && this.cachedBooleanInterfaceType) {
                lhsType = this.cachedBooleanInterfaceType;
            }

            if (!lhsType.isResolved()) {
                var potentiallySpecializedType = <PullTypeSymbol>this.resolveDeclaredSymbol(lhsType, enclosingDecl, context);

                if (potentiallySpecializedType != lhsType) {
                    if (!lhs.isType()) {
                        context.setTypeInContext(lhs, potentiallySpecializedType);
                    }

                    lhsType = potentiallySpecializedType;
                }
            }

            if (rhsName === "prototype") {

                if (lhsType.isClass()) {
                    return lhsType;
                }
                else {
                    var classInstanceType = lhsType.getAssociatedContainerType();

                    if (classInstanceType && classInstanceType.isClass()) {
                        return classInstanceType;
                    }
                }
            }

            // now for the name...
            // For classes, check the statics first below
            if (!(lhs.isType() && (<PullTypeSymbol>lhs).isClass() && this.isNameOrMemberAccessExpression(dottedNameAST.operand1)) && !nameSymbol) {
                nameSymbol = lhsType.findMember(rhsName);
                nameSymbol = this.resolveNameSymbol(nameSymbol, context);
            }

            if (!nameSymbol) {

                // could be a static
                if (lhsType.isClass()) {
                    var staticType = (<PullClassTypeSymbol>lhsType).getConstructorMethod().getType();

                    nameSymbol = staticType.findMember(rhsName);

                    if (!nameSymbol) {
                        nameSymbol = lhsType.findMember(rhsName);
                    }
                }
                // could be an enum
                else if ((lhsType.getKind() === PullElementKind.Enum) && this.cachedNumberInterfaceType) {
                    lhsType = this.cachedNumberInterfaceType;

                    nameSymbol = lhsType.findMember(rhsName);
                }
                // could be a function symbol
                else if ((lhsType.getCallSignatures().length || lhsType.getConstructSignatures().length) && this.cachedFunctionInterfaceType) {
                    lhsType = this.cachedFunctionInterfaceType;

                    nameSymbol = lhsType.findMember(rhsName);
                }
                // could be a type parameter with a contraint
                else if (lhsType.isTypeParameter()) {
                    var constraint = (<PullTypeParameterSymbol>lhsType).getConstraint();

                    if (constraint) {
                        nameSymbol = constraint.findMember(rhsName);
                    }
                }
                else if (lhsType.isContainer()) {
                    var associatedInstance = (<PullContainerTypeSymbol>lhsType).getInstanceSymbol();

                    if (associatedInstance) {
                        var instanceType = associatedInstance.getType();

                        nameSymbol = instanceType.findMember(rhsName);
                    }
                }
                // could be a module instance
                else {
                    var associatedType = lhsType.getAssociatedContainerType();

                    if (associatedType) {
                        nameSymbol = associatedType.findMember(rhsName);
                    }
                }
                nameSymbol = this.resolveNameSymbol(nameSymbol, context);

                // could be an object member
                if (!nameSymbol && !lhsType.isPrimitive() && this.cachedObjectInterfaceType) {
                    nameSymbol = this.cachedObjectInterfaceType.findMember(rhsName);
                }

                if (!nameSymbol) {
                    diagnostic = context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), "The property '{0}' does not exist on value of type '{1}'.", [(<Identifier>dottedNameAST.operand2).actualText, lhsType.getDisplayName()], enclosingDecl);
                    return this.getNewErrorTypeSymbol(diagnostic);
                }
            }

            if (!nameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(nameSymbol, enclosingDecl, context);
            }

            this.setSymbolForAST(dottedNameAST, nameSymbol, context);
            this.setSymbolForAST(dottedNameAST.operand2, nameSymbol, context);

            return nameSymbol;
        }

        public resolveTypeNameExpression(nameAST: Identifier, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            if (nameAST.isMissing()) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            var typeNameSymbol: PullTypeSymbol = <PullTypeSymbol>this.getSymbolForAST(nameAST, context);

            if (typeNameSymbol && typeNameSymbol.isType()) {
                if (!typeNameSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(typeNameSymbol, enclosingDecl, context);
                }
                return typeNameSymbol;
            }

            var id = nameAST.text;

            // if it's a known primitive name, cheat
            if (id === "any") {
                typeNameSymbol = this.semanticInfoChain.anyTypeSymbol;
            }
            else if (id === "string") {
                typeNameSymbol = this.semanticInfoChain.stringTypeSymbol;
            }
            else if (id === "number") {
                typeNameSymbol = this.semanticInfoChain.numberTypeSymbol;
            }
            else if (id === "bool") {
                // Warn for using bool
                if (this.compilationSettings.disallowBool && !this.currentUnit.getProperties().unitContainsBool) {
                    this.currentUnit.getProperties().unitContainsBool = true;
                    diagnostic = context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), "Use of deprecated type 'bool'. Use 'boolean' instead.", [], enclosingDecl, true);
                }
                typeNameSymbol = this.semanticInfoChain.booleanTypeSymbol;
            }
            else if (id === "boolean") {
                typeNameSymbol = this.semanticInfoChain.booleanTypeSymbol;
            }
            else if (id === "null") {
                typeNameSymbol = this.semanticInfoChain.nullTypeSymbol;
            }
            else if (id === "undefined") {
                typeNameSymbol = this.semanticInfoChain.undefinedTypeSymbol;
            }
            else if (id === "void") {
                typeNameSymbol = this.semanticInfoChain.voidTypeSymbol;
            }
            else if (id === "_element") {
                typeNameSymbol = this.semanticInfoChain.elementTypeSymbol;
            }
            else {

                var declPath: PullDecl[] = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];
                var diagnostic: Diagnostic;

                if (enclosingDecl && !declPath.length) {
                    declPath = [enclosingDecl];
                }

                typeNameSymbol = <PullTypeSymbol>this.getSymbolFromDeclPath(id, declPath, PullElementKind.SomeType);

                if (!typeNameSymbol) {
                    diagnostic = context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), "Could not find symbol '{0}'.", [nameAST.actualText], enclosingDecl);
                    return this.getNewErrorTypeSymbol(diagnostic);
                }

                if (typeNameSymbol.isTypeParameter()) {
                    if (enclosingDecl && (enclosingDecl.getKind() & PullElementKind.SomeFunction) && (enclosingDecl.getFlags() & PullElementFlags.Static)) {
                        var parentDecl = typeNameSymbol.getDeclarations()[0].getParentDecl();

                        if (parentDecl != enclosingDecl) {
                            diagnostic = context.postError(this.unitPath, nameAST.minChar, nameAST.getLength(), "Static methods cannot reference class type parameters.", null, enclosingDecl);

                            typeNameSymbol = this.getNewErrorTypeSymbol(diagnostic);

                            this.setSymbolForAST(nameAST, typeNameSymbol, context);

                            return typeNameSymbol;
                        }
                    }
                }

                typeNameSymbol = context.findSpecializationForType(typeNameSymbol);
            }

            if (!typeNameSymbol.isResolved()) {
                this.resolveDeclaredSymbol(typeNameSymbol, enclosingDecl, context);
            }

            if (typeNameSymbol.isType()) {
                this.setSymbolForAST(nameAST, typeNameSymbol, context);
            }

            return typeNameSymbol;
        }

        public resolveGenericTypeReference(genericTypeAST: GenericType, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol {
            var genericTypeSymbol: PullTypeSymbol = null
            var diagnostic: Diagnostic;

            var prevSearchTypeSpace = context.searchTypeSpace;
            context.searchTypeSpace = true;
            genericTypeSymbol = this.resolveStatementOrExpression(genericTypeAST.name, false, enclosingDecl, context).getType();
            context.searchTypeSpace = prevSearchTypeSpace;

            if (genericTypeSymbol.isError()) {
                return genericTypeSymbol;
            }

            if (!genericTypeSymbol.isResolving() && !genericTypeSymbol.isResolved()) {
                //genericTypeSymbol.startResolving();
                this.resolveDeclaredSymbol(genericTypeSymbol, enclosingDecl, context);
                //genericTypeSymbol.setResolved();
            }

            // specialize the type arguments
            var typeArgs: PullTypeSymbol[] = [];
            var typeArg: PullTypeSymbol = null;

            if (!context.isResolvingTypeArguments(genericTypeAST)) {

                context.startResolvingTypeArguments(genericTypeAST);

                if (genericTypeAST.typeArguments && genericTypeAST.typeArguments.members.length) {
                    for (var i = 0; i < genericTypeAST.typeArguments.members.length; i++) {
                        typeArg = this.resolveTypeReference(<TypeReference>genericTypeAST.typeArguments.members[i], enclosingDecl, context);

                        if (typeArg.isError()) {
                            context.doneResolvingTypeArguments();
                            return typeArg;                       
                        }

                        typeArgs[i] = context.findSpecializationForType(typeArg);
                    }
                }

                context.doneResolvingTypeArguments();
            }

            //if (genericTypeSymbol.isResolving()) {
            //    return genericTypeSymbol;
            //}

            var typeParameters = genericTypeSymbol.getTypeParameters();

            if (typeArgs.length && typeArgs.length != typeParameters.length) {
                diagnostic = context.postError(this.unitPath, genericTypeAST.minChar, genericTypeAST.getLength(), "Generic type '{0}' requires {1} type argument(s).", [genericTypeSymbol.toString(), genericTypeSymbol.getTypeParameters().length], enclosingDecl);

                return this.getNewErrorTypeSymbol(diagnostic);
            }

            var specializedSymbol = specializeType(genericTypeSymbol, typeArgs, this, enclosingDecl, context, genericTypeAST);

            // check constraints, if appropriate
            var typeConstraint: PullTypeSymbol = null;
            var upperBound: PullTypeSymbol = null;

            for (var iArg = 0; (iArg < typeArgs.length) && (iArg < typeParameters.length); iArg++) {
                typeArg = typeArgs[iArg];
                typeConstraint = typeParameters[iArg].getConstraint();

                // test specialization type for assignment compatibility with the constraint
                if (typeConstraint) {

                    if (typeArg.isTypeParameter()) {
                        upperBound = (<PullTypeParameterSymbol>typeArg).getConstraint();

                        if (upperBound) {
                            typeArg = upperBound;
                        }
                    }

                    if (typeArg.isResolving()) {
                        return specializedSymbol;
                    }
                    if (!this.sourceIsAssignableToTarget(typeArg, typeConstraint, context)) {
                        context.postError(this.unitPath, genericTypeAST.minChar, genericTypeAST.getLength(), "Type '{0}' does not satisfy the constraint '{1}' for type parameter '{2}'.", [typeArg.toString(true), typeConstraint.toString(true), typeParameters[iArg].toString(true)], enclosingDecl, true);
                    }
                }
            }

            return specializedSymbol;
        }

        public resolveDottedTypeNameExpression(dottedNameAST: BinaryExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {

            if ((<Identifier>dottedNameAST.operand2).isMissing()) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            var childTypeSymbol: PullTypeSymbol = <PullTypeSymbol>this.getSymbolForAST(dottedNameAST, context);

            if (childTypeSymbol /*&& childTypeSymbol.isResolved()*/) {
                if (!childTypeSymbol.isResolved()) {
                    this.resolveDeclaredSymbol(childTypeSymbol, enclosingDecl, context);
                }
                return childTypeSymbol;
            }

            var diagnostic: Diagnostic;

            // assemble the dotted name path
            var rhsName = (<Identifier>dottedNameAST.operand2).text;

            var prevSearchTypeSpace = context.searchTypeSpace;
            context.searchTypeSpace = true;

            var lhs: PullSymbol = this.resolveStatementOrExpression(dottedNameAST.operand1, false, enclosingDecl, context);

            context.searchTypeSpace = prevSearchTypeSpace;

            var lhsType = lhs.getType();

            if (context.isResolvingClassExtendedType) {
                if (lhs.isAlias()) {
                    (<PullTypeAliasSymbol>lhs).setIsUsedAsValue();
                }
            }

            if (this.isAnyOrEquivalent(lhsType)) {
                return lhsType;
            }

            if (!lhsType) {
                diagnostic = context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), "Could not find enclosing symbol for dotted name '{0}'.", [(<Identifier>dottedNameAST.operand2).actualText], enclosingDecl);
                return this.getNewErrorTypeSymbol(diagnostic);
            }

            // now for the name...
            childTypeSymbol = lhsType.findNestedType(rhsName);

            // If the name is expressed as a dotted name within the parent type,
            // then it will be considered a contained member, so back up to the nearest
            // enclosing symbol and look there
            if (!childTypeSymbol && enclosingDecl) {
                var parentDecl = enclosingDecl;

                while (parentDecl) {
                    if (parentDecl.getKind() & PullElementKind.SomeContainer) {
                        break;
                    }

                    parentDecl = parentDecl.getParentDecl();
                }

                if (parentDecl) {
                    var enclosingSymbolType = parentDecl.getSymbol().getType();

                    if (enclosingSymbolType === lhsType) {
                        childTypeSymbol = <PullTypeSymbol>lhsType.findContainedMember(rhsName);
                    }
                }
            }

            if (!childTypeSymbol) {
                diagnostic = context.postError(this.unitPath, dottedNameAST.operand2.minChar, dottedNameAST.operand2.getLength(), "The property '{0}' does not exist on value of type '{1}'.", [(<Identifier>dottedNameAST.operand2).actualText, lhsType.getName()], enclosingDecl);
                return this.getNewErrorTypeSymbol(diagnostic);
            }

            if (!childTypeSymbol.isResolved()) {
                this.resolveDeclaredSymbol(childTypeSymbol, enclosingDecl, context);
            }

            this.setSymbolForAST(dottedNameAST, childTypeSymbol, context);

            return childTypeSymbol;
        }

        public resolveFunctionExpression(funcDeclAST: FunctionDeclaration, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var functionDecl = this.getDeclForAST(funcDeclAST);
            var funcDeclSymbol: PullSymbol = null;

            if (functionDecl) {
                funcDeclSymbol = functionDecl.getSymbol();
                if (funcDeclSymbol.isResolved()) {
                    return funcDeclSymbol;
                }
            }

            // if we have an assigning AST with a type, and the funcDecl has no parameter types or return type annotation
            // we'll contextually type it
            // otherwise, just process it as a normal function declaration

            var shouldContextuallyType = inContextuallyTypedAssignment;

            var assigningFunctionTypeSymbol: PullFunctionTypeSymbol = null;
            var assigningFunctionSignature: PullSignatureSymbol = null;

            if (funcDeclAST.returnTypeAnnotation) {
                shouldContextuallyType = false;
            }

            if (shouldContextuallyType && funcDeclAST.arguments) {

                for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {
                    if ((<Parameter>funcDeclAST.arguments.members[i]).typeExpr) {
                        shouldContextuallyType = false;
                        break;
                    }
                }
            }

            if (shouldContextuallyType) {

                assigningFunctionTypeSymbol = <PullFunctionTypeSymbol>context.getContextualType();

                if (assigningFunctionTypeSymbol) {
                    this.resolveDeclaredSymbol(assigningFunctionTypeSymbol, enclosingDecl, context);

                    if (assigningFunctionTypeSymbol) {
                        assigningFunctionSignature = assigningFunctionTypeSymbol.getCallSignatures()[0];
                    }
                }
            }

            // create a new function decl and symbol

            if (!funcDeclSymbol) {
                var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                var declCollectionContext = new DeclCollectionContext(semanticInfo);

                declCollectionContext.scriptName = this.unitPath;

                if (enclosingDecl) {
                    declCollectionContext.pushParent(enclosingDecl);
                }

                getAstWalkerFactory().walk(funcDeclAST, preCollectDecls, postCollectDecls, null, declCollectionContext);

                functionDecl = this.getDeclForAST(funcDeclAST);

                var binder = new PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);
                binder.setUnit(this.unitPath);
                binder.bindFunctionExpressionToPullSymbol(functionDecl);

                funcDeclSymbol = <PullFunctionTypeSymbol>functionDecl.getSymbol();
            }

            var signature = funcDeclSymbol.getType().getCallSignatures()[0];

            // link parameters and resolve their annotations
            if (funcDeclAST.arguments) {

                var contextParams: PullSymbol[] = [];
                var contextParam: PullSymbol = null;

                if (assigningFunctionSignature) {
                    contextParams = assigningFunctionSignature.getParameters();
                }

                for (var i = 0; i < funcDeclAST.arguments.members.length; i++) {

                    if ((i < contextParams.length) && !contextParams[i].getIsVarArg()) {
                        contextParam = contextParams[i];
                    }
                    else if (contextParams.length && contextParams[contextParams.length - 1].getIsVarArg()) {
                        contextParam = (<PullArrayTypeSymbol>contextParams[contextParams.length - 1].getType()).getElementType();
                    }

                    // use the function decl as the enclosing decl, so as to properly resolve type parameters
                    this.resolveFunctionExpressionParameter(<Parameter>funcDeclAST.arguments.members[i], contextParam, functionDecl, context);
                }
            }

            // resolve the return type annotation
            if (funcDeclAST.returnTypeAnnotation) {
                var returnTypeRef = <TypeReference>funcDeclAST.returnTypeAnnotation;
                var returnTypeSymbol = this.resolveTypeReference(returnTypeRef, functionDecl, context);

                signature.setReturnType(returnTypeSymbol);

            }
            else {
                if (assigningFunctionSignature) {
                    var returnType = assigningFunctionSignature.getReturnType();

                    if (returnType) {
                        context.pushContextualType(returnType, context.inProvisionalResolution(), null);
                        //signature.setReturnType(returnType);
                        this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, true, functionDecl, context);
                        context.popContextualType();
                    }
                    else {
                        signature.setReturnType(this.semanticInfoChain.anyTypeSymbol);
                    }
                }
                else {
                    this.resolveFunctionBodyReturnTypes(funcDeclAST, signature, false, functionDecl, context);
                }
            }

            // set contextual type link
            if (assigningFunctionTypeSymbol) {
                funcDeclSymbol.addOutgoingLink(assigningFunctionTypeSymbol, SymbolLinkKind.ContextuallyTypedAs);
            }

            funcDeclSymbol.setResolved();

            return funcDeclSymbol;
        }

        // PULLTODO: Optimization: cache this for a given decl path
        public resolveThisExpression(ast: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol {
            if (!enclosingDecl) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            var previousResolutionSymbol = this.getSymbolForAST(ast, context);

            if (previousResolutionSymbol) {
                //CompilerDiagnostics.Alert("Call get hit");
                return <PullTypeSymbol>previousResolutionSymbol;
            }

            var enclosingDeclKind = enclosingDecl.getKind();
            var diagnostic: Diagnostic = null;

            if (enclosingDeclKind === PullElementKind.Container) { // Dynamic modules are ok, though
                diagnostic = new Diagnostic(this.currentUnit.getPath(), ast.minChar, ast.getLength(), "'this' cannot be referenced within module bodies.", null);
                return this.getNewErrorTypeSymbol(diagnostic);
            }
            else if (!(enclosingDeclKind & (PullElementKind.SomeFunction | PullElementKind.Script | PullElementKind.SomeBlock))) {
                diagnostic = new Diagnostic(this.currentUnit.getPath(), ast.minChar, ast.getLength(), "'this' must only be used inside a function or script context.", null);

                return this.getNewErrorTypeSymbol(diagnostic);
            }

            var declPath: PullDecl[] = this.getPathToDecl(enclosingDecl);

            // work back up the decl path, until you can find a class
            // PULLTODO: Obviously not completely correct, but this sufficiently unblocks testing of the pull model.
            // PULLTODO: Why is this 'obviously not completely correct'.  
            if (declPath.length) {
                for (var i = declPath.length - 1; i >= 0; i--) {
                    var decl = declPath[i];
                    var declKind = decl.getKind();
                    var declFlags = decl.getFlags();

                    if (declFlags & PullElementFlags.Static) {
                        this.setSymbolForAST(ast, this.semanticInfoChain.anyTypeSymbol, context);
                        return this.semanticInfoChain.anyTypeSymbol;
                    }

                    if (declKind === PullElementKind.FunctionExpression && !hasFlag(declFlags, PullElementFlags.FatArrow)) {
                        this.setSymbolForAST(ast, this.semanticInfoChain.anyTypeSymbol, context);
                        return this.semanticInfoChain.anyTypeSymbol;
                    }

                    if (declKind === PullElementKind.Function) {
                        this.setSymbolForAST(ast, this.semanticInfoChain.anyTypeSymbol, context);
                        return this.semanticInfoChain.anyTypeSymbol;
                    }

                    if (declKind === PullElementKind.Class) {
                        var classSymbol = <PullClassTypeSymbol>decl.getSymbol();

                        this.setSymbolForAST(ast, classSymbol, context);
                        return classSymbol;
                    }
                }
            }

            this.setSymbolForAST(ast, this.semanticInfoChain.anyTypeSymbol, context);
            return this.semanticInfoChain.anyTypeSymbol;
        }

        // PULLTODO: Optimization: cache this for a given decl path
        public resolveSuperExpression(ast: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            if (!enclosingDecl) {
                return this.semanticInfoChain.anyTypeSymbol;
            }

            var declPath: PullDecl[] = enclosingDecl !== null ? this.getPathToDecl(enclosingDecl) : [];
            var decl: PullDecl;
            var declFlags: PullElementFlags;
            var classSymbol: PullClassTypeSymbol = null;

            // work back up the decl path, until you can find a class
            if (declPath.length) {
                for (var i = declPath.length - 1; i >= 0; i--) {
                    decl = declPath[i];
                    declFlags = decl.getFlags();

                    if (decl.getKind() === PullElementKind.FunctionExpression &&
                        !(declFlags & PullElementFlags.FatArrow)) {

                        break;
                    }
                    else if (declFlags & PullElementFlags.Static) {
                        break;
                    }
                    else if (decl.getKind() === PullElementKind.Class) {
                        classSymbol = <PullClassTypeSymbol>decl.getSymbol();

                        break;
                    }
                }
            }

            if (classSymbol) {
                var parents = classSymbol.getExtendedTypes();

                if (parents.length) {
                    return parents[0];
                }
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        // if there's no type annotation on the assigning AST, we need to create a type from each binary expression
        // in the object literal
        public resolveObjectLiteralExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var previousResolutionSymbol = this.getSymbolForAST(expressionAST, context);

            if (previousResolutionSymbol) {
                //CompilerDiagnostics.Alert("Call get hit");
                return <PullTypeSymbol>previousResolutionSymbol;
            }

            var typeSymbol: PullTypeSymbol = <PullTypeSymbol>this.getSymbolForAST(expressionAST, context);
            var span: TextSpan;

            if (typeSymbol && typeSymbol.isResolved()) {
                return typeSymbol.getType();
            }

            // PULLTODO: Create a decl for the object literal

            // walk the members of the object literal,
            // create fields for each based on the value assigned in
            var objectLitAST = <UnaryExpression>expressionAST;

            span = TextSpan.fromBounds(objectLitAST.minChar, objectLitAST.limChar);

            var objectLitDecl = new PullDecl("", "", PullElementKind.ObjectLiteral, PullElementFlags.None, span, this.unitPath);

            if (enclosingDecl) {
                objectLitDecl.setParentDecl(enclosingDecl);
            }

            this.currentUnit.setDeclForAST(objectLitAST, objectLitDecl);
            this.currentUnit.setASTForDecl(objectLitDecl, objectLitAST);

            typeSymbol = new PullTypeSymbol("", PullElementKind.Interface);
            typeSymbol.addDeclaration(objectLitDecl);
            objectLitDecl.setSymbol(typeSymbol);

            var memberDecls = <ASTList>objectLitAST.operand;

            var contextualType: PullTypeSymbol = null;

            if (inContextuallyTypedAssignment) {
                contextualType = context.getContextualType();

                this.resolveDeclaredSymbol(contextualType, enclosingDecl, context);
            }

            if (memberDecls) {
                var binex: BinaryExpression;
                var memberSymbol: PullSymbol;
                var memberExprType: PullSymbol;
                var assigningSymbol: PullSymbol = null;
                var acceptedContextualType = false;

                for (var i = 0, len = memberDecls.members.length; i < len; i++) {
                    binex = <BinaryExpression>memberDecls.members[i];

                    var id = binex.operand1;
                    var text: string;
                    var actualText: string;

                    if (id.nodeType === NodeType.Name) {
                        actualText = (<Identifier>id).actualText;
                        text = (<Identifier>id).text;
                    }
                    else if (id.nodeType === NodeType.StringLiteral) {
                        actualText = (<StringLiteral>id).actualText;
                        text = (<StringLiteral>id).text;
                    }
                    else {
                        return this.semanticInfoChain.anyTypeSymbol;
                    }

                    // PULLTODO: Collect these at decl collection time, add them to the var decl
                    span = TextSpan.fromBounds(binex.minChar, binex.limChar);

                    var decl = new PullDecl(text, actualText, PullElementKind.Property, PullElementFlags.Public, span, this.unitPath);

                    objectLitDecl.addChildDecl(decl);
                    decl.setParentDecl(objectLitDecl);

                    this.semanticInfoChain.getUnit(this.unitPath).setDeclForAST(binex, decl);
                    this.semanticInfoChain.getUnit(this.unitPath).setASTForDecl(decl, binex);

                    memberSymbol = new PullSymbol(text, PullElementKind.Property);

                    memberSymbol.addDeclaration(decl);
                    decl.setSymbol(memberSymbol);

                    if (contextualType) {
                        assigningSymbol = contextualType.findMember(text);

                        if (assigningSymbol) {

                            this.resolveDeclaredSymbol(assigningSymbol, enclosingDecl, context);

                            context.pushContextualType(assigningSymbol.getType(), context.inProvisionalResolution(), null);

                            acceptedContextualType = true;
                        }
                    }

                    // if operand 2 is a getter or a setter, we need to resolve it properly
                    if (binex.operand2.nodeType === NodeType.FunctionDeclaration) {
                        var funcDeclAST = <FunctionDeclaration>binex.operand2;

                        if (funcDeclAST.isAccessor()) {
                            var semanticInfo = this.semanticInfoChain.getUnit(this.unitPath);
                            var declCollectionContext = new DeclCollectionContext(semanticInfo);

                            declCollectionContext.scriptName = this.unitPath;

                            declCollectionContext.pushParent(objectLitDecl);

                            getAstWalkerFactory().walk(funcDeclAST, preCollectDecls, postCollectDecls, null, declCollectionContext);

                            var functionDecl = this.getDeclForAST(funcDeclAST);

                            var binder = new PullSymbolBinder(this.compilationSettings, this.semanticInfoChain);
                            binder.setUnit(this.unitPath);
                            binder.pushParent(typeSymbol, objectLitDecl);

                            if (funcDeclAST.isGetAccessor()) {
                                binder.bindGetAccessorDeclarationToPullSymbol(functionDecl);
                            }
                            else {
                                binder.bindSetAccessorDeclarationToPullSymbol(functionDecl);
                            }
                        }
                    }

                    memberExprType = this.resolveStatementOrExpression(binex.operand2, assigningSymbol != null, enclosingDecl, context);

                    if (acceptedContextualType) {
                        context.popContextualType();
                        acceptedContextualType = false;
                    }

                    context.setTypeInContext(memberSymbol, memberExprType.getType());

                    memberSymbol.setResolved();

                    this.setSymbolForAST(binex.operand1, memberSymbol, context);

                    typeSymbol.addMember(memberSymbol, SymbolLinkKind.PublicMember);
                }
            }

            typeSymbol.setResolved();

            this.setSymbolForAST(expressionAST, typeSymbol, context);

            return typeSymbol;
        }

        public resolveArrayLiteralExpression(expressionAST: AST, inContextuallyTypedAssignment, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var previousResolutionSymbol = this.getSymbolForAST(expressionAST, context);

            if (previousResolutionSymbol) {
                return <PullTypeSymbol>previousResolutionSymbol;
            }

            var arrayLit = <UnaryExpression>expressionAST;

            var elements = <ASTList>arrayLit.operand;
            var elementType = this.semanticInfoChain.anyTypeSymbol;
            var elementTypes: PullTypeSymbol[] = [];
            var comparisonInfo = new TypeComparisonInfo();
            var contextualType: PullTypeSymbol = null;
            comparisonInfo.onlyCaptureFirstError = true;

            // if the target type is an array type, extract the element type
            if (inContextuallyTypedAssignment) {
                contextualType = context.getContextualType();

                this.resolveDeclaredSymbol(contextualType, enclosingDecl, context);

                if (contextualType.isArray()) {
                    contextualType = contextualType.getElementType();
                }

                context.pushContextualType(contextualType, context.inProvisionalResolution(), null);
            }

            if (elements) {

                for (var i = 0; i < elements.members.length; i++) {
                    elementTypes[elementTypes.length] = this.resolveStatementOrExpression(elements.members[i], inContextuallyTypedAssignment, enclosingDecl, context).getType();
                }

                if (inContextuallyTypedAssignment) {
                    context.popContextualType();
                }

                if (elementTypes.length) {
                    elementType = elementTypes[0];
                }

                var collection: IPullTypeCollection = {
                    getLength: () => { return elements.members.length; } ,
                    setTypeAtIndex: (index: number, type: PullTypeSymbol) => { elementTypes[index] = type; } ,
                    getTypeAtIndex: (index: number) => { return elementTypes[index]; }
                }

                elementType = this.findBestCommonType(elementType, contextualType, collection, false, context, comparisonInfo);

                // if the array type is the undefined type, we should widen it to any
                // if it's of the null type, only widen it if it's not in a nested array element, so as not to 
                // short-circuit any checks for the best common type
                if (elementType === this.semanticInfoChain.undefinedTypeSymbol || elementType === this.semanticInfoChain.nullTypeSymbol) {
                    elementType = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            if (!elementType) {
                elementType = this.semanticInfoChain.anyTypeSymbol;
            }
            else if (contextualType) {
                // for the case of zero-length 'any' arrays, we still want to set the contextual type, if
                // need be
                if (this.sourceIsAssignableToTarget(elementType, contextualType, context)) {
                    elementType = contextualType;
                }
            }

            var arraySymbol = elementType.getArrayType();

            // ...But in case we haven't...
            if (!arraySymbol) {

                if (!this.cachedArrayInterfaceType) {
                    this.cachedArrayInterfaceType = <PullTypeSymbol>this.getSymbolFromDeclPath("Array", this.getPathToDecl(enclosingDecl), PullElementKind.Interface);
                }

                if (this.cachedArrayInterfaceType && !this.cachedArrayInterfaceType.isResolved()) {
                    this.resolveDeclaredSymbol(this.cachedArrayInterfaceType, enclosingDecl, context);
                }

                arraySymbol = specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, elementType, this, context);

                if (!arraySymbol) {
                    arraySymbol = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            this.setSymbolForAST(expressionAST, arraySymbol, context);

            return arraySymbol;
        }

        public resolveIndexExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var callEx: BinaryExpression = <BinaryExpression>expressionAST;

            var previousResolutionSymbol = this.getSymbolForAST(callEx, context);

            if (previousResolutionSymbol) {
                //CompilerDiagnostics.Alert("Call get hit");
                return previousResolutionSymbol;
            }

            var diagnostic: Diagnostic;
            var returnType: PullTypeSymbol = null;

            // resolve the target
            var targetSymbol = this.resolveStatementOrExpression(callEx.operand1, inContextuallyTypedAssignment, enclosingDecl, context);

            var targetTypeSymbol = targetSymbol.getType();

            if (this.isAnyOrEquivalent(targetTypeSymbol)) {
                this.setSymbolForAST(callEx, this.semanticInfoChain.anyTypeSymbol, context);
                return targetTypeSymbol;
            }

            var elementType = targetTypeSymbol.getElementType();

            var indexType = this.resolveStatementOrExpression(callEx.operand2, inContextuallyTypedAssignment, enclosingDecl, context).getType();

            var isNumberIndex = indexType === this.semanticInfoChain.numberTypeSymbol ||
                                indexType.getKind() === PullElementKind.Enum;

            if (elementType && isNumberIndex) {
                this.setSymbolForAST(callEx, elementType, context);
                return elementType;
            }
            
            // if the index expression is a string literal or a numberic literal and the object expression has
            // a property with that name,  the property access is the type of that property
            if (callEx.operand2.nodeType === NodeType.StringLiteral || callEx.operand2.nodeType === NodeType.NumericLiteral) {

                var memberName = callEx.operand2.nodeType === NodeType.StringLiteral ? (<StringLiteral>callEx.operand2).actualText :
                    quoteStr((<NumberLiteral>callEx.operand2).value.toString());

                var member = targetTypeSymbol.findMember(memberName);

                if (member) {
                    this.setSymbolForAST(callEx, member.getType(), context);
                    return member.getType();
                }
            }            

            var signatures = targetTypeSymbol.getIndexSignatures();

            var stringSignature: PullSignatureSymbol = null;
            var numberSignature: PullSignatureSymbol = null;
            var signature: PullSignatureSymbol = null;
            var paramSymbols: PullSymbol[];
            var paramType: PullTypeSymbol;

            for (var i = 0; i < signatures.length; i++) {
                
                if (stringSignature && numberSignature) {
                    break;
                }
                
                signature = signatures[i];

                paramSymbols = signature.getParameters();

                if (paramSymbols.length) {
                    paramType = paramSymbols[0].getType();

                    if (paramType === this.semanticInfoChain.stringTypeSymbol) {
                        stringSignature = signatures[i];
                        continue;
                    }
                    else if (paramType === this.semanticInfoChain.numberTypeSymbol || paramType.getKind() === PullElementKind.Enum) {
                        numberSignature = signatures[i];
                        continue;
                    }
                }
            }

            // otherwise, if the object expression has a numeric index signature and the index expression is
            // of type Any, the Number primitive type or an enum type, the property access is of the type of that index
            // signature
            if (numberSignature && (isNumberIndex || indexType === this.semanticInfoChain.anyTypeSymbol)) {
                returnType = numberSignature.getReturnType();

                if (!returnType) {
                    returnType = this.semanticInfoChain.anyTypeSymbol;
                }

                this.setSymbolForAST(callEx, returnType, context);
            }

            // otherwise, if the object expression has a string index signature and the index expression is
            // of type Any, the String or Number primitive type or an enum type, the property access of the type of
            // that index signature

            else if (stringSignature && (isNumberIndex || indexType === this.semanticInfoChain.anyTypeSymbol || indexType === this.semanticInfoChain.stringTypeSymbol)) {
                returnType = stringSignature.getReturnType();

                if (!returnType) {
                    returnType = this.semanticInfoChain.anyTypeSymbol;
                }

                this.setSymbolForAST(callEx, returnType, context);
            }

            // otherwise, if indexExpr is of type Any, the String or Number primitive type or an enum type,
            // the property access is of type Any
            else if (isNumberIndex || indexType === this.semanticInfoChain.anyTypeSymbol || indexType === this.semanticInfoChain.stringTypeSymbol) {
                returnType = this.semanticInfoChain.anyTypeSymbol;

                this.setSymbolForAST(callEx, returnType, context);
            }

            // otherwise, the property acess is invalid and a compile-time error occurs
            else {
                diagnostic = context.postError(this.getUnitPath(), callEx.minChar, callEx.getLength(), "Value of type '{0}' is not indexable by type '{1}'.", [targetTypeSymbol.toString(false), indexType.toString(false)], enclosingDecl);

                returnType = this.getNewErrorTypeSymbol(diagnostic);
            }
            
            return returnType;
        }

        public resolveBitwiseOperator(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {

            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).getType();
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).getType();

            if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol, context) &&
                this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol, context)) {

                return this.semanticInfoChain.numberTypeSymbol;
            }
            else if ((leftType === this.semanticInfoChain.booleanTypeSymbol) &&
                (rightType === this.semanticInfoChain.booleanTypeSymbol)) {

                return this.semanticInfoChain.booleanTypeSymbol;
            }
            else if (this.isAnyOrEquivalent(leftType)) {
                if ((this.isAnyOrEquivalent(rightType) ||
                    (rightType === this.semanticInfoChain.numberTypeSymbol) ||
                    (rightType === this.semanticInfoChain.booleanTypeSymbol))) {

                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else if (this.isAnyOrEquivalent(rightType)) {
                if ((leftType === this.semanticInfoChain.numberTypeSymbol) ||
                    (leftType === this.semanticInfoChain.booleanTypeSymbol)) {

                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveArithmeticExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).getType();
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).getType();

            // PULLREVIEW: Eh?  I've preserved the logic from the current implementation, but it could use cleaning up
            if (this.isNullOrUndefinedType(leftType)) {
                leftType = rightType;
            }
            if (this.isNullOrUndefinedType(rightType)) {
                rightType = leftType;
            }

            leftType = this.widenType(leftType);
            rightType = this.widenType(rightType);

            if (expressionAST.nodeType === NodeType.AddExpression || expressionAST.nodeType === NodeType.AddAssignmentExpression) {
                if (leftType === this.semanticInfoChain.stringTypeSymbol || rightType === this.semanticInfoChain.stringTypeSymbol) {
                    return this.semanticInfoChain.stringTypeSymbol;
                }
                else if (leftType === this.semanticInfoChain.numberTypeSymbol && rightType === this.semanticInfoChain.numberTypeSymbol) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol, context) && this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol, context)) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else {
                    // could be an error
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else {
                if (leftType === this.semanticInfoChain.numberTypeSymbol && rightType === this.semanticInfoChain.numberTypeSymbol) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else if (this.sourceIsSubtypeOfTarget(leftType, this.semanticInfoChain.numberTypeSymbol, context) && this.sourceIsSubtypeOfTarget(rightType, this.semanticInfoChain.numberTypeSymbol, context)) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else if (this.isAnyOrEquivalent(leftType) || this.isAnyOrEquivalent(rightType)) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else {
                    // error
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
        }

        public resolveLogicalOrExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).getType();
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).getType();

            if (this.isAnyOrEquivalent(leftType) || this.isAnyOrEquivalent(rightType)) {
                return this.semanticInfoChain.anyTypeSymbol;
            }
            else if (leftType === this.semanticInfoChain.booleanTypeSymbol) {
                if (rightType === this.semanticInfoChain.booleanTypeSymbol) {
                    return this.semanticInfoChain.booleanTypeSymbol;
                }
                else {
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else if (leftType === this.semanticInfoChain.numberTypeSymbol) {
                if (rightType === this.semanticInfoChain.numberTypeSymbol) {
                    return this.semanticInfoChain.numberTypeSymbol;
                }
                else {
                    return this.semanticInfoChain.anyTypeSymbol
                }
            }
            else if (leftType === this.semanticInfoChain.stringTypeSymbol) {
                if (rightType === this.semanticInfoChain.stringTypeSymbol) {
                    return this.semanticInfoChain.stringTypeSymbol;
                }
                else {
                    return this.semanticInfoChain.anyTypeSymbol;
                }
            }
            else if (this.sourceIsSubtypeOfTarget(leftType, rightType, context)) {
                return rightType;
            }
            else if (this.sourceIsSubtypeOfTarget(rightType, leftType, context)) {
                return leftType;
            }

            return this.semanticInfoChain.anyTypeSymbol;
        }

        public resolveLogicalAndExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var binex = <BinaryExpression>expressionAST;

            var leftType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).getType();
            var rightType = <PullTypeSymbol>this.resolveStatementOrExpression(binex.operand2, inContextuallyTypedAssignment, enclosingDecl, context).getType();

            return rightType;
        }

        public resolveConditionalExpression(trinex: ConditionalExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            var previousResolutionSymbol = this.getSymbolForAST(trinex, context);

            if (previousResolutionSymbol) {
                return <PullTypeSymbol>previousResolutionSymbol;
            }

            var condType = this.resolveAST(trinex.operand1, false, enclosingDecl, context).getType();
            var leftType = this.resolveAST(trinex.operand2, false, enclosingDecl, context).getType();
            var rightType = this.resolveAST(trinex.operand3, false, enclosingDecl, context).getType();

            if (this.typesAreIdentical(leftType, rightType)) {
                return leftType;
            }
            else if (this.sourceIsSubtypeOfTarget(leftType, rightType, context) || this.sourceIsSubtypeOfTarget(rightType, leftType, context)) {
                var collection: IPullTypeCollection = {
                    getLength: () => { return 2; } ,
                    setTypeAtIndex: (index: number, type: PullTypeSymbol) => { } , // no contextual typing here, so no need to do anything
                    getTypeAtIndex: (index: number) => { return rightType; } // we only want the "second" type - the "first" is skipped
                }

                var bct = this.findBestCommonType(leftType, null, collection, false, context);

                if (bct) {
                    this.setSymbolForAST(trinex, bct, context);
                    return bct;
                }
            }

            var diagnostic = context.postError(this.getUnitPath(), trinex.minChar, trinex.getLength(), "Type of conditional expression cannot be determined. Best common type could not be found between '{0}' and '{1}'.", [leftType.toString(false), rightType.toString(false)], enclosingDecl);

            return this.getNewErrorTypeSymbol(diagnostic);
        }

        public resolveParenthesizedExpression(ast: ParenthesizedExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            return this.resolveAST(ast.expression, false, enclosingDecl, context);
        }

        public resolveExpressionStatement(ast: ExpressionStatement, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext) {
            return this.resolveAST(ast.expression, inContextuallyTypedAssignment, enclosingDecl, context);
        }

        public resolveCallExpression(callEx: CallExpression, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext, additionalResults?: PullAdditionalCallResolutionData): PullSymbol {

            if (!additionalResults) {
                var previousResolutionSymbol = this.getSymbolForAST(callEx, context);

                if (previousResolutionSymbol) {
                    //CompilerDiagnostics.Alert("Call get hit");
                    return previousResolutionSymbol;
                }
            }

            var diagnostic: Diagnostic;

            // resolve the target
            var targetSymbol = this.resolveStatementOrExpression(callEx.target, inContextuallyTypedAssignment, enclosingDecl, context);
            var targetAST = this.getLastIdentifierInTarget(callEx);

            // don't be fooled
            //if (target === this.semanticInfoChain.anyTypeSymbol) {
            //    diagnostic = context.postError(callEx.minChar, callEx.getLength(), this.unitPath, "Invalid call expression", enclosingDecl);
            //    return this.getNewErrorTypeSymbol(diagnostic); 
            //}

            var targetTypeSymbol = targetSymbol.getType();

            if (this.isAnyOrEquivalent(targetTypeSymbol)) {

                if (callEx.typeArguments) {
                    diagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Untyped function calls may not accept type arguments.", null, enclosingDecl);
                    return this.getNewErrorTypeSymbol(diagnostic);
                }

                this.setSymbolForAST(callEx, this.semanticInfoChain.anyTypeSymbol, context);
                return targetTypeSymbol;
            }

            var isSuperCall = false;

            if (callEx.target.nodeType === NodeType.SuperExpression) {
                isSuperCall = true;

                if (targetTypeSymbol.isClass()) {
                    targetSymbol = (<PullClassTypeSymbol>targetTypeSymbol).getConstructorMethod();
                    targetTypeSymbol = targetSymbol.getType();
                }
                else {
                    diagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Calls to 'super' are only valid inside a class.", null, enclosingDecl);
                    return this.getNewErrorTypeSymbol(diagnostic);
                }
            }

            var signatures = isSuperCall ? (<PullFunctionTypeSymbol>targetTypeSymbol).getConstructSignatures() : (<PullFunctionTypeSymbol>targetTypeSymbol).getCallSignatures();

            if (!signatures.length && (targetTypeSymbol.getKind() == PullElementKind.ConstructorType)) {
                context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Value of type '{0}' is not callable. Did you mean to include 'new'?", [targetTypeSymbol.toString()], enclosingDecl, true);
            }

            var typeArgs: PullTypeSymbol[] = null;
            var typeReplacementMap: any = null;
            var couldNotFindGenericOverload = false;
            var lastConstraintFailureDiagnostic: Diagnostic = null;
            var couldNotAssignToConstraint: boolean;

            // resolve the type arguments, specializing if necessary
            if (callEx.typeArguments) {
                // specialize the type arguments
                typeArgs = [];

                var typeArg: PullTypeSymbol = null;

                if (callEx.typeArguments && callEx.typeArguments.members.length) {
                    for (var i = 0; i < callEx.typeArguments.members.length; i++) {
                        typeArg = this.resolveTypeReference(<TypeReference>callEx.typeArguments.members[i], enclosingDecl, context);

                        if (typeArg.isError()) {
                            return typeArg;
                        }
                        typeArgs[i] = context.findSpecializationForType(typeArg);
                    }
                }
            }

            // next, walk the available signatures
            // if any are generic, and we don't have type arguments, try to infer
            // otherwise, try to specialize to the type arguments above
            if (targetTypeSymbol.isGeneric()) {

                var resolvedSignatures: PullSignatureSymbol[] = [];
                var inferredTypeArgs: PullTypeSymbol[];
                var specializedSignature: PullSignatureSymbol;
                var typeParameters: PullTypeParameterSymbol[];
                var typeConstraint: PullTypeSymbol = null;
                var prevSpecializingToAny = context.specializingToAny;
                var beforeResolutionSignatures = signatures;
                for (var i = 0; i < signatures.length; i++) {
                    typeParameters = signatures[i].getTypeParameters();
                    couldNotAssignToConstraint = false;

                    if (signatures[i].isGeneric() && typeParameters.length) {
                        if (typeArgs) {
                            inferredTypeArgs = typeArgs;
                        }
                        else if (callEx.arguments) {
                            inferredTypeArgs = this.inferArgumentTypesForSignature(signatures[i], callEx.arguments, new TypeComparisonInfo(), enclosingDecl, context);
                        }

                        // if we could infer Args, or we have type arguments, then attempt to specialize the signature
                        if (inferredTypeArgs) {

                            typeReplacementMap = {};

                            if (inferredTypeArgs.length) {

                                if (inferredTypeArgs.length < typeParameters.length) {
                                    continue;
                                }

                                for (var j = 0; j < typeParameters.length; j++) {
                                    typeReplacementMap[typeParameters[j].getSymbolID().toString()] = inferredTypeArgs[j];
                                }
                                for (var j = 0; j < typeParameters.length; j++) {
                                    typeConstraint = typeParameters[j].getConstraint();

                                    // test specialization type for assignment compatibility with the constraint
                                    if (typeConstraint) {
                                        if (typeConstraint.isTypeParameter()) {
                                            context.pushTypeSpecializationCache(typeReplacementMap);
                                            typeConstraint = specializeType(typeConstraint, null, this, enclosingDecl, context);  //<PullTypeSymbol>this.resolveDeclaredSymbol(typeConstraint, enclosingDecl, context);
                                            context.popTypeSpecializationCache();
                                        }
                                        if (!this.sourceIsAssignableToTarget(inferredTypeArgs[j], typeConstraint, context)) {
                                            lastConstraintFailureDiagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Type '{0}' does not satisfy the constraint '{1}' for type parameter '{2}'.", [inferredTypeArgs[j].toString(true), typeConstraint.toString(true), typeParameters[j].toString(true)], enclosingDecl);
                                            couldNotAssignToConstraint = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            else {
                                context.specializingToAny = true;
                            }

                            if (couldNotAssignToConstraint) {
                                continue;
                            }

                            specializedSignature = specializeSignature(signatures[i], false, typeReplacementMap, inferredTypeArgs, this, enclosingDecl, context);

                            context.specializingToAny = prevSpecializingToAny;

                            if (specializedSignature) {
                                resolvedSignatures[resolvedSignatures.length] = specializedSignature;
                            }
                        }
                    }
                    else {
                        resolvedSignatures[resolvedSignatures.length] = signatures[i];
                    }
                }
                // PULLTODO: Try to avoid copying here...

                if (signatures.length && !resolvedSignatures.length) {
                    couldNotFindGenericOverload = true;
                }

                signatures = resolvedSignatures;
            }

            // the target should be a function
            //if (!targetTypeSymbol.isType()) {
            //    this.log("Attempting to call a non-function symbol");
            //    return this.semanticInfoChain.anyTypeSymbol;
            //}

            if (!signatures.length && !couldNotFindGenericOverload) {

                // if there are no call signatures, but the target is a subtype of 'Function', return 'any'
                if (this.cachedFunctionInterfaceType && this.sourceIsSubtypeOfTarget(targetTypeSymbol, this.cachedFunctionInterfaceType, context)) {
                    return this.semanticInfoChain.anyTypeSymbol;
                }

                diagnostic = lastConstraintFailureDiagnostic ? lastConstraintFailureDiagnostic : context.postError(this.unitPath, callEx.minChar, callEx.getLength(), "Unable to invoke type with no call signatures.", null, enclosingDecl);
                return this.getNewErrorTypeSymbol(diagnostic);
            }
            else if (!signatures.length) {
                diagnostic = lastConstraintFailureDiagnostic ? lastConstraintFailureDiagnostic : context.postError(this.unitPath, callEx.minChar, callEx.getLength(), "Unable to invoke type with no call signatures.", null, enclosingDecl);
                return this.getNewErrorTypeSymbol(diagnostic);
            }

            var signature = this.resolveOverloads(callEx, signatures, enclosingDecl, callEx.typeArguments != null, context);
            var useBeforeResolutionSignatures = signature == null;
            var errorCondition: PullSymbol = null;
            if (!signature) {
                diagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Could not select overload for 'call' expression.", null, enclosingDecl);

                // Remember the error state
                errorCondition = this.getNewErrorTypeSymbol(diagnostic);

                if (!signatures.length) {
                    return errorCondition;
                }

                // Attempt to recover from the error condition
                // First, pick the first signature as the candidate signature
                signature = signatures[0];

                // Second, clear any state left from overload resolution in preparation of contextual typing
                if (callEx.arguments) {
                    for (var k = 0, n = callEx.arguments.members.length; k < n; k++) {
                        var arg = callEx.arguments.members[k];
                        var argSymbol = this.getSymbolForAST(arg, context);

                        if (argSymbol) {
                            var argType = argSymbol.getType();
                            if (arg.nodeType === NodeType.FunctionDeclaration) {
                                if (!this.canApplyContextualTypeToFunction(argType, <FunctionDeclaration>arg, true)) {
                                    continue;
                                }
                            }

                            argSymbol.invalidate();
                        }
                    }
                }
            }

            if (!signature.isGeneric() && callEx.typeArguments) {
                context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Non-generic functions may not accept type arguments.", null, enclosingDecl);
            }

            var returnType = signature.getReturnType();

            // contextually type arguments
            var actualParametersContextTypeSymbols: PullTypeSymbol[] = [];
            if (callEx.arguments) {
                var len = callEx.arguments.members.length;
                var params = signature.getParameters();
                var contextualType: PullTypeSymbol = null;
                var signatureDecl = signature.getDeclarations()[0];

                for (var i = 0; i < len; i++) {
                    // account for varargs
                    if (params.length && i < signature.getNonOptionalParameterCount()) {
                        if (typeReplacementMap) {
                            context.pushTypeSpecializationCache(typeReplacementMap);
                        }
                        this.resolveDeclaredSymbol(params[i], signatureDecl, context);
                        if (typeReplacementMap) {
                            context.popTypeSpecializationCache();
                        }
                        contextualType = params[i].getType();
                    }
                    else if (params.length) {
                        contextualType = params[params.length - 1].getType();
                        if (contextualType.isArray()) {
                            contextualType = contextualType.getElementType();
                        }
                    }

                    if (contextualType) {
                        context.pushContextualType(contextualType, context.inProvisionalResolution(), null);
                        actualParametersContextTypeSymbols[i] = contextualType;
                    }

                    this.resolveStatementOrExpression(callEx.arguments.members[i], contextualType != null, enclosingDecl, context);

                    if (contextualType) {
                        context.popContextualType();
                        contextualType = null;
                    }
                }
            }

            // Store any additional resolution results if needed before we return
            if (additionalResults) {
                additionalResults.targetSymbol = targetSymbol;
                additionalResults.targetTypeSymbol = targetTypeSymbol;
                if (useBeforeResolutionSignatures && beforeResolutionSignatures) {
                    additionalResults.resolvedSignatures = beforeResolutionSignatures;
                    additionalResults.candidateSignature = beforeResolutionSignatures[0];

                } else {
                    additionalResults.resolvedSignatures = signatures;
                    additionalResults.candidateSignature = signature;
                }
                additionalResults.actualParametersContextTypeSymbols = actualParametersContextTypeSymbols;
            }

            if (errorCondition) {
                return errorCondition;
            }

            if (!returnType) {
                returnType = this.semanticInfoChain.anyTypeSymbol;
            }

            this.setSymbolForAST(callEx, returnType, context);

            return returnType;
        }

        public resolveNewExpression(callEx: CallExpression, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext, additionalResults?: PullAdditionalCallResolutionData): PullSymbol {

            if (!additionalResults) {
                var previousResolutionSymbol = this.getSymbolForAST(callEx, context);

                if (previousResolutionSymbol) {
                    //CompilerDiagnostics.Alert("New get hit");
                    return previousResolutionSymbol;
                }
            }

            var returnType: PullTypeSymbol = null;

            // resolve the target
            var targetSymbol = this.resolveStatementOrExpression(callEx.target, inContextuallyTypedAssignment, enclosingDecl, context);

            var diagnostic: Diagnostic;

            var targetTypeSymbol = targetSymbol.isType() ? <PullTypeSymbol>targetSymbol : targetSymbol.getType();

            var targetAST = this.getLastIdentifierInTarget(callEx);

            // PULLREVIEW: In the case of a generic instantiation of a class type,
            // we'll have gotten a 'GenericType' node, which will be resolved as the class type and not
            // the constructor type.  In this case, set the targetTypeSymbol to the constructor type
            if (targetTypeSymbol.isClass()) {
                targetTypeSymbol = (<PullClassTypeSymbol>targetTypeSymbol).getConstructorMethod().getType();
            }

            var constructSignatures = targetTypeSymbol.getConstructSignatures();

            var typeArgs: PullTypeSymbol[] = null;
            var typeReplacementMap: any = null;
            var usedCallSignaturesInstead = false;
            var lastConstraintFailureDiagnostic: Diagnostic = null;
            var couldNotAssignToConstraint: boolean;

            if (this.isAnyOrEquivalent(targetTypeSymbol)) {
                this.setSymbolForAST(callEx, targetTypeSymbol, context);
                return targetTypeSymbol;
            }

            if (!constructSignatures.length) {
                constructSignatures = targetTypeSymbol.getCallSignatures();
                usedCallSignaturesInstead = true;
            }

            if (constructSignatures.length) {

                // resolve the type arguments, specializing if necessary
                if (callEx.typeArguments) {
                    // specialize the type arguments
                    typeArgs = [];

                    var typeArg: PullTypeSymbol = null;

                    if (callEx.typeArguments && callEx.typeArguments.members.length) {
                        for (var i = 0; i < callEx.typeArguments.members.length; i++) {
                            typeArg = this.resolveTypeReference(<TypeReference>callEx.typeArguments.members[i], enclosingDecl, context);

                            if (typeArg.isError()) {
                                return typeArg;
                            }

                            typeArgs[i] = context.findSpecializationForType(typeArg);
                        }
                    }
                }

                // next, walk the available signatures
                // if any are generic, and we don't have type arguments, try to infer
                // otherwise, try to specialize to the type arguments above
                if (targetTypeSymbol.isGeneric()) {

                    var resolvedSignatures: PullSignatureSymbol[] = [];
                    var inferredTypeArgs: PullTypeSymbol[];
                    var specializedSignature: PullSignatureSymbol;
                    var typeParameters: PullTypeParameterSymbol[];
                    var typeConstraint: PullTypeSymbol = null;
                    var prevSpecializingToAny = context.specializingToAny;

                    for (var i = 0; i < constructSignatures.length; i++) {
                        couldNotAssignToConstraint = false;

                        if (constructSignatures[i].isGeneric()) {
                            if (typeArgs) {
                                inferredTypeArgs = typeArgs;
                            }
                            else if (callEx.arguments) {
                                inferredTypeArgs = this.inferArgumentTypesForSignature(constructSignatures[i], callEx.arguments, new TypeComparisonInfo(), enclosingDecl, context);
                            }

                            // if we could infer Args, or we have type arguments, then attempt to specialize the signature
                            if (inferredTypeArgs) {
                                typeParameters = constructSignatures[i].getTypeParameters();

                                typeReplacementMap = {};

                                if (inferredTypeArgs.length) {

                                    if (inferredTypeArgs.length < typeParameters.length) {
                                        continue;
                                    }

                                    for (var j = 0; j < typeParameters.length; j++) {
                                        typeReplacementMap[typeParameters[j].getSymbolID().toString()] = inferredTypeArgs[j];
                                    }
                                    for (var j = 0; j < typeParameters.length; j++) {
                                        typeConstraint = typeParameters[j].getConstraint();

                                        // test specialization type for assignment compatibility with the constraint
                                        if (typeConstraint) {

                                            if (typeConstraint.isTypeParameter()) {
                                                context.pushTypeSpecializationCache(typeReplacementMap);
                                                typeConstraint = specializeType(typeConstraint, null, this, enclosingDecl, context);
                                                context.popTypeSpecializationCache();
                                            }

                                            if (!this.sourceIsAssignableToTarget(inferredTypeArgs[j], typeConstraint, context)) {
                                                lastConstraintFailureDiagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Type '{0}' does not satisfy the constraint '{1}' for type parameter '{2}'.", [inferredTypeArgs[j].toString(true), typeConstraint.toString(true), typeParameters[j].toString(true)], enclosingDecl, true);
                                                couldNotAssignToConstraint = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                else {
                                    context.specializingToAny = true;
                                }

                                if (couldNotAssignToConstraint) {
                                    continue;
                                }

                                specializedSignature = specializeSignature(constructSignatures[i], false, typeReplacementMap, inferredTypeArgs, this, enclosingDecl, context);

                                context.specializingToAny = prevSpecializingToAny;

                                if (specializedSignature) {
                                    resolvedSignatures[resolvedSignatures.length] = specializedSignature;
                                }
                            }
                        }
                        else {
                            resolvedSignatures[resolvedSignatures.length] = constructSignatures[i];
                        }
                    }

                    // PULLTODO: Try to avoid copying here...
                    constructSignatures = resolvedSignatures;
                }

                // the target should be a function
                //if (!targetSymbol.isType()) {
                //    this.log("Attempting to call a non-function symbol");
                //    return this.semanticInfoChain.anyTypeSymbol;
                //}

                var signature = this.resolveOverloads(callEx, constructSignatures, enclosingDecl, callEx.typeArguments != null, context);

                // Store any additional resolution results if needed before we return
                if (additionalResults) {
                    additionalResults.targetSymbol = targetSymbol;
                    additionalResults.targetTypeSymbol = targetTypeSymbol;
                    additionalResults.resolvedSignatures = constructSignatures;
                    additionalResults.candidateSignature = signature;
                    additionalResults.actualParametersContextTypeSymbols = [];
                }

                if (!constructSignatures.length && lastConstraintFailureDiagnostic) {
                    return this.getNewErrorTypeSymbol(lastConstraintFailureDiagnostic);
                }

                var errorCondition: PullSymbol = null;

                // if we haven't been able to choose an overload, default to the first one
                if (!signature) {
                    diagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Could not select overload for 'new' expression.", null, enclosingDecl);

                    // Remember the error
                    errorCondition = this.getNewErrorTypeSymbol(diagnostic);

                    if (!constructSignatures.length) {
                        return errorCondition;
                    }

                    // First, pick the first signature as the candidate signature
                    signature = constructSignatures[0];

                    // Second, clear any state left from overload resolution in preparation of contextual typing
                    if (callEx.arguments) {
                        for (var k = 0, n = callEx.arguments.members.length; k < n; k++) {
                            var arg = callEx.arguments.members[k];
                            var argSymbol = this.getSymbolForAST(arg, context);

                            if (argSymbol) {
                                var argType = argSymbol.getType();
                                if (arg.nodeType === NodeType.FunctionDeclaration) {
                                    if (!this.canApplyContextualTypeToFunction(argType, <FunctionDeclaration>arg, true)) {
                                        continue;
                                    }
                                }

                                argSymbol.invalidate();
                            }
                        }
                    }
                }

                returnType = signature.getReturnType();

                // if it's a default constructor, and we have a type argument, we need to specialize
                if (returnType && !signature.isGeneric() && returnType.isGeneric() && !returnType.getIsSpecialized()) {
                    if (typeArgs && typeArgs.length) {
                        returnType = specializeType(returnType, typeArgs, this, enclosingDecl, context, callEx);
                    }
                    else {
                        returnType = this.specializeTypeToAny(returnType, enclosingDecl, context);
                    }
                }

                if (usedCallSignaturesInstead) {
                    if (returnType != this.semanticInfoChain.voidTypeSymbol) {
                        diagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Call sigantures used in a 'new' expression must have a 'void' return type.", null, enclosingDecl);
                        return this.getNewErrorTypeSymbol(diagnostic);
                    }
                    else {
                        returnType = this.semanticInfoChain.anyTypeSymbol;
                    }
                }

                if (!returnType) {
                    returnType = signature.getReturnType();

                    if (!returnType) {
                        returnType = targetTypeSymbol;
                    }
                }

                // contextually type arguments
                var actualParametersContextTypeSymbols: PullTypeSymbol[] = [];
                if (callEx.arguments) {
                    var len = callEx.arguments.members.length;
                    var params = signature.getParameters();
                    var contextualType: PullTypeSymbol = null;
                    var signatureDecl = signature.getDeclarations()[0];

                    for (var i = 0; i < len; i++) {

                        if (params.length && i < params.length) {
                            if (typeReplacementMap) {
                                context.pushTypeSpecializationCache(typeReplacementMap);
                            }
                            this.resolveDeclaredSymbol(params[i], signatureDecl, context);
                            if (typeReplacementMap) {
                                context.popTypeSpecializationCache();
                            }
                            contextualType = params[i].getType();
                        }
                        else if (params.length) {
                            contextualType = params[params.length - 1].getType();
                            if (contextualType.isArray()) {
                                contextualType = contextualType.getElementType();
                            }
                        }

                        if (contextualType) {
                            context.pushContextualType(contextualType, context.inProvisionalResolution(), null);
                            actualParametersContextTypeSymbols[i] = contextualType;
                        }

                        this.resolveStatementOrExpression(callEx.arguments.members[i], contextualType != null, enclosingDecl, context);

                        if (contextualType) {
                            context.popContextualType();
                            contextualType = null;
                        }
                    }
                }

                // Store any additional resolution results if needed before we return
                if (additionalResults) {
                    additionalResults.targetSymbol = targetSymbol;
                    additionalResults.targetTypeSymbol = targetTypeSymbol;
                    additionalResults.resolvedSignatures = constructSignatures;
                    additionalResults.candidateSignature = signature;
                    additionalResults.actualParametersContextTypeSymbols = actualParametersContextTypeSymbols;
                }

                if (errorCondition) {
                    return errorCondition;
                }

                if (!returnType) {
                    returnType = this.semanticInfoChain.anyTypeSymbol;
                }

                this.setSymbolForAST(callEx, returnType, context);

                return returnType;
            }
            else if (targetTypeSymbol.isClass()) {

                this.setSymbolForAST(callEx, returnType, context);

                // implicit constructor
                return returnType;
            }

            diagnostic = context.postError(this.unitPath, targetAST.minChar, targetAST.getLength(), "Invalid 'new' expression.", null, enclosingDecl);

            return this.getNewErrorTypeSymbol(diagnostic);

        }

        public resolveTypeAssertionExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol {

            var assertionExpression = <UnaryExpression>expressionAST;
            var typeReference = this.resolveTypeReference(<TypeReference>assertionExpression.castTerm, enclosingDecl, context);

            // PULLTODO: We don't technically need to resolve the operand, since the type of the
            // expression is the type of the cast term.  Still, it makes life a bit easier for the LS
            if (context.resolveAggressively && assertionExpression.operand.nodeType !== NodeType.ParenthesizedExpression) {
                context.pushContextualType(typeReference, context.inProvisionalResolution(), null);
                this.resolveStatementOrExpression(assertionExpression.operand, true, enclosingDecl, context);
                context.popContextualType();
            }

            return typeReference;
        }

        public resolveAssignmentStatement(statementAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol {
            var previousResolutionSymbol = this.getSymbolForAST(statementAST, context);

            if (previousResolutionSymbol) {
                return <PullTypeSymbol>previousResolutionSymbol;
            }

            var binex = <BinaryExpression>statementAST;

            var leftType = this.resolveStatementOrExpression(binex.operand1, inContextuallyTypedAssignment, enclosingDecl, context).getType();

            context.pushContextualType(leftType, context.inProvisionalResolution(), null);
            this.resolveStatementOrExpression(binex.operand2, true, enclosingDecl, context);
            context.popContextualType();

            this.setSymbolForAST(statementAST, leftType, context);

            return leftType;
        }

        public resolveBoundDecls(decl: PullDecl, context: PullTypeResolutionContext): void {

            if (!decl) {
                return;
            }

            switch (decl.getKind()) {
                case PullElementKind.Script:
                    var childDecls = decl.getChildDecls();
                    for (var i = 0; i < childDecls.length; i++) {
                        this.resolveBoundDecls(childDecls[i], context);
                    }
                    break;
                case PullElementKind.DynamicModule:
                case PullElementKind.Container:
                    var moduleDecl = <ModuleDeclaration>this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveModuleDeclaration(moduleDecl, context);
                    break;
                case PullElementKind.Interface:
                    // case PullElementKind.ObjectType:
                    var interfaceDecl = <TypeDeclaration>this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveInterfaceDeclaration(interfaceDecl, context);
                    break;
                case PullElementKind.Class:
                    var classDecl = <ClassDeclaration>this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveClassDeclaration(classDecl, context);
                    break;
                case PullElementKind.Method:
                case PullElementKind.Function:
                    var funcDecl = <FunctionDeclaration>this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveFunctionDeclaration(funcDecl, context);
                    break;
                case PullElementKind.GetAccessor:
                    funcDecl = <FunctionDeclaration>this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveGetAccessorDeclaration(funcDecl, context);
                    break;
                case PullElementKind.SetAccessor:
                    funcDecl = <FunctionDeclaration>this.semanticInfoChain.getASTForDecl(decl);
                    this.resolveSetAccessorDeclaration(funcDecl, context);
                    break;
                case PullElementKind.Property:
                case PullElementKind.Variable:
                case PullElementKind.Parameter:
                    var varDecl = <BoundDecl>this.semanticInfoChain.getASTForDecl(decl);

                    // varDecl may be null if we're dealing with an implicit variable created for a class,
                    // module or enum
                    if (varDecl) {
                        this.resolveVariableDeclaration(varDecl, context);
                    }
                    break;
            }
        }

        // type relationships

        public mergeOrdered(a: PullTypeSymbol, b: PullTypeSymbol, acceptVoid: boolean, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): PullTypeSymbol {
            if (this.isAnyOrEquivalent(a) || this.isAnyOrEquivalent(b)) {
                return this.semanticInfoChain.anyTypeSymbol;
            }
            else if (a === b) {
                return a;
            }
            else if ((b === this.semanticInfoChain.nullTypeSymbol) && a != this.semanticInfoChain.nullTypeSymbol) {
                return a;
            }
            else if ((a === this.semanticInfoChain.nullTypeSymbol) && (b != this.semanticInfoChain.nullTypeSymbol)) {
                return b;
            }
            else if (acceptVoid && (b === this.semanticInfoChain.voidTypeSymbol) && a != this.semanticInfoChain.voidTypeSymbol) {
                return a;
            }
            else if (acceptVoid && (a === this.semanticInfoChain.voidTypeSymbol) && (b != this.semanticInfoChain.voidTypeSymbol)) {
                return b;
            }
            else if ((b === this.semanticInfoChain.undefinedTypeSymbol) && a != this.semanticInfoChain.voidTypeSymbol) {
                return a;
            }
            else if ((a === this.semanticInfoChain.undefinedTypeSymbol) && (b != this.semanticInfoChain.undefinedTypeSymbol)) {
                return b;
            }
            else if (a.isTypeParameter() && !b.isTypeParameter()) {
                return b;
            }
            else if (!a.isTypeParameter() && b.isTypeParameter()) {
                return a;
            }
            else if (a.isArray() && b.isArray()) {
                if (a.getElementType() === b.getElementType()) {
                    return a;
                }
                else {
                    var mergedET = this.mergeOrdered(a.getElementType(), b.getElementType(), acceptVoid, context, comparisonInfo);
                    if (mergedET) {
                        var mergedArrayType = mergedET.getArrayType();

                        if (!mergedArrayType) {
                            mergedArrayType = specializeToArrayType(this.semanticInfoChain.elementTypeSymbol, mergedET, this, context);
                        }

                        return mergedArrayType;
                    }
                }
            }
            else if (this.sourceIsSubtypeOfTarget(a, b, context, comparisonInfo)) {
                return b;
            }
            else if (this.sourceIsSubtypeOfTarget(b, a, context, comparisonInfo)) {
                return a;
            }

            return null;
        }

        public widenType(type: PullTypeSymbol): PullTypeSymbol {
            if (type === this.semanticInfoChain.undefinedTypeSymbol ||
                type === this.semanticInfoChain.nullTypeSymbol ||
                type.isError()) {

                return this.semanticInfoChain.anyTypeSymbol;
            }

            return type;
        }

        public isNullOrUndefinedType(type: PullTypeSymbol) {
            return type === this.semanticInfoChain.nullTypeSymbol ||
                type === this.semanticInfoChain.undefinedTypeSymbol;
        }

        public findBestCommonType(initialType: PullTypeSymbol, targetType: PullTypeSymbol, collection: IPullTypeCollection, acceptVoid: boolean, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            var len = collection.getLength();
            var nlastChecked = 0;
            var bestCommonType = initialType;

            if (targetType) {
                if (bestCommonType) {
                    bestCommonType = this.mergeOrdered(bestCommonType, targetType, acceptVoid, context);
                }
                else {
                    bestCommonType = targetType
                }
            }

            // it's important that we set the convergence type here, and not in the loop,
            // since the first element considered may be the contextual type
            var convergenceType: PullTypeSymbol = bestCommonType;

            while (nlastChecked < len) {

                for (var i = 0; i < len; i++) {

                    // no use in comparing a type against itself
                    if (i === nlastChecked) {
                        continue;
                    }

                    if (convergenceType && (bestCommonType = this.mergeOrdered(convergenceType, collection.getTypeAtIndex(i), acceptVoid, context, comparisonInfo))) {
                        convergenceType = bestCommonType;
                    }

                    if (bestCommonType === null || this.isAnyOrEquivalent(bestCommonType)) {
                        break;
                    }
                    // set the element type to the target type
                    // If the contextual type is a type variable, but the BCT is not, we won't set the BCT
                    // to the contextual type, so as not to short-circuit type argument inference calculations
                    else if (targetType && !(bestCommonType.isTypeVariable() || targetType.isTypeVariable())) {
                        collection.setTypeAtIndex(i, targetType);
                    }
                }

                // use the type if we've agreed upon it
                if (convergenceType && bestCommonType) {
                    break;
                }

                nlastChecked++;
                if (nlastChecked < len) {
                    convergenceType = collection.getTypeAtIndex(nlastChecked);
                }
            }

            return acceptVoid ? bestCommonType : (bestCommonType === this.semanticInfoChain.voidTypeSymbol ? null : bestCommonType);
        }

        // Type Identity

        public typesAreIdentical(t1: PullTypeSymbol, t2: PullTypeSymbol, val?: AST) {

            // This clause will cover both primitive types (since the type objects are shared),
            // as well as shared brands
            if (t1 === t2) {
                return true;
            }

            if (!t1 || !t2) {
                return false;
            }

            if (val && t1.isPrimitive() && (<PullPrimitiveTypeSymbol>t1).isStringConstant() && t2 === this.semanticInfoChain.stringTypeSymbol) {
                return (val.nodeType === NodeType.StringLiteral) && (stripQuotes((<StringLiteral>val).actualText) === stripQuotes(t1.getName()));
            }

            if (val && t2.isPrimitive() && (<PullPrimitiveTypeSymbol>t2).isStringConstant() && t2 === this.semanticInfoChain.stringTypeSymbol) {
                return (val.nodeType === NodeType.StringLiteral) && (stripQuotes((<StringLiteral>val).actualText) === stripQuotes(t2.getName()));
            }

            if (t1.isPrimitive() && (<PullPrimitiveTypeSymbol>t1).isStringConstant() && t2.isPrimitive() && (<PullPrimitiveTypeSymbol>t2).isStringConstant()) {
                // Both are string constants
                return TypeScript.stripQuotes(t1.getName()) === TypeScript.stripQuotes(t2.getName());
            }

            if (t1.isPrimitive() || t2.isPrimitive()) {
                return false;
            }

            if (t1.isClass()) {
                return false;
            }

            if (t1.isError() && t2.isError()) {
                return true;
            }

            var comboId = (t2.getSymbolID() << 16) | t1.getSymbolID();

            if (this.identicalCache[comboId] != undefined) {
                return true;
            }

            // If one is an enum, and they're not the same type, they're not identical
            if ((t1.getKind() & PullElementKind.Enum) || (t2.getKind() & PullElementKind.Enum)) {
                return false;
            }

            if (t1.isArray() || t2.isArray()) {
                if (!(t1.isArray() && t2.isArray())) {
                    return false;
                }
                this.identicalCache[comboId] = false;
                var ret = this.typesAreIdentical(t1.getElementType(), t2.getElementType());
                if (ret) {
                    this.identicalCache[comboId] = true;
                }
                else {
                    this.identicalCache[comboId] = undefined;
                }

                return ret;
            }

            if (t1.isPrimitive() != t2.isPrimitive()) {
                return false;
            }

            this.identicalCache[comboId] = false;

            // properties are identical in name, optionality, and type
            if (t1.hasMembers() && t2.hasMembers()) {
                var t1Members = t1.getMembers();
                var t2Members = t2.getMembers();

                if (t1Members.length != t2Members.length) {
                    this.identicalCache[comboId] = undefined;
                    return false;
                }

                var t1MemberSymbol: PullSymbol = null;
                var t2MemberSymbol: PullSymbol = null;

                var t1MemberType: PullTypeSymbol = null;
                var t2MemberType: PullTypeSymbol = null;

                for (var iMember = 0; iMember < t1Members.length; iMember++) {

                    t1MemberSymbol = t1Members[iMember];
                    t2MemberSymbol = t2.findMember(t1MemberSymbol.getName());

                    if (!t2MemberSymbol || (t1MemberSymbol.getIsOptional() != t2MemberSymbol.getIsOptional())) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }

                    t1MemberType = t1MemberSymbol.getType();
                    t2MemberType = t2MemberSymbol.getType();

                    // catch the mutually recursive or cached cases
                    if (t1MemberType && t2MemberType && (this.identicalCache[(t2MemberType.getSymbolID() << 16) | t1MemberType.getSymbolID()] != undefined)) {
                        continue;
                    }

                    if (!this.typesAreIdentical(t1MemberType, t2MemberType)) {
                        this.identicalCache[comboId] = undefined;
                        return false;
                    }
                }
            }
            else if (t1.hasMembers() || t2.hasMembers()) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            var t1CallSigs = t1.getCallSignatures();
            var t2CallSigs = t2.getCallSignatures();

            var t1ConstructSigs = t1.getConstructSignatures();
            var t2ConstructSigs = t2.getConstructSignatures();

            var t1IndexSigs = t1.getIndexSignatures();
            var t2IndexSigs = t2.getIndexSignatures();

            if (!this.signatureGroupsAreIdentical(t1CallSigs, t2CallSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1ConstructSigs, t2ConstructSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            if (!this.signatureGroupsAreIdentical(t1IndexSigs, t2IndexSigs)) {
                this.identicalCache[comboId] = undefined;
                return false;
            }

            this.identicalCache[comboId] = true;
            return true;
        }

        public signatureGroupsAreIdentical(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[]) {

            // covers the null case
            if (sg1 === sg2) {
                return true;
            }

            // covers the mixed-null case
            if (!sg1 || !sg2) {
                return false;
            }

            if (sg1.length != sg2.length) {
                return false;
            }

            var sig1: PullSignatureSymbol = null;
            var sig2: PullSignatureSymbol = null;
            var sigsMatch = false;

            // The signatures in the signature group may not be ordered...
            // REVIEW: Should definition signatures be required to be identical as well?
            for (var iSig1 = 0; iSig1 < sg1.length; iSig1++) {
                sig1 = sg1[iSig1];

                for (var iSig2 = 0; iSig2 < sg2.length; iSig2++) {
                    sig2 = sg2[iSig2];

                    if (this.signaturesAreIdentical(sig1, sig2)) {
                        sigsMatch = true;
                        break;
                    }
                }

                if (sigsMatch) {
                    sigsMatch = false;
                    continue;
                }

                // no match found for a specific signature
                return false;
            }

            return true;
        }

        public signaturesAreIdentical(s1: PullSignatureSymbol, s2: PullSignatureSymbol) {

            if (s1.hasVariableParamList() != s2.hasVariableParamList()) {
                return false;
            }

            if (s1.getNonOptionalParameterCount() != s2.getNonOptionalParameterCount()) {
                return false;
            }

            var s1Params = s1.getParameters();
            var s2Params = s2.getParameters();

            if (s1Params.length != s2Params.length) {
                return false;
            }

            if (!this.typesAreIdentical(s1.getReturnType(), s2.getReturnType())) {
                return false;
            }

            for (var iParam = 0; iParam < s1Params.length; iParam++) {
                if (!this.typesAreIdentical(s1Params[iParam].getType(), s2Params[iParam].getType())) {
                    return false;
                }
            }

            return true;
        }

        // Assignment Compatibility and Subtyping

        public substituteUpperBoundForType(type: PullTypeSymbol) {
            if (!type || !type.isTypeParameter()) {
                return type;
            }

            var constraint = (<PullTypeParameterSymbol>type).getConstraint();

            if (constraint) {
                return this.substituteUpperBoundForType(constraint);
            }

            return type;
        }

        public symbolsShareDeclaration(symbol1: PullSymbol, symbol2: PullSymbol) {
            var decls1 = symbol1.getDeclarations();
            var decls2 = symbol2.getDeclarations();

            if (decls1.length && decls2.length) {
                return decls1[0].isEqual(decls2[0]);
            }

            return false;
        }

        public sourceIsSubtypeOfTarget(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            return this.sourceIsRelatableToTarget(source, target, false, this.subtypeCache, context, comparisonInfo);
        }

        public sourceMembersAreSubtypeOfTargetMembers(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            return this.sourceMembersAreRelatableToTargetMembers(source, target, false, this.subtypeCache, context, comparisonInfo);
        }

        public sourcePropertyIsSubtypeOfTargetProperty(source: PullTypeSymbol, target: PullTypeSymbol,
            sourceProp: PullSymbol, targetProp: PullSymbol, context: PullTypeResolutionContext,
            comparisonInfo?: TypeComparisonInfo) {
            return this.sourcePropertyIsRelatableToTargetProperty(source, target, sourceProp, targetProp,
                false, this.subtypeCache, context, comparisonInfo);
        }

        public sourceCallSignaturesAreSubtypeOfTargetCallSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            return this.sourceCallSignaturesAreRelatableToTargetCallSignatures(source, target, false, this.subtypeCache, context, comparisonInfo);
        }

        public sourceConstructSignaturesAreSubtypeOfTargetConstructSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            return this.sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source, target, false, this.subtypeCache, context, comparisonInfo);
        }

        public sourceIndexSignaturesAreSubtypeOfTargetIndexSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            return this.sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source, target, false, this.subtypeCache, context, comparisonInfo);
        }

        public typeIsSubtypeOfFunction(source: PullTypeSymbol, context): boolean {

            var callSignatures = source.getCallSignatures();

            if (callSignatures.length) {
                return true;
            }

            var constructSignatures = source.getConstructSignatures();

            if (constructSignatures.length) {
                return true;
            }

            if (this.cachedFunctionInterfaceType) {
                return this.sourceIsSubtypeOfTarget(source, this.cachedFunctionInterfaceType, context);
            }

            return false;
        }

        public signatureGroupIsSubtypeOfTarget(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[], context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            return this.signatureGroupIsRelatableToTarget(sg1, sg2, false, this.subtypeCache, context, comparisonInfo);
        }

        public signatureIsSubtypeOfTarget(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            return this.signatureIsRelatableToTarget(s1, s2, false, this.subtypeCache, context, comparisonInfo);
        }

        public sourceIsAssignableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean {
            return this.sourceIsRelatableToTarget(source, target, true, this.assignableCache, context, comparisonInfo);
        }

        public signatureGroupIsAssignableToTarget(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[], context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean {
            return this.signatureGroupIsRelatableToTarget(sg1, sg2, true, this.assignableCache, context, comparisonInfo);
        }

        public signatureIsAssignableToTarget(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean {
            return this.signatureIsRelatableToTarget(s1, s2, true, this.assignableCache, context, comparisonInfo);
        }

        public sourceIsRelatableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean {

            source = this.substituteUpperBoundForType(source);
            target = this.substituteUpperBoundForType(target);

            // REVIEW: Does this check even matter?
            //if (this.typesAreIdentical(source, target)) {
            //    return true;
            //}
            if (source === target) {
                return true;
            }

            // An error has already been reported in this case
            if (!(source && target)) {
                return true;
            }

            var comboId = (source.getSymbolID() << 16) | target.getSymbolID();

            // In the case of a 'false', we want to short-circuit a recursive typecheck
            if (comparisonCache[comboId] != undefined) {
                return true;
            }

            // this is one difference between subtyping and assignment compatibility
            if (assignableTo) {
                if (this.isAnyOrEquivalent(source) || this.isAnyOrEquivalent(target)) {
                    return true;
                }

                if (source === this.semanticInfoChain.stringTypeSymbol && target.isPrimitive() && (<PullPrimitiveTypeSymbol>target).isStringConstant()) {
                    return comparisonInfo &&
                        comparisonInfo.stringConstantVal &&
                        (comparisonInfo.stringConstantVal.nodeType === NodeType.StringLiteral) &&
                        (stripQuotes((<StringLiteral>comparisonInfo.stringConstantVal).actualText) === stripQuotes(target.getName()));
                }
            }
            else {
                // This is one difference between assignment compatibility and subtyping
                if (this.isAnyOrEquivalent(target)) {
                    return true;
                }

                if (target === this.semanticInfoChain.stringTypeSymbol && source.isPrimitive() && (<PullPrimitiveTypeSymbol>source).isStringConstant()) {
                    return true;
                }
            }

            if (source.isPrimitive() && (<PullPrimitiveTypeSymbol>source).isStringConstant() && target.isPrimitive() && (<PullPrimitiveTypeSymbol>target).isStringConstant()) {
                // Both are string constants
                return TypeScript.stripQuotes(source.getName()) === TypeScript.stripQuotes(target.getName());
            }

            if (source === this.semanticInfoChain.undefinedTypeSymbol) {
                return true;
            }

            if ((source === this.semanticInfoChain.nullTypeSymbol) && (target != this.semanticInfoChain.undefinedTypeSymbol && target != this.semanticInfoChain.voidTypeSymbol)) {
                return true;
            }

            // REVIEW: enum types aren't explicitly covered in the spec
            if (target === this.semanticInfoChain.numberTypeSymbol && (source.getKind() & PullElementKind.Enum)) {
                return true;
            }
            if (source === this.semanticInfoChain.numberTypeSymbol && (target.getKind() & PullElementKind.Enum)) {
                return true;
            }
            if ((source.getKind() & PullElementKind.Enum) || (target.getKind() & PullElementKind.Enum)) {
                return false;
            }

            if (source.isArray() && target.isArray()) {
                comparisonCache[comboId] = false;
                var ret = this.sourceIsRelatableToTarget(source.getElementType(), target.getElementType(), assignableTo, comparisonCache, context, comparisonInfo);
                if (ret) {
                    comparisonCache[comboId] = true;
                }
                else {
                    comparisonCache[comboId] = undefined;
                }

                return ret;
            }

            if (target.isTypeParameter()) {

                if (!source.isTypeParameter()) {
                    return false;
                }

                return this.symbolsShareDeclaration(source, target);
            }

            // this check ensures that we only operate on object types from this point forward,
            // since the checks involving primitives occurred above
            if (source.isPrimitive() && target.isPrimitive()) {

                // we already know that they're not the same, and that neither is 'any'
                return false;
            }
            else if (source.isPrimitive() != target.isPrimitive()) {

                if (!target.isPrimitive()) {
                    if (source === this.semanticInfoChain.numberTypeSymbol && this.cachedNumberInterfaceType) {

                        if (!this.cachedNumberInterfaceType.isResolved()) {
                            this.resolveDeclaredSymbol(this.cachedNumberInterfaceType, null, context);
                        }

                        source = this.cachedNumberInterfaceType;
                    }
                    else if (source === this.semanticInfoChain.stringTypeSymbol && this.cachedStringInterfaceType) {

                        if (!this.cachedStringInterfaceType.isResolved()) {
                            this.resolveDeclaredSymbol(this.cachedStringInterfaceType, null, context);
                        }

                        source = this.cachedStringInterfaceType;
                    }
                    else if (source === this.semanticInfoChain.booleanTypeSymbol && this.cachedBooleanInterfaceType) {

                        if (!this.cachedBooleanInterfaceType.isResolved()) {
                            this.resolveDeclaredSymbol(this.cachedBooleanInterfaceType, null, context);
                        }

                        source = this.cachedBooleanInterfaceType;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }

            comparisonCache[comboId] = false;

            if (source.hasBase(target)) {
                comparisonCache[comboId] = true;
                return true;
            }

            if (this.cachedObjectInterfaceType && target === this.cachedObjectInterfaceType) {
                return true;
            }

            if (this.cachedFunctionInterfaceType && (source.getCallSignatures().length || source.getConstructSignatures().length) && target === this.cachedFunctionInterfaceType) {
                return true;
            }

            if (target.hasMembers() && !this.sourceMembersAreRelatableToTargetMembers(source, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            if (!this.sourceCallSignaturesAreRelatableToTargetCallSignatures(source, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            if (!this.sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            if (!this.sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source, target, assignableTo, comparisonCache, context, comparisonInfo)) {
                comparisonCache[comboId] = undefined;
                return false;
            }

            comparisonCache[comboId] = true;
            return true;
        }

        public sourceMembersAreRelatableToTargetMembers(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean,
            comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean {
            var targetProps = target.getAllMembers(PullElementKind.SomeValue, true);

            for (var itargetProp = 0; itargetProp < targetProps.length; itargetProp++) {

                var targetProp = targetProps[itargetProp];
                var sourceProp = source.findMember(targetProp.getName());

                if (!targetProp.isResolved()) {
                    this.resolveDeclaredSymbol(targetProp, null, context);
                }

                var targetPropType = targetProp.getType();

                if (!sourceProp) {
                    // If it's not present on the type in question, look for the property on 'Object'
                    if (this.cachedObjectInterfaceType) {
                        sourceProp = this.cachedObjectInterfaceType.findMember(targetProp.getName());
                    }

                    if (!sourceProp) {
                        // Now, the property was not found on Object, but the type in question is a function, look
                        // for it on function
                        if (this.cachedFunctionInterfaceType && (targetPropType.getCallSignatures().length || targetPropType.getConstructSignatures().length)) {
                            sourceProp = this.cachedFunctionInterfaceType.findMember(targetProp.getName());
                        }

                        // finally, check to see if the property is optional
                        if (!sourceProp) {
                            if (!(targetProp.getIsOptional())) {
                                if (comparisonInfo) { // only surface the first error
                                    comparisonInfo.flags |= TypeRelationshipFlags.RequiredPropertyIsMissing;
                                    comparisonInfo.addMessage(getDiagnosticMessage("Type '{0}' is missing property '{1}' from type '{2}'.",
                                        [source.toString(), targetProp.getScopedNameEx().toString(), target.toString()]));
                                }
                                return false;
                            }
                            continue;
                        }
                    }
                }

                if (!this.sourcePropertyIsRelatableToTargetProperty(source, target, sourceProp, targetProp, assignableTo,
                    comparisonCache, context, comparisonInfo)) {
                    return false;
                }
            }

            return true;
        }

        public sourcePropertyIsRelatableToTargetProperty(source: PullTypeSymbol, target: PullTypeSymbol,
            sourceProp: PullSymbol, targetProp: PullSymbol, assignableTo: boolean, comparisonCache: any,
            context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean {
            var targetPropIsPrivate = targetProp.hasFlag(PullElementFlags.Private);
            var sourcePropIsPrivate = sourceProp.hasFlag(PullElementFlags.Private);

            // if visibility doesn't match, the types don't match
            if (targetPropIsPrivate != sourcePropIsPrivate) {
                if (comparisonInfo) { // only surface the first error
                    if (targetPropIsPrivate) {
                        // Overshadowing property in source that is already defined as private in target
                        comparisonInfo.addMessage(getDiagnosticMessage("Property '{0}' defined as public in type '{1}' is defined as private in type '{2}'.",
                            [targetProp.getScopedNameEx().toString(), sourceProp.getContainer().toString(), targetProp.getContainer().toString()]));
                    } else {
                        // Public property of target is private in source
                        comparisonInfo.addMessage(getDiagnosticMessage("Property '{0}' defined as private in type '{1}' is defined as public in type '{2}'.",
                            [targetProp.getScopedNameEx().toString(), sourceProp.getContainer().toString(), targetProp.getContainer().toString()]));
                    }
                    comparisonInfo.flags |= TypeRelationshipFlags.InconsistantPropertyAccesibility;
                }
                return false;
            }
            // if both are private members, test to ensure that they share a declaration
            else if (sourcePropIsPrivate && targetPropIsPrivate) {
                var targetDecl = targetProp.getDeclarations()[0];
                var sourceDecl = sourceProp.getDeclarations()[0];

                if (!targetDecl.isEqual(sourceDecl)) {
                    // Both types define property with same name as private
                    comparisonInfo.flags |= TypeRelationshipFlags.InconsistantPropertyAccesibility;
                    comparisonInfo.addMessage(getDiagnosticMessage("Types '{0}' and '{1}' define property '{2}' as private.",
                        [sourceProp.getContainer().toString(), targetProp.getContainer().toString(), targetProp.getScopedNameEx().toString()]));
                    return false;
                }
            }

            if (!sourceProp.isResolved()) {
                this.resolveDeclaredSymbol(sourceProp, null, context);
            }

            var sourcePropType = sourceProp.getType();
            var targetPropType = targetProp.getType();

            // catch the mutually recursive or cached cases
            if (targetPropType && sourcePropType && (comparisonCache[(sourcePropType.getSymbolID() << 16) | targetPropType.getSymbolID()] != undefined)) {
                return true;
            }

            var comparisonInfoPropertyTypeCheck: TypeComparisonInfo = null;
            if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                comparisonInfoPropertyTypeCheck = new TypeComparisonInfo(comparisonInfo);
            }
            if (!this.sourceIsRelatableToTarget(sourcePropType, targetPropType, assignableTo, comparisonCache, context, comparisonInfoPropertyTypeCheck)) {
                if (comparisonInfo) {
                    comparisonInfo.flags |= TypeRelationshipFlags.IncompatiblePropertyTypes;
                    var message: string;
                    if (comparisonInfoPropertyTypeCheck && comparisonInfoPropertyTypeCheck.message) {
                        message = getDiagnosticMessage("Types of property '{0}' of types '{1}' and '{2}' are incompatible:{NL}{3}",
                            [targetProp.getScopedNameEx().toString(), source.toString(), target.toString(), comparisonInfoPropertyTypeCheck.message]);
                    } else {
                        message = getDiagnosticMessage("Types of property '{0}' of types '{1}' and '{2}' are incompatible.",
                            [targetProp.getScopedNameEx().toString(), source.toString(), target.toString()]);
                    }
                    comparisonInfo.addMessage(message);
                }

                return false;
            }

            return true;
        }

        public sourceCallSignaturesAreRelatableToTargetCallSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo): boolean {

            var targetCallSigs = target.getCallSignatures();

            // check signature groups
            if (targetCallSigs.length) {
                var comparisonInfoSignatuesTypeCheck: TypeComparisonInfo = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeComparisonInfo(comparisonInfo);
                }

                var sourceCallSigs = source.getCallSignatures();
                if (!this.signatureGroupIsRelatableToTarget(sourceCallSigs, targetCallSigs, assignableTo, comparisonCache, context, comparisonInfoSignatuesTypeCheck)) {
                    if (comparisonInfo) {
                        var message: string;
                        if (sourceCallSigs.length && targetCallSigs.length) {
                            if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                                message = getDiagnosticMessage("Call signatures of types '{0}' and '{1}' are incompatible:{NL}{2}",
                                    [source.toString(), target.toString(), comparisonInfoSignatuesTypeCheck.message]);
                            } else {
                                message = getDiagnosticMessage("Call signatures of types '{0}' and '{1}' are incompatible.",
                                    [source.toString(), target.toString()]);
                            }
                        } else {
                            var hasSig = targetCallSigs.length ? target.toString() : source.toString();
                            var lacksSig = !targetCallSigs.length ? target.toString() : source.toString();
                            message = getDiagnosticMessage("Type '{0}' requires a call signature, but type '{1}' lacks one.", [hasSig, lacksSig]);
                        }
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleSignatures;
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            return true;
        }

        public sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo): boolean {

            // check signature groups
            var targetConstructSigs = target.getConstructSignatures();
            if (targetConstructSigs.length) {
                var comparisonInfoSignatuesTypeCheck: TypeComparisonInfo = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeComparisonInfo(comparisonInfo);
                }

                var sourceConstructSigs = source.getConstructSignatures();
                if (!this.signatureGroupIsRelatableToTarget(sourceConstructSigs, targetConstructSigs, assignableTo, comparisonCache, context, comparisonInfoSignatuesTypeCheck)) {
                    if (comparisonInfo) {
                        var message: string;
                        if (sourceConstructSigs.length && targetConstructSigs.length) {
                            if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                                message = getDiagnosticMessage("Construct signatures of types '{0}' and '{1}' are incompatible:{NL}{2}",
                                    [source.toString(), target.toString(), comparisonInfoSignatuesTypeCheck.message]);
                            } else {
                                message = getDiagnosticMessage("Construct signatures of types '{0}' and '{1}' are incompatible.",
                                    [source.toString(), target.toString()]);
                            }
                        } else {
                            var hasSig = targetConstructSigs.length ? target.toString() : source.toString();
                            var lacksSig = !targetConstructSigs.length ? target.toString() : source.toString();
                            message = getDiagnosticMessage("Type '{0}' requires a construct signature, but type '{1}' lacks one.", [hasSig, lacksSig]);
                        }
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleSignatures;
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            return true;
        }

        public sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source: PullTypeSymbol, target: PullTypeSymbol,
            assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext,
            comparisonInfo: TypeComparisonInfo): boolean {

            var targetIndexSigs = target.getIndexSignatures();
            
            if (targetIndexSigs.length) {
                var sourceIndexSigs = source.getIndexSignatures();
                
                var targetIndex = !targetIndexSigs.length && this.cachedObjectInterfaceType ? this.cachedObjectInterfaceType.getIndexSignatures() : targetIndexSigs;
                var sourceIndex = !sourceIndexSigs.length && this.cachedObjectInterfaceType ? this.cachedObjectInterfaceType.getIndexSignatures() : sourceIndexSigs;
                
                var sourceStringSig: PullSignatureSymbol = null;
                var sourceNumberSig: PullSignatureSymbol = null;
                
                var targetStringSig: PullSignatureSymbol = null;
                var targetNumberSig: PullSignatureSymbol = null;
                
                var params: PullSymbol[];                

                for (var i = 0; i < targetIndex.length; i++) {
                    if (targetStringSig && targetNumberSig) {
                        break;
                    }

                    params = targetIndex[i].getParameters();

                    if (params.length) {
                        if (!targetStringSig && params[0].getType() === this.semanticInfoChain.stringTypeSymbol) {
                            targetStringSig = targetIndex[i];
                            continue;
                        }
                        else if (!targetNumberSig && params[0].getType() === this.semanticInfoChain.numberTypeSymbol) {
                            targetNumberSig = targetIndex[i];
                            continue;
                        }
                    }
                }

                for (var i = 0; i < sourceIndex.length; i++) {
                    if (sourceStringSig && sourceNumberSig) {
                        break;
                    }

                    params = sourceIndex[i].getParameters();

                    if (params.length) {
                        if (!sourceStringSig && params[0].getType() === this.semanticInfoChain.stringTypeSymbol) {
                            sourceStringSig = sourceIndex[i];
                            continue;
                        }
                        else if (!sourceNumberSig && params[0].getType() === this.semanticInfoChain.numberTypeSymbol) {
                            sourceNumberSig = sourceIndex[i];
                            continue;
                        }
                    }
                }

                var comparable = true;
                var comparisonInfoSignatuesTypeCheck: TypeComparisonInfo = null;
                if (comparisonInfo && !comparisonInfo.onlyCaptureFirstError) {
                    comparisonInfoSignatuesTypeCheck = new TypeComparisonInfo(comparisonInfo);
                }

                if (targetStringSig) {
                    if (sourceStringSig) {
                        comparable = this.signatureIsAssignableToTarget(sourceStringSig, targetStringSig, context, comparisonInfoSignatuesTypeCheck);
                    }
                    else {
                        comparable = false;
                    }
                }

                if (comparable && targetNumberSig) {
                    if (sourceNumberSig) {
                        comparable = this.signatureIsAssignableToTarget(sourceNumberSig, targetNumberSig, context, comparisonInfoSignatuesTypeCheck);
                    }
                    else if (sourceStringSig) {
                        comparable = this.sourceIsAssignableToTarget(sourceStringSig.getReturnType(), targetNumberSig.getReturnType(), context, comparisonInfoSignatuesTypeCheck);
                    }
                    else {
                        comparable = false;
                    }
                }

                if (!comparable) {
                    if (comparisonInfo) {
                        var message: string;
                        if (comparisonInfoSignatuesTypeCheck && comparisonInfoSignatuesTypeCheck.message) {
                            message = getDiagnosticMessage("Index signatures of types '{0}' and '{1}' are incompatible:{NL}{2}",
                                [source.toString(), target.toString(), comparisonInfoSignatuesTypeCheck.message]);
                        } else {
                            message = getDiagnosticMessage("Index signatures of types '{0}' and '{1}' are incompatible.",
                                [source.toString(), target.toString()]);
                        }
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleSignatures;
                        comparisonInfo.addMessage(message);
                    }
                    return false;
                }
            }

            // if the target has a string signature, the source's members must be comparable with it's return type
            if (targetStringSig && source.hasMembers()) {
                var targetReturnType = targetStringSig.getReturnType();
                var sourceMembers = source.getMembers();

                for (var i = 0; i < sourceMembers.length; i++) {
                    if (!this.sourceIsRelatableToTarget(sourceMembers[i].getType(), targetReturnType, assignableTo, comparisonCache, context, comparisonInfo)) {
                        return false;
                    }
                }
            }

            return true;
        }

        // REVIEW: TypeChanges: Return an error context object so the user can get better diagnostic info
        public signatureGroupIsRelatableToTarget(sourceSG: PullSignatureSymbol[], targetSG: PullSignatureSymbol[], assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {
            if (sourceSG === targetSG) {
                return true;
            }

            if (!(sourceSG.length && targetSG.length)) {
                return false;
            }

            var mSig: PullSignatureSymbol = null;
            var nSig: PullSignatureSymbol = null;
            var foundMatch = false;

            for (var iMSig = 0; iMSig < targetSG.length; iMSig++) {
                mSig = targetSG[iMSig];

                if (mSig.isStringConstantOverloadSignature()) {
                    continue;
                }

                for (var iNSig = 0; iNSig < sourceSG.length; iNSig++) {
                    nSig = sourceSG[iNSig];

                    if (nSig.isStringConstantOverloadSignature()) {
                        continue;
                    }

                    if (this.signatureIsRelatableToTarget(nSig, mSig, assignableTo, comparisonCache, context, comparisonInfo)) {
                        foundMatch = true;
                        break;
                    }
                }

                if (foundMatch) {
                    foundMatch = false;
                    continue;
                }
                return false;
            }

            return true;
        }

        public signatureIsRelatableToTarget(sourceSig: PullSignatureSymbol, targetSig: PullSignatureSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo) {

            var sourceParameters = sourceSig.getParameters();
            var targetParameters = targetSig.getParameters();

            if (!sourceParameters || !targetParameters) {
                return false;
            }

            var targetVarArgCount = /*targetSig.hasVariableParamList() ? targetSig.getNonOptionalParameterCount() - 1 :*/ targetSig.getNonOptionalParameterCount();
            var sourceVarArgCount = /*sourceSig.hasVariableParamList() ? sourceSig.getNonOptionalParameterCount() - 1 :*/ sourceSig.getNonOptionalParameterCount();

            if (sourceVarArgCount > targetVarArgCount && !targetSig.hasVariableParamList()) {
                if (comparisonInfo) {
                    comparisonInfo.flags |= TypeRelationshipFlags.SourceSignatureHasTooManyParameters;
                    comparisonInfo.addMessage(getDiagnosticMessage("Call signature expects {0} or fewer parameters.", [targetVarArgCount]));
                }
                return false;
            }

            var sourceReturnType = sourceSig.getReturnType();
            var targetReturnType = targetSig.getReturnType();

            if (targetReturnType != this.semanticInfoChain.voidTypeSymbol) {
                if (!this.sourceIsRelatableToTarget(sourceReturnType, targetReturnType, assignableTo, comparisonCache, context, comparisonInfo)) {
                    if (comparisonInfo) {
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleReturnTypes;
                        // No need to print this one here - it's printed as part of the signature error in sourceIsRelatableToTarget
                        //comparisonInfo.addMessage("Incompatible return types: '" + sourceReturnType.getTypeName() + "' and '" + targetReturnType.getTypeName() + "'");
                    }
                    return false;
                }
            }

            // the clause 'sourceParameters.length > sourceVarArgCount' covers optional parameters, since even though the parameters are optional
            // they need to agree with the target params
            var len = (sourceVarArgCount < targetVarArgCount && (sourceSig.hasVariableParamList() || (sourceParameters.length > sourceVarArgCount))) ? targetVarArgCount : sourceVarArgCount;
            var sourceParamType: PullTypeSymbol = null;
            var targetParamType: PullTypeSymbol = null;
            var sourceParamName = "";
            var targetParamName = "";

            for (var iSource = 0, iTarget = 0; iSource < len; iSource++ , iTarget++) {

                if (iSource < sourceParameters.length && (!sourceSig.hasVariableParamList() || iSource < sourceVarArgCount)) {
                    sourceParamType = sourceParameters[iSource].getType();
                    sourceParamName = sourceParameters[iSource].getName();
                }
                else if (iSource === sourceVarArgCount) {
                    sourceParamType = sourceParameters[iSource].getType();
                    if (sourceParamType.isArray()) {
                        sourceParamType = sourceParamType.getElementType();
                    }
                    sourceParamName = sourceParameters[iSource].getName();
                }

                if (iTarget < targetParameters.length && iTarget < targetVarArgCount) {
                    targetParamType = targetParameters[iTarget].getType();
                    targetParamName = targetParameters[iTarget].getName();
                }
                else if (targetSig.hasVariableParamList() && iTarget === targetVarArgCount) {
                    targetParamType = targetParameters[iTarget].getType();

                    if (targetParamType.isArray()) {
                        targetParamType = targetParamType.getElementType();
                    }
                    targetParamName = targetParameters[iTarget].getName();
                }

                if (!(this.sourceIsRelatableToTarget(sourceParamType, targetParamType, assignableTo, comparisonCache, context, comparisonInfo) ||
                    this.sourceIsRelatableToTarget(targetParamType, sourceParamType, assignableTo, comparisonCache, context, comparisonInfo))) {

                    if (comparisonInfo) {
                        comparisonInfo.flags |= TypeRelationshipFlags.IncompatibleParameterTypes;
                    }
                    return false;
                }
            }
            return true;
        }

        // Overload resolution

        public resolveOverloads(application: AST, group: PullSignatureSymbol[], enclosingDecl: PullDecl, haveTypeArgumentsAtCallSite: boolean, context: PullTypeResolutionContext): PullSignatureSymbol {
            var rd = this.resolutionDataCache.getResolutionData();
            var actuals = rd.actuals;
            var exactCandidates = rd.exactCandidates;
            var conversionCandidates = rd.conversionCandidates;
            var candidate: PullSignatureSymbol = null;
            var hasOverloads = group.length > 1;
            var comparisonInfo = new TypeComparisonInfo();
            var args: ASTList = null;
            var target: AST = null;
            var argSym: PullSymbol;

            if (application.nodeType === NodeType.InvocationExpression || application.nodeType === NodeType.ObjectCreationExpression) {
                var callEx = <CallExpression>application;

                args = callEx.arguments;
                target = this.getLastIdentifierInTarget(callEx);

                if (callEx.arguments) {
                    var len = callEx.arguments.members.length;

                    for (var i = 0; i < len; i++) {
                        argSym = this.resolveStatementOrExpression(callEx.arguments.members[i], false, enclosingDecl, context);
                        actuals[i] = argSym.getType();
                    }
                }
            }
            else if (application.nodeType === NodeType.ElementAccessExpression) {
                var binExp = <BinaryExpression>application;
                target = binExp.operand1;
                args = new ASTList();
                args.members[0] = binExp.operand2;
                argSym = this.resolveStatementOrExpression(args.members[0], false, enclosingDecl, context);
                actuals[0] = argSym.getType();
            }

            var signature: PullSignatureSymbol;
            var returnType: PullTypeSymbol;
            var candidateInfo: { sig: PullSignatureSymbol; ambiguous: boolean; };

            for (var j = 0, groupLen = group.length; j < groupLen; j++) {
                signature = group[j];
                if ((hasOverloads && signature.isDefinition()) || (haveTypeArgumentsAtCallSite && !signature.isGeneric())) {
                    continue;
                }

                returnType = signature.getReturnType();

                this.getCandidateSignatures(signature, actuals, args, exactCandidates, conversionCandidates, enclosingDecl, context, comparisonInfo);
            }
            if (exactCandidates.length === 0) {

                var applicableCandidates = this.getApplicableSignaturesFromCandidates(conversionCandidates, args, comparisonInfo, enclosingDecl, context);
                if (applicableCandidates.length > 0) {
                    candidateInfo = this.findMostApplicableSignature(applicableCandidates, args, enclosingDecl, context);
                    //if (candidateInfo.ambiguous) {
                    //    //this.errorReporter.simpleError(target, "Ambiguous call expression - could not choose overload");
                    //    context.postError(application.minChar, application.getLength(), this.unitPath, "Ambiguous call expression - could not choose overload", enclosingDecl, true);
                    //}
                    candidate = candidateInfo.sig;
                }
                else {
                    if (comparisonInfo.message) {
                        //this.checker.errorReporter.simpleError(target, emsg + ":\n\t" + comparisonInfo.message);
                        context.postError(this.unitPath, target.minChar, target.getLength(), "Supplied parameters do not match any signature of call target:{NL}{0}", [comparisonInfo.message], enclosingDecl, true);
                    }
                    else {
                        context.postError(this.unitPath, target.minChar, target.getLength(), "Supplied parameters do not match any signature of call target.", null, enclosingDecl, true);
                        //this.checker.errorReporter.simpleError(target, emsg);
                    }
                }
            }
            else {

                if (exactCandidates.length > 1) {
                    var applicableSigs: PullApplicableSignature[] = [];
                    for (var i = 0; i < exactCandidates.length; i++) {
                        applicableSigs[i] = { signature: exactCandidates[i], hadProvisionalErrors: false };
                    }
                    candidateInfo = this.findMostApplicableSignature(applicableSigs, args, enclosingDecl, context);
                    //if (candidateInfo.ambiguous) {
                    //    //this.checker.errorReporter.simpleError(target, "Ambiguous call expression - could not choose overload");
                    //    context.postError(application.minChar, application.getLength(), this.unitPath, "Ambiguous call expression - could not choose overload", enclosingDecl, true);
                    //}
                    candidate = candidateInfo.sig;
                }
                else {
                    candidate = exactCandidates[0];
                }
            }

            this.resolutionDataCache.returnResolutionData(rd);
            return candidate;
        }

        private getLastIdentifierInTarget(callEx: CallExpression): AST {
            return (callEx.target.nodeType === NodeType.MemberAccessExpression) ? (<BinaryExpression>callEx.target).operand2 : callEx.target;
        }

        public getCandidateSignatures(signature: PullSignatureSymbol, actuals: PullTypeSymbol[], args: ASTList, exactCandidates: PullSignatureSymbol[], conversionCandidates: PullSignatureSymbol[], enclosingDecl: PullDecl, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): void {
            var parameters = signature.getParameters();
            var lowerBound = signature.getNonOptionalParameterCount(); // required parameters
            var upperBound = parameters.length; // required and optional parameters
            var formalLen = lowerBound;
            var acceptable = false;

            if ((actuals.length >= lowerBound) && (signature.hasVariableParamList() || actuals.length <= upperBound)) {
                formalLen = (signature.hasVariableParamList() ? parameters.length : actuals.length);
                acceptable = true;
            }

            var repeatType: PullTypeSymbol = null;

            if (acceptable) {
                // assumed structure here is checked when signature is formed
                if (signature.hasVariableParamList()) {
                    formalLen -= 1;
                    repeatType = parameters[formalLen].getType();
                    repeatType = repeatType.getElementType();
                    acceptable = actuals.length >= (formalLen < lowerBound ? formalLen : lowerBound);
                }
                var len = actuals.length;

                var exact = acceptable;
                var convert = acceptable;

                var typeA: PullTypeSymbol;
                var typeB: PullTypeSymbol;

                for (var i = 0; i < len; i++) {

                    if (i < formalLen) {
                        typeA = parameters[i].getType();
                    }
                    else {
                        typeA = repeatType;
                    }

                    typeB = actuals[i];

                    if (typeA && !typeA.isResolved()) {
                        this.resolveDeclaredSymbol(typeA, enclosingDecl, context);
                    }

                    if (typeB && !typeB.isResolved()) {
                        this.resolveDeclaredSymbol(typeB, enclosingDecl, context);
                    }

                    if (!typeA || !typeB || !(this.typesAreIdentical(typeA, typeB, args.members[i]))) {
                        exact = false;
                    }

                    comparisonInfo.stringConstantVal = args.members[i];

                    // is the argument assignable to the parameter?
                    if (!this.sourceIsAssignableToTarget(typeB, typeA, context, comparisonInfo)) {
                        convert = false;
                    }

                    comparisonInfo.stringConstantVal = null;

                    if (!(exact || convert)) {
                        break;
                    }
                }
                if (exact) {
                    exactCandidates[exactCandidates.length] = signature;
                }
                else if (convert && (exactCandidates.length === 0)) {
                    conversionCandidates[conversionCandidates.length] = signature;
                }
            }
        }

        public getApplicableSignaturesFromCandidates(candidateSignatures: PullSignatureSymbol[],
            args: ASTList,
            comparisonInfo: TypeComparisonInfo,
            enclosingDecl: PullDecl,
            context: PullTypeResolutionContext): PullApplicableSignature[] {

            var applicableSigs: PullApplicableSignature[] = [];
            var memberType: PullTypeSymbol = null;
            var miss = false;
            var cxt: PullContextualTypeContext = null;
            var hadProvisionalErrors = false;

            var parameters: PullSymbol[];
            var signature: PullSignatureSymbol;
            var argSym: PullSymbol;

            for (var i = 0; i < candidateSignatures.length; i++) {
                miss = false;

                signature = candidateSignatures[i];
                parameters = signature.getParameters();

                for (var j = 0; j < args.members.length; j++) {

                    if (j >= parameters.length) {
                        continue;
                    }

                    if (!parameters[j].isResolved()) {
                        this.resolveDeclaredSymbol(parameters[j], enclosingDecl, context);
                    }

                    memberType = parameters[j].getType();

                    // account for varargs
                    if (signature.hasVariableParamList() && (j >= signature.getNonOptionalParameterCount()) && memberType.isArray()) {
                        memberType = memberType.getElementType();
                    }

                    if (this.isAnyOrEquivalent(memberType)) {
                        continue;
                    }
                    else if (args.members[j].nodeType === NodeType.FunctionDeclaration) {

                        if (this.cachedFunctionInterfaceType && memberType === this.cachedFunctionInterfaceType) {
                            continue;
                        }

                        argSym = this.resolveFunctionExpression(<FunctionDeclaration>args.members[j], false, enclosingDecl, context);

                        if (!this.canApplyContextualTypeToFunction(memberType, <FunctionDeclaration>args.members[j], true)) {
                            // if it's just annotations that are blocking us, typecheck the function and add it to the list
                            if (this.canApplyContextualTypeToFunction(memberType, <FunctionDeclaration>args.members[j], false)) {
                                if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo)) {
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                        else { // if it can be contextually typed, try it out...
                            //argSym.invalidate();
                            context.pushContextualType(memberType, true, null);

                            argSym = this.resolveFunctionExpression(<FunctionDeclaration>args.members[j], true, enclosingDecl, context);

                            if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo)) {
                                if (comparisonInfo) {
                                    comparisonInfo.setMessage(getDiagnosticMessage("Could not apply type'{0}' to argument {1} which is of type '{2}'.",
                                        [memberType.toString(), (j + 1), argSym.getTypeName()]));
                                }
                                miss = true;
                            }
                            argSym.invalidate();
                            cxt = context.popContextualType();
                            hadProvisionalErrors = cxt.hadProvisionalErrors();

                            //argSym.invalidate();

                            //this.resetProvisionalErrors();
                            if (miss) {
                                break;
                            }
                        }
                    }
                    else if (args.members[j].nodeType === NodeType.ObjectLiteralExpression) {
                        // now actually attempt to typecheck as the contextual type
                        if (this.cachedObjectInterfaceType && memberType === this.cachedObjectInterfaceType) {
                            continue;
                        }
                        context.pushContextualType(memberType, true, null);
                        argSym = this.resolveObjectLiteralExpression(args.members[j], true, enclosingDecl, context);


                        if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo)) {
                            if (comparisonInfo) {
                                comparisonInfo.setMessage(getDiagnosticMessage("Could not apply type'{0}' to argument {1} which is of type '{2}'.",
                                    [memberType.toString(), (j + 1), argSym.getTypeName()]));
                            }
                            miss = true;
                        }
                        argSym.invalidate();
                        cxt = context.popContextualType();
                        hadProvisionalErrors = cxt.hadProvisionalErrors();

                        //argSym.invalidate();

                        //this.resetProvisionalErrors();
                        if (miss) {
                            break;
                        }
                    }
                    else if (args.members[j].nodeType === NodeType.ArrayLiteralExpression) {
                        // attempt to contextually type the array literal
                        if (this.cachedArrayInterfaceType && memberType === this.cachedArrayInterfaceType) {
                            continue;
                        }

                        context.pushContextualType(memberType, true, null);
                        argSym = this.resolveArrayLiteralExpression(args.members[j], true, enclosingDecl, context);

                        if (!this.sourceIsAssignableToTarget(argSym.getType(), memberType, context, comparisonInfo)) {
                            if (comparisonInfo) {
                                comparisonInfo.setMessage(getDiagnosticMessage("Could not apply type'{0}' to argument {1} which is of type '{2}'.",
                                    [memberType.toString(), (j + 1), argSym.getTypeName()]));
                            }
                            break;
                        }
                        argSym.invalidate();
                        cxt = context.popContextualType();

                        hadProvisionalErrors = cxt.hadProvisionalErrors();

                        //argSym.invalidate();

                        if (miss) {
                            break;
                        }
                    }
                }

                if (j === args.members.length) {
                    applicableSigs[applicableSigs.length] = { signature: candidateSignatures[i], hadProvisionalErrors: hadProvisionalErrors };
                }
                hadProvisionalErrors = false;
            }

            return applicableSigs;
        }

        public findMostApplicableSignature(signatures: PullApplicableSignature[], args: ASTList, enclosingDecl: PullDecl, context: PullTypeResolutionContext): { sig: PullSignatureSymbol; ambiguous: boolean; } {

            if (signatures.length === 1) {
                return { sig: signatures[0].signature, ambiguous: false };
            }

            var best: PullApplicableSignature = signatures[0];
            var Q: PullApplicableSignature = null;

            var AType: PullTypeSymbol = null;
            var PType: PullTypeSymbol = null;
            var QType: PullTypeSymbol = null;

            var ambiguous = false;

            var argSym: PullSymbol;

            var bestParams: PullSymbol[];
            var qParams: PullSymbol[];

            for (var qSig = 1; qSig < signatures.length; qSig++) {
                Q = signatures[qSig];

                // find the better conversion
                for (var i = 0; args && i < args.members.length; i++) {

                    argSym = this.resolveStatementOrExpression(args.members[i], false, enclosingDecl, context);

                    AType = argSym.getType();

                    // invalidate the argument so that we may correctly resolve it later as part of the call expression
                    argSym.invalidate();

                    bestParams = best.signature.getParameters();
                    qParams = Q.signature.getParameters();

                    PType = i < bestParams.length ? bestParams[i].getType() : bestParams[bestParams.length - 1].getType().getElementType();
                    QType = i < qParams.length ? qParams[i].getType() : qParams[qParams.length - 1].getType().getElementType();

                    if (this.typesAreIdentical(PType, QType) && !(QType.isPrimitive() && (<PullPrimitiveTypeSymbol>QType).isStringConstant())) {
                        continue;
                    }
                    else if (PType.isPrimitive() &&
                        (<PullPrimitiveTypeSymbol>PType).isStringConstant() &&
                        args.members[i].nodeType === NodeType.StringLiteral &&
                        stripQuotes((<StringLiteral>args.members[i]).actualText) === stripQuotes((<PullStringConstantTypeSymbol>PType).getName()))
                    {
                        break;
                    }
                    else if (QType.isPrimitive() &&
                        (<PullPrimitiveTypeSymbol>QType).isStringConstant() &&
                        args.members[i].nodeType === NodeType.StringLiteral &&
                        stripQuotes((<StringLiteral>args.members[i]).actualText) === stripQuotes((<PullStringConstantTypeSymbol>QType).getName()))
                    {
                        best = Q;
                    }
                    else if (this.typesAreIdentical(AType, PType)) {
                        break;
                    }
                    else if (this.typesAreIdentical(AType, QType)) {
                        best = Q;
                        break;
                    }
                    else if (this.sourceIsSubtypeOfTarget(PType, QType, context)) {
                        break;
                    }
                    else if (this.sourceIsSubtypeOfTarget(QType, PType, context)) {
                        best = Q;
                        break;
                    }
                    else if (Q.hadProvisionalErrors) {
                        break;
                    }
                    else if (best.hadProvisionalErrors) {
                        best = Q;
                        break;
                    }
                }

                if (!args || i === args.members.length) {
                    var collection: IPullTypeCollection = {
                        getLength: () => { return 2; } ,
                        setTypeAtIndex: (index: number, type: PullTypeSymbol) => { } , // no contextual typing here, so no need to do anything
                        getTypeAtIndex: (index: number) => { return index ? Q.signature.getReturnType() : best.signature.getReturnType(); } // we only want the "second" type - the "first" is skipped
                    }
                    var bct = this.findBestCommonType(best.signature.getReturnType(), null, collection, true, context);
                    ambiguous = !bct;
                }
                else {
                    ambiguous = false;
                }
            }

            // double-check if the 

            return { sig: best.signature, ambiguous: ambiguous };
        }

        public canApplyContextualTypeToFunction(candidateType: PullTypeSymbol, funcDecl: FunctionDeclaration, beStringent: boolean): boolean {

            // in these cases, we do not attempt to apply a contextual type
            //  RE: isInlineCallLiteral - if the call target is a function literal, we don't want to apply the target type
            //  to its body - instead, it should be applied to its return type
            if (funcDecl.isMethod() ||
                beStringent && funcDecl.returnTypeAnnotation) {
                return false;
            }

            beStringent = beStringent || (this.cachedFunctionInterfaceType === candidateType);

            // At this point, if we're not being stringent, there's no need to check for multiple call sigs
            // or count parameters - we just want to unblock typecheck
            if (!beStringent) {
                return true;
            }

            var signature = this.getSymbolForAST(funcDecl, null).getType().getCallSignatures()[0];
            var parameters = signature.getParameters();
            var paramLen = parameters.length;

            // Check that the argument declarations have no type annotations
            for (var i = 0; i < paramLen; i++) {
                var param = parameters[i];
                var argDecl = <Parameter>this.getASTForSymbol(param);

                // REVIEW: a valid typeExpr is a requirement for varargs,
                // so we may want to revise our invariant
                if (beStringent && argDecl.typeExpr) {
                    return false;
                }
            }

            if (candidateType.getConstructSignatures().length && candidateType.getCallSignatures().length) {
                return false;
            }

            var candidateSigs = candidateType.getConstructSignatures().length ? candidateType.getConstructSignatures() : candidateType.getCallSignatures();

            if (!candidateSigs || candidateSigs.length > 1) {
                return false;
            }

            // if we're here, the contextual type can be applied to the function
            return true;
        }

        public inferArgumentTypesForSignature(signature: PullSignatureSymbol,
            args: ASTList,
            comparisonInfo: TypeComparisonInfo,
            enclosingDecl: PullDecl,
            context: PullTypeResolutionContext): PullTypeSymbol[] {

            var cxt: PullContextualTypeContext = null;
            var hadProvisionalErrors = false;

            var argSym: PullSymbol;

            var parameters = signature.getParameters();
            var typeParameters = signature.getTypeParameters();
            var argContext = new ArgumentInferenceContext();

            var parameterType: PullTypeSymbol = null;

            // seed each type parameter with the undefined type, so that we can widen it to 'any'
            // if no inferences can be made
            for (var i = 0; i < typeParameters.length; i++) {
                argContext.addCandidateForInference(typeParameters[i], null, false);
            }

            var substitutions: any;
            var inferenceCandidates: PullTypeSymbol[];
            var inferenceCandidate: PullTypeSymbol;

            for (var i = 0; i < args.members.length; i++) {

                if (i >= parameters.length) {
                    break;
                }

                parameterType = parameters[i].getType();

                // account for varargs
                if (signature.hasVariableParamList() && (i >= signature.getNonOptionalParameterCount() - 1) && parameterType.isArray()) {
                    parameterType = parameterType.getElementType();
                }

                inferenceCandidates = argContext.getInferenceCandidates();
                substitutions = {};

                if (inferenceCandidates.length) {
                    for (var j = 0; j < inferenceCandidates.length; j++) {

                        inferenceCandidate = inferenceCandidates[j];

                        substitutions = inferenceCandidates[j];

                        context.pushContextualType(parameterType, true, substitutions);

                        argSym = this.resolveStatementOrExpression(args.members[i], true, enclosingDecl, context);

                        this.relateTypeToTypeParameters(argSym.getType(), parameterType, false, argContext, enclosingDecl, context);

                        cxt = context.popContextualType();

                        argSym.invalidate();

                        hadProvisionalErrors = cxt.hadProvisionalErrors();
                    }
                }
                else {
                    context.pushContextualType(parameterType, true, {});
                    argSym = this.resolveStatementOrExpression(args.members[i], true, enclosingDecl, context);

                    this.relateTypeToTypeParameters(argSym.getType(), parameterType, false, argContext, enclosingDecl, context);

                    cxt = context.popContextualType();

                    argSym.invalidate();

                    hadProvisionalErrors = cxt.hadProvisionalErrors();
                }
            }

            hadProvisionalErrors = false;

            var inferenceResults = argContext.inferArgumentTypes(this, context);


            if (inferenceResults.unfit) {
                return null;
            }

            var resultTypes: PullTypeSymbol[] = [];

            // match inferred types in-order to type parameters
            for (var i = 0; i < typeParameters.length; i++) {
                for (var j = 0; j < inferenceResults.results.length; j++) {
                    if (inferenceResults.results[j].param == typeParameters[i]) {
                        resultTypes[resultTypes.length] = inferenceResults.results[j].type;
                        break;
                    }
                }
            }

            if (!args.members.length && !resultTypes.length && typeParameters.length) {
                for (var i = 0; i < typeParameters.length; i++) {
                    resultTypes[resultTypes.length] = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            return resultTypes;
        }

        public relateTypeToTypeParameters(expressionType: PullTypeSymbol,
            parameterType: PullTypeSymbol,
            shouldFix: boolean,
            argContext: ArgumentInferenceContext,
            enclosingDecl: PullDecl,
            context: PullTypeResolutionContext): void {

            if (expressionType.isError()) {
                expressionType = this.semanticInfoChain.anyTypeSymbol;
            }

            if (parameterType === expressionType) {
                return;
            }

            if (parameterType.isTypeParameter()) {
                argContext.addCandidateForInference(<PullTypeParameterSymbol>parameterType, expressionType, shouldFix);
                return;
            }
            var parameterDeclarations = parameterType.getDeclarations();
            var expressionDeclarations = expressionType.getDeclarations();
            if (!parameterType.isArray() && parameterDeclarations.length && expressionDeclarations.length && parameterDeclarations[0].isEqual(expressionDeclarations[0]) && expressionType.isGeneric()) {
                var typeParameters: PullTypeSymbol[] = parameterType.getTypeParameters();
                var typeArguments: PullTypeSymbol[] = expressionType.getTypeArguments();

                // If we're relating an out-of-order resolution of a function call within the body
                // of a generic type's method, the relationship will actually be in reverse.
                if (!typeArguments) {
                    typeParameters = parameterType.getTypeArguments();
                    typeArguments = expressionType.getTypeParameters();
                }

                if (typeParameters && typeArguments && typeParameters.length === typeArguments.length) {
                    for (var i = 0; i < typeParameters.length; i++) {
                        if (typeArguments[i] != typeParameters[i]) {
                            // relate and fix
                            this.relateTypeToTypeParameters(typeArguments[i], typeParameters[i], true, argContext, enclosingDecl, context);
                        }
                    }
                }
            }

            // if the expression and parameter type, with type arguments of 'any', are not assignment compatible, ignore
            var anyExpressionType = this.specializeTypeToAny(expressionType, enclosingDecl, context);
            var anyParameterType = this.specializeTypeToAny(parameterType, enclosingDecl, context);

            if (!this.sourceIsAssignableToTarget(anyExpressionType, anyParameterType, context)) {
                return;
            }

            if (expressionType.isArray() && parameterType.isArray()) {
                this.relateArrayTypeToTypeParameters(expressionType, parameterType, shouldFix, argContext, enclosingDecl, context);

                return;
            }

            this.relateObjectTypeToTypeParameters(expressionType, parameterType, shouldFix, argContext, enclosingDecl, context);
        }

        public relateFunctionSignatureToTypeParameters(expressionSignature: PullSignatureSymbol,
            parameterSignature: PullSignatureSymbol,
            argContext: ArgumentInferenceContext,
            enclosingDecl: PullDecl,
            context: PullTypeResolutionContext): void {
            // Sub in 'any' for type parameters

            var anyExpressionSignature = this.specializeSignatureToAny(expressionSignature, enclosingDecl, context);
            var anyParamExpressionSignature = this.specializeSignatureToAny(parameterSignature, enclosingDecl, context);

            if (!this.signatureIsAssignableToTarget(anyExpressionSignature, anyParamExpressionSignature, context)) {
                return;
            }

            var expressionParams = expressionSignature.getParameters();
            var expressionReturnType = expressionSignature.getReturnType();

            var parameterParams = parameterSignature.getParameters();
            var parameterReturnType = parameterSignature.getReturnType();

            var len = parameterParams.length < expressionParams.length ? parameterParams.length : expressionParams.length;

            for (var i = 0; i < len; i++) {
                this.relateTypeToTypeParameters(expressionParams[i].getType(), parameterParams[i].getType(), true, argContext, enclosingDecl, context);
            }

            this.relateTypeToTypeParameters(expressionReturnType, parameterReturnType, true, argContext, enclosingDecl, context);
        }

        public relateObjectTypeToTypeParameters(objectType: PullTypeSymbol,
            parameterType: PullTypeSymbol,
            shouldFix: boolean,
            argContext: ArgumentInferenceContext,
            enclosingDecl: PullDecl,
            context: PullTypeResolutionContext): void {

            var parameterTypeMembers = parameterType.getMembers();
            var parameterSignatures: PullSignatureSymbol[];
            var parameterSignature: PullSignatureSymbol;

            var objectMember: PullSymbol;
            var objectSignatures: PullSignatureSymbol[];


            if (argContext.alreadyRelatingTypes(objectType, parameterType)) {
                return;
            }

            var objectTypeArguments = objectType.getTypeArguments();
            var parameterTypeParameters = parameterType.getTypeParameters();

            if (objectTypeArguments && (objectTypeArguments.length === parameterTypeParameters.length)) {
                for (var i = 0; i < objectTypeArguments.length; i++) {
                    // PULLREVIEW: This may lead to duplicate inferences for type argument parameters, if the two are the same
                    // (which could occur via mutually recursive method calls within a generic class declaration)
                    argContext.addCandidateForInference(parameterTypeParameters[i], objectTypeArguments[i], shouldFix);
                }
            }

            for (var i = 0; i < parameterTypeMembers.length; i++) {
                objectMember = objectType.findMember(parameterTypeMembers[i].getName());

                if (objectMember) {
                    this.relateTypeToTypeParameters(objectMember.getType(), parameterTypeMembers[i].getType(), shouldFix, argContext, enclosingDecl, context);
                }
            }

            parameterSignatures = parameterType.getCallSignatures();
            objectSignatures = objectType.getCallSignatures();

            for (var i = 0; i < parameterSignatures.length; i++) {
                parameterSignature = parameterSignatures[i];

                for (var j = 0; j < objectSignatures.length; j++) {
                    this.relateFunctionSignatureToTypeParameters(objectSignatures[j], parameterSignature, argContext, enclosingDecl, context);
                }
            }

            parameterSignatures = parameterType.getConstructSignatures();
            objectSignatures = objectType.getConstructSignatures();

            for (var i = 0; i < parameterSignatures.length; i++) {
                parameterSignature = parameterSignatures[i];

                for (var j = 0; j < objectSignatures.length; j++) {
                    this.relateFunctionSignatureToTypeParameters(objectSignatures[j], parameterSignature, argContext, enclosingDecl, context);
                }
            }

            parameterSignatures = parameterType.getIndexSignatures();
            objectSignatures = objectType.getIndexSignatures();

            for (var i = 0; i < parameterSignatures.length; i++) {
                parameterSignature = parameterSignatures[i];

                for (var j = 0; j < objectSignatures.length; j++) {
                    this.relateFunctionSignatureToTypeParameters(objectSignatures[j], parameterSignature, argContext, enclosingDecl, context);
                }
            }
        }

        public relateArrayTypeToTypeParameters(argArrayType: PullTypeSymbol,
            parameterArrayType: PullTypeSymbol,
            shouldFix: boolean,
            argContext: ArgumentInferenceContext,
            enclosingDecl: PullDecl,
            context: PullTypeResolutionContext): void {

            var argElement = argArrayType.getElementType();
            var paramElement = parameterArrayType.getElementType();

            this.relateTypeToTypeParameters(argElement, paramElement, shouldFix, argContext, enclosingDecl, context);
        }

        public specializeTypeToAny(typeToSpecialize: PullTypeSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol {
            var prevSpecialize = context.specializingToAny;

            context.specializingToAny = true;

            // get the "root" unspecialized type, since even generic types may already be partially specialize
            //typeToSpecialize = <PullTypeSymbol>typeToSpecialize.getDeclarations()[0].getSymbol().getType();

            var type = specializeType(typeToSpecialize, [], this, enclosingDecl, context);

            context.specializingToAny = prevSpecialize;

            return type;
        }

        public specializeSignatureToAny(signatureToSpecialize: PullSignatureSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSignatureSymbol {
            var typeParameters = signatureToSpecialize.getTypeParameters();
            var typeReplacementMap: any = {};
            var typeArguments: PullTypeSymbol[] = []; // PULLTODO - may be expensive, but easy to cache

            for (var i = 0; i < typeParameters.length; i++) {
                typeArguments[i] = this.semanticInfoChain.anyTypeSymbol;
                typeReplacementMap[typeParameters[i].getSymbolID().toString()] = typeArguments[i];
            }
            if (!typeArguments.length) {
                typeArguments[0] = this.semanticInfoChain.anyTypeSymbol;
            }


            var prevSpecialize = context.specializingToAny;

            context.specializingToAny = true;
            // no need to worry about returning 'null', since 'any' satisfies all constraints
            var sig = specializeSignature(signatureToSpecialize, false, typeReplacementMap, typeArguments, this, enclosingDecl, context);
            context.specializingToAny = prevSpecialize;

            return sig;
        }
    }
}