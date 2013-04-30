// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='..\typescript.ts' />

module TypeScript {
    export var globalBindingPhase = 0;

    export class PullSymbolBinder {
        private parentChain: PullTypeSymbol[] = [];
        private parentDeclChain: PullDecl[] = [];
        private declPath: string[] = [];

        private bindingPhase = globalBindingPhase++;

        private staticClassMembers: PullSymbol[] = [];

        private functionTypeParameterCache: any = new BlockIntrinsics();

        private findTypeParameterInCache(name: string) {
            return <PullTypeParameterSymbol>this.functionTypeParameterCache[name];
        }

        private addTypeParameterToCache(typeParameter: PullTypeParameterSymbol) {
            this.functionTypeParameterCache[typeParameter.getName()] = typeParameter;
        }

        private resetTypeParameterCache() {
            this.functionTypeParameterCache = new BlockIntrinsics();
        }

        public semanticInfo: SemanticInfo;

        public reBindingAfterChange = false;
        public startingDeclForRebind = pullDeclID; // note that this gets set on creation
        public startingSymbolForRebind = pullSymbolID; // note that this gets set on creation

        constructor(private compilationSettings: CompilationSettings,
                    public semanticInfoChain: SemanticInfoChain) {
        }

        public setUnit(fileName: string) {
            this.semanticInfo = this.semanticInfoChain.getUnit(fileName);
        }

        public getParent(returnInstanceType = false): PullTypeSymbol {
            var parent = this.parentChain ? this.parentChain[this.parentChain.length - 1] : null;

            if (parent && parent.isContainer() && returnInstanceType) {
                var instanceSymbol = (<PullContainerTypeSymbol>parent).getInstanceSymbol();

                if (instanceSymbol) {
                    parent = instanceSymbol.getType();
                }
            }

            return parent;
        }

        public getParentDecl(): PullDecl {
            return this.parentDeclChain.length ? this.parentDeclChain[this.parentDeclChain.length - 1] : null;
        }

        public getDeclPath() { return this.declPath; }

        public pushParent(parentType: PullTypeSymbol, parentDecl: PullDecl) {
            if (parentType) {
                this.parentChain[this.parentChain.length] = parentType;
                this.parentDeclChain[this.parentDeclChain.length] = parentDecl;
                this.declPath[this.declPath.length] = parentType.getName();
            }
        }

        public popParent() {
            if (this.parentChain.length) {
                this.parentChain.length--;
                this.parentDeclChain.length--;
                this.declPath.length--;
            }
        }

        public findSymbolInContext(name: string, declKind: PullElementKind, typeLookupPath: string[]): PullSymbol {
            var startTime = new Date().getTime();
            var contextSymbolPath: string[] = this.getDeclPath();
            var nestedSymbolPath: string[] = [];
            var copyOfContextSymbolPath = [];
            var symbol: PullSymbol = null;

            var endTime = 0;

            // first, search within the given symbol path
            if (typeLookupPath.length) {

                for (var i = 0; i < typeLookupPath.length; i++) {
                    nestedSymbolPath[nestedSymbolPath.length] = typeLookupPath[i];
                }

                nestedSymbolPath[nestedSymbolPath.length] = name;

                while (nestedSymbolPath.length >= 2) {
                    symbol = this.semanticInfoChain.findSymbol(nestedSymbolPath, declKind);

                    if (symbol) {
                        endTime = new Date().getTime();
                        time_in_findSymbol += endTime - startTime;

                        return symbol;
                    }
                    nestedSymbolPath.length -= 2;
                    nestedSymbolPath[nestedSymbolPath.length] = name;
                }
            }

            // next, link back up to the enclosing context
            if (contextSymbolPath.length) {

                for (var i = 0; i < contextSymbolPath.length; i++) {
                    copyOfContextSymbolPath[copyOfContextSymbolPath.length] = contextSymbolPath[i];
                }

                for (var i = 0; i < typeLookupPath.length; i++) {
                    copyOfContextSymbolPath[copyOfContextSymbolPath.length] = typeLookupPath[i];
                }

                copyOfContextSymbolPath[copyOfContextSymbolPath.length] = name;

                while (copyOfContextSymbolPath.length >= 2) {
                    symbol = this.semanticInfoChain.findSymbol(copyOfContextSymbolPath, declKind);

                    if (symbol) {
                        endTime = new Date().getTime();
                        time_in_findSymbol += endTime - startTime;

                        return symbol;
                    }
                    copyOfContextSymbolPath.length -= 2;
                    copyOfContextSymbolPath[copyOfContextSymbolPath.length] = name;
                }
            }

            // finally, try searching globally
            symbol = this.semanticInfoChain.findSymbol([name], declKind);

            endTime = new Date().getTime();
            time_in_findSymbol += endTime - startTime;

            return symbol;
        }

        public symbolIsRedeclaration(sym: PullSymbol): boolean {
            var symID = sym.getSymbolID();
            return (symID > this.startingSymbolForRebind) ||
                    ((sym.getRebindingID() === this.bindingPhase) && (symID !== this.startingSymbolForRebind));
        }

        //
        // decl binding
        //

        public bindModuleDeclarationToPullSymbol(moduleContainerDecl: PullDecl) {

            // 1. Test for existing decl - if it exists, use its symbol
            // 2. If no other decl exists, create a new symbol and use that one

            var modName = moduleContainerDecl.getName();

            var moduleContainerTypeSymbol: PullContainerTypeSymbol = null;
            var moduleInstanceSymbol: PullSymbol = null;
            var moduleInstanceTypeSymbol: PullTypeSymbol = null;

            var moduleInstanceDecl: PullDecl = moduleContainerDecl.getValueDecl();

            var moduleKind = moduleContainerDecl.getKind();

            var parent = this.getParent();
            var parentInstanceSymbol = this.getParent(true);
            var moduleAST = <ModuleDeclaration>this.semanticInfo.getASTForDecl(moduleContainerDecl);

            var isExported = moduleContainerDecl.getFlags() & PullElementFlags.Exported;

            var createdNewSymbol = false;

            if (parent) {
                if (isExported) {
                    moduleContainerTypeSymbol = <PullContainerTypeSymbol>parent.findNestedType(modName, PullElementKind.SomeType);
                }
                else {
                    moduleContainerTypeSymbol = <PullContainerTypeSymbol>parent.findContainedMember(modName);
                }
            }
            else if (!isExported || moduleContainerDecl.getKind() === PullElementKind.DynamicModule) {
                moduleContainerTypeSymbol = <PullContainerTypeSymbol>this.findSymbolInContext(modName, PullElementKind.SomeType, []);
            }

            if (moduleContainerTypeSymbol && moduleContainerTypeSymbol.getKind() !== moduleKind) {
                // duplicate symbol error
                moduleContainerDecl.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), moduleAST.minChar, moduleAST.getLength(), "Duplicate identifier '{0}'.", [moduleContainerDecl.getDisplayName()]));

                moduleContainerTypeSymbol = null;
            }

            if (moduleContainerTypeSymbol) {
                moduleInstanceSymbol = moduleContainerTypeSymbol.getInstanceSymbol();
            }
            else { 
                moduleContainerTypeSymbol = new PullContainerTypeSymbol(modName, moduleKind);
                createdNewSymbol = true;
            }

            if (!moduleInstanceSymbol && (moduleContainerDecl.getFlags() & PullElementFlags.SomeInitializedModule)) {
                moduleInstanceTypeSymbol = new PullTypeSymbol(modName, PullElementKind.ObjectType);
                moduleInstanceTypeSymbol.addDeclaration(moduleContainerDecl);

                moduleInstanceTypeSymbol.setAssociatedContainerType(moduleContainerTypeSymbol);

                // The instance symbol is further set up in bindVariableDeclaration
                // (We add the declaration there, invalidate previous decls on edit and add the instance symbol to the parent)
                moduleInstanceSymbol = new PullSymbol(modName, PullElementKind.Variable);
                moduleInstanceSymbol.setType(moduleInstanceTypeSymbol);

                moduleContainerTypeSymbol.setInstanceSymbol(moduleInstanceSymbol);
            }

            moduleContainerTypeSymbol.addDeclaration(moduleContainerDecl);
            moduleContainerDecl.setSymbol(moduleContainerTypeSymbol);

            this.semanticInfo.setSymbolForAST(moduleAST.name, moduleContainerTypeSymbol);
            this.semanticInfo.setSymbolForAST(moduleAST, moduleContainerTypeSymbol);

            if (createdNewSymbol) {

                if (parent) {
                    var linkKind = moduleContainerDecl.getFlags() & PullElementFlags.Exported ? SymbolLinkKind.PublicMember : SymbolLinkKind.PrivateMember;

                    if (linkKind === SymbolLinkKind.PublicMember) {
                        parent.addMember(moduleContainerTypeSymbol, linkKind);
                    }
                    else {
                        moduleContainerTypeSymbol.setContainer(parent);
                    }
                }
            }
            else if (this.reBindingAfterChange) {
                // clear out the old decls...
                var decls = moduleContainerTypeSymbol.getDeclarations();
                var scriptName = moduleContainerDecl.getScriptName();

                for (var i = 0; i < decls.length; i++) {
                    if (decls[i].getScriptName() === scriptName && decls[i].getDeclID() < this.startingDeclForRebind) {
                        moduleContainerTypeSymbol.removeDeclaration(decls[i]);
                    }
                }

                moduleContainerTypeSymbol.invalidate();
            }

            this.pushParent(moduleContainerTypeSymbol, moduleContainerDecl);

            var childDecls = moduleContainerDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.popParent();
        }

        // aliases
        public bindImportDeclaration(importDeclaration: PullDecl) {
            var declFlags = importDeclaration.getFlags();
            var declKind = importDeclaration.getKind();
            var importDeclAST = <VariableDeclarator>this.semanticInfo.getASTForDecl(importDeclaration);

            var isExported = false;
            var linkKind = SymbolLinkKind.PrivateMember;
            var importSymbol: PullTypeAliasSymbol = null;
            var declName = importDeclaration.getName();
            var parentHadSymbol = false;
            var parent = this.getParent();

            if (parent) {
                importSymbol = <PullTypeAliasSymbol>parent.findMember(declName, false);

                if (!importSymbol) {
                    importSymbol = <PullTypeAliasSymbol>parent.findContainedMember(declName);

                    if (importSymbol) {
                        var declarations = importSymbol.getDeclarations();

                        if (declarations.length) {
                            var importSymbolParent = declarations[0].getParentDecl();

                            if ((importSymbolParent !== importDeclaration.getParentDecl()) && (!this.reBindingAfterChange || (importSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                                importSymbol = null;
                            }
                        }
                    }
                }
            }
            else if (!(importDeclaration.getFlags() & PullElementFlags.Exported)) {
                importSymbol = <PullTypeAliasSymbol>this.findSymbolInContext(declName, PullElementKind.SomeType, []);
            }

            if (importSymbol) {
                parentHadSymbol = true;
            }

            if (importSymbol && this.symbolIsRedeclaration(importSymbol)) {
                importDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), importDeclAST.minChar, importDeclAST.getLength(), "Duplicate identifier '{0}'.", [importDeclaration.getDisplayName()]));
                importSymbol = null;
            }

            if (this.reBindingAfterChange && importSymbol) {

                // prune out-of-date decls...
                var decls = importSymbol.getDeclarations();
                var scriptName = importDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        importSymbol.removeDeclaration(decls[j]);
                    }
                }

                importSymbol.setUnresolved();
            }

            if (!importSymbol) {
                importSymbol = new PullTypeAliasSymbol(declName);
            }

            importSymbol.addDeclaration(importDeclaration);
            importDeclaration.setSymbol(importSymbol);

            this.semanticInfo.setSymbolForAST(importDeclAST, importSymbol);

            if (parent && !parentHadSymbol) {

                if (declFlags & PullElementFlags.Exported) {
                    parent.addMember(importSymbol, SymbolLinkKind.PublicMember);
                }
                else {
                    importSymbol.setContainer(parent);
                }
            }

            importSymbol.setIsBound(this.bindingPhase);
        }

        // enums
        public bindEnumDeclarationToPullSymbol(enumDeclaration: PullDecl) {
            // 1. Test for existing decl - if it exists, use its symbol
            // 2. If no other decl exists, create a new symbol and use that one
            var enumName = enumDeclaration.getName();
            var enumSymbol = <PullTypeSymbol>this.findSymbolInContext(enumName, PullElementKind.Enum, []);

            var enumAST = <ModuleDeclaration>this.semanticInfo.getASTForDecl(enumDeclaration);
            var createdNewSymbol = false;
            var parent = this.getParent();

            if (parent) {
                enumSymbol = parent.findNestedType(enumName);
            }
            else if (!(enumDeclaration.getFlags() & PullElementFlags.Exported)) {
                enumSymbol = <PullTypeSymbol>this.findSymbolInContext(enumName, PullElementKind.SomeType, []);
            }

            if (enumSymbol && (enumSymbol.getKind() !== PullElementKind.Enum || !this.reBindingAfterChange || this.symbolIsRedeclaration(enumSymbol))) {
                enumDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), enumAST.minChar, enumAST.getLength(), "Duplicate identifier '{0}'.", [enumDeclaration.getDisplayName()]));
                enumSymbol = null;
            }

            if (!enumSymbol) {
                enumSymbol = new PullTypeSymbol(enumName, PullElementKind.Enum);

                enumSymbol.addDeclaration(enumDeclaration);
                enumDeclaration.setSymbol(enumSymbol);

                createdNewSymbol = true;
            }

            enumSymbol.addDeclaration(enumDeclaration);
            enumDeclaration.setSymbol(enumSymbol);

            this.semanticInfo.setSymbolForAST(enumAST.name, enumSymbol);
            this.semanticInfo.setSymbolForAST(enumAST, enumSymbol);

            if (createdNewSymbol) {

                if (parent) {
                    var linkKind = enumDeclaration.getFlags() & PullElementFlags.Exported ? SymbolLinkKind.PublicMember : SymbolLinkKind.PrivateMember;

                    if (linkKind === SymbolLinkKind.PublicMember) {
                        parent.addMember(enumSymbol, linkKind);
                    }
                    else {
                        enumSymbol.setContainer(parent);
                    }
                }
            }
            else if (this.reBindingAfterChange) {
                // clear out the old decls...
                var decls = enumSymbol.getDeclarations();
                var scriptName = enumDeclaration.getScriptName();

                for (var i = 0; i < decls.length; i++) {
                    if (decls[i].getScriptName() === scriptName && decls[i].getDeclID() < this.startingDeclForRebind) {
                        enumSymbol.removeDeclaration(decls[i]);
                    }
                }

                enumSymbol.invalidate();
            }

            this.pushParent(enumSymbol, enumDeclaration);

            var childDecls = enumDeclaration.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.popParent();

            enumSymbol.setIsBound(this.bindingPhase);
        }

        private cleanInterfaceSignatures(interfaceSymbol: PullTypeSymbol) {
            var callSigs = interfaceSymbol.getCallSignatures();
            var constructSigs = interfaceSymbol.getConstructSignatures();
            var indexSigs = interfaceSymbol.getIndexSignatures();

            for (var i = 0; i < callSigs.length; i++) {
                if (callSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    interfaceSymbol.removeCallSignature(callSigs[i], false);
                }
            }
            for (var i = 0; i < constructSigs.length; i++) {
                if (constructSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    interfaceSymbol.removeConstructSignature(constructSigs[i], false);
                }
            }
            for (var i = 0; i < indexSigs.length; i++) {
                if (indexSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    interfaceSymbol.removeIndexSignature(indexSigs[i], false);
                }
            }

            interfaceSymbol.recomputeCallSignatures();
            interfaceSymbol.recomputeConstructSignatures();
            interfaceSymbol.recomputeIndexSignatures();
        }

        private cleanClassSignatures(classSymbol: PullClassTypeSymbol) {
            var callSigs = classSymbol.getCallSignatures();
            var constructSigs = classSymbol.getConstructSignatures();
            var indexSigs = classSymbol.getIndexSignatures();

            for (var i = 0; i < callSigs.length; i++) {
                classSymbol.removeCallSignature(callSigs[i], false);
            }
            for (var i = 0; i < constructSigs.length; i++) {
                classSymbol.removeConstructSignature(constructSigs[i], false);
            }
            for (var i = 0; i < indexSigs.length; i++) {
                classSymbol.removeIndexSignature(indexSigs[i], false);
            }

            classSymbol.recomputeCallSignatures();
            classSymbol.recomputeConstructSignatures();
            classSymbol.recomputeIndexSignatures();

            var constructorSymbol = classSymbol.getConstructorMethod();
            var constructorTypeSymbol = <PullConstructorTypeSymbol>(constructorSymbol ? constructorSymbol.getType() : null);

            if (constructorTypeSymbol) {
                constructSigs = constructorTypeSymbol.getConstructSignatures();

                for (var i = 0; i < constructSigs.length; i++) {
                    constructorTypeSymbol.removeConstructSignature(constructSigs[i], false);
                }

                constructorTypeSymbol.recomputeConstructSignatures();
                constructorTypeSymbol.invalidate();
                constructorSymbol.invalidate();
            }

            // just invalidate this once, so we don't pay the cost of rebuilding caches
            // for each signature removed
            classSymbol.invalidate();            
        }

        // classes
        public bindClassDeclarationToPullSymbol(classDecl: PullDecl) {

            var className = classDecl.getName();
            var classSymbol: PullClassTypeSymbol = null;

            var constructorSymbol: PullSymbol = null;
            var constructorTypeSymbol: PullConstructorTypeSymbol = null;

            var classAST = <ClassDeclaration>this.semanticInfo.getASTForDecl(classDecl);
            var parentHadSymbol = false;

            var parent = this.getParent();
            var cleanedPreviousDecls = false;
            var isExported = classDecl.getFlags() & PullElementFlags.Exported;
            var isGeneric = false;

            if (parent) {
                if (isExported) {
                    classSymbol = <PullClassTypeSymbol>parent.findNestedType(className);

                    if (!classSymbol) {
                        classSymbol = <PullClassTypeSymbol>parent.findMember(className, false);
                    }
                }
                else {
                    classSymbol = <PullClassTypeSymbol>parent.findContainedMember(className);

                    if (classSymbol && classSymbol.getKind() === PullElementKind.Class) {

                        var declarations = classSymbol.getDeclarations();

                        if (declarations.length) {

                            var classSymbolParent = declarations[0].getParentDecl();

                            if ((classSymbolParent !== this.getParentDecl()) && (!this.reBindingAfterChange || (classSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                                classSymbol = null;
                            }
                        }
                    }
                    else {
                        classSymbol = null;
                    }
                }
            }
            else {
                classSymbol = <PullClassTypeSymbol>this.findSymbolInContext(className, PullElementKind.SomeType, []);
            }

            if (classSymbol && (classSymbol.getKind() !== PullElementKind.Class || !this.reBindingAfterChange || this.symbolIsRedeclaration(classSymbol))) {
                classDecl.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), classAST.minChar, classAST.getLength(), "Duplicate identifier '{0}'.", [classDecl.getDisplayName()]));
                classSymbol = null;
            }
            else if (classSymbol) {
                parentHadSymbol = true;
            }

            var decls: PullDecl[];

            if (this.reBindingAfterChange && classSymbol) {

                // prune out-of-date decls
                decls = classSymbol.getDeclarations();
                var scriptName = classDecl.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        classSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                constructorSymbol = classSymbol.getConstructorMethod();
                constructorTypeSymbol = <PullConstructorTypeSymbol>constructorSymbol.getType();

                decls = constructorSymbol.getDeclarations();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        constructorSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (constructorSymbol.getIsSynthesized()) {
                    classSymbol.setConstructorMethod(null);
                }

                if (classSymbol.isGeneric()) {
                    //classSymbol.invalidateSpecializations();
                    isGeneric = true;

                    var specializations = classSymbol.getKnownSpecializations();
                    var specialization: PullTypeSymbol = null;

                    for (var i = 0; i < specializations.length; i++) {
                        specialization = specializations[i];

                        decls = specialization.getDeclarations();

                        for (var j = 0; j < decls.length; j++) {
                            if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                                specialization.removeDeclaration(decls[j]);

                                cleanedPreviousDecls = true;
                            }
                        }

                        specialization.addDeclaration(classDecl);
                        specialization.setUnresolved();
                    }

                    classSymbol.cleanTypeParameters();
                    constructorTypeSymbol.cleanTypeParameters();
                }

                classSymbol.setUnresolved();
                constructorSymbol.setUnresolved();
                constructorTypeSymbol.setUnresolved();
            }

            if (!parentHadSymbol) {
                classSymbol = new PullClassTypeSymbol(className);
            }

            classSymbol.addDeclaration(classDecl);

            classDecl.setSymbol(classSymbol);

            this.semanticInfo.setSymbolForAST(classAST.name, classSymbol);
            this.semanticInfo.setSymbolForAST(classAST, classSymbol);

            if (parent && !parentHadSymbol) {
                var linkKind = classDecl.getFlags() & PullElementFlags.Exported ? SymbolLinkKind.PublicMember : SymbolLinkKind.PrivateMember;

                if (linkKind === SymbolLinkKind.PublicMember) {
                    parent.addMember(classSymbol, linkKind);
                }
                else {
                    classSymbol.setContainer(parent);
                }
            }

            // PULLTODO: For now, remove stale signatures from the function type, but we want to be smarter about this when
            // incremental parsing comes online
            // PULLTODO: For now, classes should have none of these, though a pre-existing constructor might
            if (parentHadSymbol && cleanedPreviousDecls) {

                this.cleanClassSignatures(classSymbol);

                if (isGeneric) {
                    specializations = classSymbol.getKnownSpecializations();

                    for (var i = 0; i < specializations.length; i++) {
                        this.cleanClassSignatures(<PullClassTypeSymbol>specializations[i]);
                    }                 
                }
            }

            this.pushParent(classSymbol, classDecl);

            var childDecls = classDecl.getChildDecls();

            this.resetTypeParameterCache();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.resetTypeParameterCache();

            this.popParent();

            // create the default constructor symbol, if necessary

            // even if we've already tried to set these, we want to try again after we've walked the class members
            constructorSymbol = classSymbol.getConstructorMethod();
            constructorTypeSymbol = <PullConstructorTypeSymbol>(constructorSymbol ? constructorSymbol.getType() : null);

            if (!constructorSymbol) {
                constructorSymbol = new PullSymbol(className, PullElementKind.ConstructorMethod);
                constructorTypeSymbol = new PullConstructorTypeSymbol();

                constructorSymbol.setIsSynthesized();

                constructorSymbol.setType(constructorTypeSymbol);
                constructorSymbol.addDeclaration(classDecl);
                classSymbol.setConstructorMethod(constructorSymbol);

                constructorTypeSymbol.addDeclaration(classDecl);

                classSymbol.setHasDefaultConstructor();

                if (!classAST.extendsList || !classAST.extendsList.members.length) {
                    var constructorSignature = new PullSignatureSymbol(PullElementKind.ConstructSignature);
                    constructorSignature.setReturnType(classSymbol);
                    constructorTypeSymbol.addConstructSignature(constructorSignature);
                    constructorSignature.addDeclaration(classDecl);
                }

                // set the class decl's AST to the class declaration
                //this.semanticInfo.setASTForDecl(classDecl, classAST);
            }

            constructorTypeSymbol.setAssociatedContainerType(classSymbol);

            // bind statics to the constructor symbol
            if (this.staticClassMembers.length) {
                var member: PullSymbol;
                var isPrivate = false;
                var memberMap: any = new BlockIntrinsics();
                var memberDecl: PullDecl;
                var memberAST: AST;

                for (var i = 0; i < this.staticClassMembers.length; i++) {

                    member = this.staticClassMembers[i];

                    if (memberMap[member.getName()]) {
                        memberDecl = member.getDeclarations()[0];
                        memberAST = this.semanticInfo.getASTForDecl(memberDecl);
                        memberDecl.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), memberAST.minChar, memberAST.getLength(), "Duplicate identifier '{0}'.", [memberDecl.getDisplayName()]));
                    }
                    else {
                        memberMap[member.getName()] = true;
                    }

                    isPrivate = member.hasFlag(PullElementFlags.Private);

                    constructorTypeSymbol.addMember(member, isPrivate ? SymbolLinkKind.PrivateMember : SymbolLinkKind.PublicMember);
                }

                this.staticClassMembers.length = 0;
            }

            var typeParameters = classDecl.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            // PULLREVIEW: Now that we clean type paramters, searching is redundant
            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = classSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    classSymbol.addMember(typeParameter, SymbolLinkKind.TypeParameter);
                    constructorTypeSymbol.addTypeParameter(typeParameter, true);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        classDecl.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            classSymbol.setIsBound(this.bindingPhase);
        }

        // interfaces
        public bindInterfaceDeclarationToPullSymbol(interfaceDecl: PullDecl) {

            // 1. Test for existing decl - if it exists, use its symbol
            // 2. If no other decl exists, create a new symbol and use that one
            var interfaceName = interfaceDecl.getName();
            var interfaceSymbol: PullTypeSymbol = <PullTypeSymbol>this.findSymbolInContext(interfaceName, PullElementKind.SomeType, []);

            var interfaceAST = <TypeDeclaration>this.semanticInfo.getASTForDecl(interfaceDecl);
            var createdNewSymbol = false;
            var parent = this.getParent();

            if (parent) {
                interfaceSymbol = parent.findNestedType(interfaceName);
            }
            else if (!(interfaceDecl.getFlags() & PullElementFlags.Exported)) {
                interfaceSymbol = <PullClassTypeSymbol>this.findSymbolInContext(interfaceName, PullElementKind.SomeType, []);
            }

            if (interfaceSymbol && (interfaceSymbol.getKind() !== PullElementKind.Interface)) {
                interfaceDecl.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), interfaceAST.minChar, interfaceAST.getLength(), "Duplicate identifier '{0}'.", [interfaceDecl.getDisplayName()]));
                interfaceSymbol = null;
            }

            if (!interfaceSymbol) {
                interfaceSymbol = new PullTypeSymbol(interfaceName, PullElementKind.Interface);
                createdNewSymbol = true;
            }

            interfaceSymbol.addDeclaration(interfaceDecl);
            interfaceDecl.setSymbol(interfaceSymbol);

            if (createdNewSymbol) {

                if (parent) {
                    var linkKind = interfaceDecl.getFlags() & PullElementFlags.Exported ? SymbolLinkKind.PublicMember : SymbolLinkKind.PrivateMember;

                    if (linkKind === SymbolLinkKind.PublicMember) {
                        parent.addMember(interfaceSymbol, linkKind);
                    }
                    else {
                        interfaceSymbol.setContainer(parent);
                    }
                }
            }
            else if (this.reBindingAfterChange) {
                // clear out the old decls...
                var decls = interfaceSymbol.getDeclarations();
                var scriptName = interfaceDecl.getScriptName();

                for (var i = 0; i < decls.length; i++) {
                    if (decls[i].getScriptName() === scriptName && decls[i].getDeclID() < this.startingDeclForRebind) {
                        interfaceSymbol.removeDeclaration(decls[i]);
                    }
                }

                if (interfaceSymbol.isGeneric()) {

                    //interfaceSymbol.invalidateSpecializations();

                    var specializations = interfaceSymbol.getKnownSpecializations();
                    var specialization: PullTypeSymbol = null;

                    for (var i = 0; i < specializations.length; i++) {
                        specialization = specializations[i];

                        decls = specialization.getDeclarations();

                        for (var j = 0; j < decls.length; j++) {
                            if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                                specialization.removeDeclaration(decls[j]);
                            }
                        }

                        specialization.addDeclaration(interfaceDecl);
                        this.cleanInterfaceSignatures(specialization);
                    }

                    interfaceSymbol.cleanTypeParameters();
                }

                this.cleanInterfaceSignatures(interfaceSymbol);
                interfaceSymbol.setUnresolved();
            }

            this.pushParent(interfaceSymbol, interfaceDecl);

            var childDecls = interfaceDecl.getChildDecls();

            this.resetTypeParameterCache();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.resetTypeParameterCache();

            this.popParent();

            var typeParameters = interfaceDecl.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            // PULLREVIEW: Now that we clean type paramters, searching is redundant
            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = interfaceSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    interfaceSymbol.addMember(typeParameter, SymbolLinkKind.TypeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        interfaceDecl.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }
        }

        public bindObjectTypeDeclarationToPullSymbol(objectDecl: PullDecl) {
            var objectSymbolAST: AST = this.semanticInfo.getASTForDecl(objectDecl);

            var objectSymbol = new PullTypeSymbol("", PullElementKind.ObjectType);

            objectSymbol.addDeclaration(objectDecl);
            objectDecl.setSymbol(objectSymbol);

            this.semanticInfo.setSymbolForAST(objectSymbolAST, objectSymbol);

            this.pushParent(objectSymbol, objectDecl);

            var childDecls = objectDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.popParent();

            var typeParameters = objectDecl.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = objectSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    objectSymbol.addMember(typeParameter, SymbolLinkKind.TypeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        objectDecl.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

        }

        public bindConstructorTypeDeclarationToPullSymbol(constructorTypeDeclaration: PullDecl) {
            var declKind = constructorTypeDeclaration.getKind();
            var declFlags = constructorTypeDeclaration.getFlags();
            var constructorTypeAST = this.semanticInfo.getASTForDecl(constructorTypeDeclaration);

            // 1. Test for existing decl - if it exists, use its symbol
            // 2. If no other decl exists, create a new symbol and use that one

            var constructorTypeSymbol = new PullConstructorTypeSymbol();

            constructorTypeDeclaration.setSymbol(constructorTypeSymbol);
            constructorTypeSymbol.addDeclaration(constructorTypeDeclaration);
            this.semanticInfo.setSymbolForAST(constructorTypeAST, constructorTypeSymbol);

            var signature = new PullDefinitionSignatureSymbol(PullElementKind.ConstructSignature);

            if ((<FunctionDeclaration>constructorTypeAST).variableArgList) {
                signature.setHasVariableParamList();
            }

            signature.addDeclaration(constructorTypeDeclaration);
            constructorTypeDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(constructorTypeDeclaration), constructorTypeSymbol, signature);

            // add the implicit construct member for this function type
            constructorTypeSymbol.addSignature(signature);

            var typeParameters = constructorTypeDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = constructorTypeSymbol.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    constructorTypeSymbol.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        constructorTypeDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }
        }

        // variables
        public bindVariableDeclarationToPullSymbol(variableDeclaration: PullDecl) {
            var declFlags = variableDeclaration.getFlags();
            var declKind = variableDeclaration.getKind();
            var varDeclAST = <VariableDeclarator>this.semanticInfo.getASTForDecl(variableDeclaration);

            var isExported = (declFlags & PullElementFlags.Exported) !== 0;

            var linkKind = SymbolLinkKind.PrivateMember;

            var variableSymbol: PullSymbol = null;

            var declName = variableDeclaration.getName();

            var parentHadSymbol = false;

            var parent = this.getParent(true);

            var parentDecl = variableDeclaration.getParentDecl();

            var isImplicit = (declFlags & PullElementFlags.ImplicitVariable) !== 0;

            if (parentDecl && !isImplicit) {
                parentDecl.addVariableDeclToGroup(variableDeclaration);
            }

            // The code below accounts for the variable symbol being a type because
            // modules may create instance variables

            if (parent) {
                if (isExported) {
                    variableSymbol = parent.findMember(declName, false);
                }
                else {
                    variableSymbol = parent.findContainedMember(declName);
                }

                if (variableSymbol) {
                    var declarations = variableSymbol.getDeclarations();

                    if (declarations.length) {
                        var variableSymbolParent = declarations[0].getParentDecl();

                        if ((this.getParentDecl() !== variableSymbolParent) && (!this.reBindingAfterChange || (variableSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                            variableSymbol = null;
                        }
                    }
                }
            }
            else if (!(variableDeclaration.getFlags() & PullElementFlags.Exported)) {
                variableSymbol = this.findSymbolInContext(declName, PullElementKind.SomeValue, []);
            }

            if (variableSymbol && !variableSymbol.isType()) {
                parentHadSymbol = true;
            }

            var span: TextSpan;
            var decl: PullDecl;
            var decls: PullDecl[];
            var ast: AST;
            var members: PullSymbol[];

            // PULLTODO: Keeping these two error clauses separate for now, so that we can add a better error message later
            if (variableSymbol && this.symbolIsRedeclaration(variableSymbol)) {
                // if it's an implicit variable, then this variable symbol will actually be a class constructor
                // or container type that was just defined, so we don't want to raise an error
                if (!isImplicit || (!variableSymbol.hasFlag(PullElementFlags.ImplicitVariable) && (variableSymbol.getKind() !== declKind))) {
                    span = variableDeclaration.getSpan();

                    if (!parent || variableSymbol.getIsSynthesized()) {
                        variableDeclaration.addDiagnostic(new Diagnostic(this.semanticInfo.getPath(), span.start(), span.length(), "Duplicate identifier '{0}'.", [variableDeclaration.getDisplayName()]));
                    }

                    variableSymbol = null;
                    parentHadSymbol = false;
                }
            }
            else if (variableSymbol && (variableSymbol.getKind() !== PullElementKind.Variable) && !isImplicit) {
                span = variableDeclaration.getSpan();

                variableDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), span.start(), span.length(), "Duplicate identifier '{0}'.", [variableDeclaration.getDisplayName()]));
                variableSymbol = null;
                parentHadSymbol = false;
            }

            if (this.reBindingAfterChange && variableSymbol && !variableSymbol.isType()) {

                // prune out-of-date decls...
                decls = variableSymbol.getDeclarations();
                var scriptName = variableDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        variableSymbol.removeDeclaration(decls[j]);
                    }
                }

                variableSymbol.invalidate();
            }

            var replaceProperty = false;
            var previousProperty: PullSymbol = null;

            if ((declFlags & PullElementFlags.ImplicitVariable) === 0) {
                if (!variableSymbol) {
                    variableSymbol = new PullSymbol(declName, declKind);
                }

                variableSymbol.addDeclaration(variableDeclaration);
                variableDeclaration.setSymbol(variableSymbol);

                this.semanticInfo.setSymbolForAST(varDeclAST.id, variableSymbol);
                this.semanticInfo.setSymbolForAST(varDeclAST, variableSymbol);
            }
            else if (!parentHadSymbol) {

                if ((declFlags & PullElementFlags.ClassConstructorVariable)) {
                    // it's really an implicit class decl, so we need to set the type of the symbol to
                    // the constructor type
                    // Note that we would have already found the class symbol in the search above
                    var classTypeSymbol: PullClassTypeSymbol = <PullClassTypeSymbol>variableSymbol;

                    // PULLTODO: In both this case and the case below, we should have already received the
                    // class or module symbol as the variableSymbol found above
                    if (parent) {
                        members = parent.getMembers();

                        for (var i = 0; i < members.length; i++) {
                            if ((members[i].getName() === declName) && (members[i].getKind() === PullElementKind.Class)) {
                                classTypeSymbol = <PullClassTypeSymbol>members[i];
                                break;
                            }
                        }
                    }

                    if (!classTypeSymbol) {
                        var parentDecl = variableDeclaration.getParentDecl();

                        if (parentDecl) {
                            var childDecls = parentDecl.searchChildDecls(declName, true);

                            if (childDecls.length) {

                                for (var i = 0; i < childDecls.length; i++) {
                                    if (childDecls[i].getValueDecl() === variableDeclaration) {
                                        classTypeSymbol = <PullClassTypeSymbol>childDecls[i].getSymbol();
                                    }
                                }
                            }
                        }

                        if (!classTypeSymbol) {
                            classTypeSymbol = <PullClassTypeSymbol>this.findSymbolInContext(declName, PullElementKind.SomeType, []);
                        }
                    }

                    if (classTypeSymbol && (classTypeSymbol.getKind() !== PullElementKind.Class)) {
                        classTypeSymbol = null;
                    }

                    if (classTypeSymbol && classTypeSymbol.isClass()) { // protect against duplicate declarations
                        replaceProperty = variableSymbol && variableSymbol.getIsSynthesized();

                        if (replaceProperty) {
                            previousProperty = variableSymbol;
                        }

                        variableSymbol = classTypeSymbol.getConstructorMethod();
                        variableDeclaration.setSymbol(variableSymbol);

                        // set the AST to the constructor method's if possible
                        decls = classTypeSymbol.getDeclarations();

                        if (decls.length) {

                            decl = decls[decls.length - 1];
                            ast = this.semanticInfo.getASTForDecl(decl);

                            if (ast) {
                                this.semanticInfo.setASTForDecl(variableDeclaration, ast);
                            }
                        }
                    }
                    else {
                        // PULLTODO: Clodules/Interfaces on classes
                        if (!variableSymbol) {
                            variableSymbol = new PullSymbol(declName, declKind);
                        }

                        variableSymbol.addDeclaration(variableDeclaration);
                        variableDeclaration.setSymbol(variableSymbol);

                        variableSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }
                }
                else if (declFlags & PullElementFlags.SomeInitializedModule) {
                    var moduleContainerTypeSymbol: PullContainerTypeSymbol = null;
                    var moduleParent = this.getParent(false);

                    if (moduleParent) {
                        members = moduleParent.getMembers();

                        for (var i = 0; i < members.length; i++) {
                            if ((members[i].getName() === declName) && (members[i].isContainer())) {
                                moduleContainerTypeSymbol = <PullContainerTypeSymbol>members[i];
                                break;
                            }
                        }
                    }

                    if (!moduleContainerTypeSymbol) {
                        var parentDecl = variableDeclaration.getParentDecl();

                        if (parentDecl) {
                            var childDecls = parentDecl.searchChildDecls(declName, true);

                            if (childDecls.length) {

                                for (var i = 0; i < childDecls.length; i++) {
                                    if (childDecls[i].getValueDecl() === variableDeclaration) {
                                        moduleContainerTypeSymbol = <PullContainerTypeSymbol>childDecls[i].getSymbol();
                                    }
                                }
                            }
                        }
                        if (!moduleContainerTypeSymbol) {
                            moduleContainerTypeSymbol = <PullContainerTypeSymbol>this.findSymbolInContext(declName, PullElementKind.SomeType, []);
                        }
                    }

                    if (moduleContainerTypeSymbol && (!moduleContainerTypeSymbol.isContainer())) {
                        moduleContainerTypeSymbol = null;
                    }

                    if (moduleContainerTypeSymbol) {
                        variableSymbol = moduleContainerTypeSymbol.getInstanceSymbol();

                        variableSymbol.addDeclaration(variableDeclaration);
                        variableDeclaration.setSymbol(variableSymbol);

                        // set the AST to the constructor method's if possible
                        decls = moduleContainerTypeSymbol.getDeclarations();

                        if (decls.length) {

                            decl = decls[decls.length - 1];
                            ast = this.semanticInfo.getASTForDecl(decl);

                            if (ast) {
                                this.semanticInfo.setASTForDecl(variableDeclaration, ast);
                            }
                        }

                        // we added the variable to the parent when binding the module
                        //parentHadSymbol = true;
                    }
                    else {
                        // PULLTODO: Raise an Error here
                        variableSymbol.setType(this.semanticInfoChain.anyTypeSymbol);
                    }
                }
            }
            else {
                variableSymbol.addDeclaration(variableDeclaration);
                variableDeclaration.setSymbol(variableSymbol);
            }

            if (parent && !parentHadSymbol) {

                if (declFlags & PullElementFlags.Exported) {
                    parent.addMember(variableSymbol, SymbolLinkKind.PublicMember);
                }
                else {
                    variableSymbol.setContainer(parent);
                }
            }
            else if (replaceProperty) {
                parent.removeMember(previousProperty);
                parent.addMember(variableSymbol, linkKind);
            }

            variableSymbol.setIsBound(this.bindingPhase);
        }

        // properties
        public bindPropertyDeclarationToPullSymbol(propertyDeclaration: PullDecl) {
            var declFlags = propertyDeclaration.getFlags();
            var declKind = propertyDeclaration.getKind();
            var propDeclAST = <VariableDeclarator>this.semanticInfo.getASTForDecl(propertyDeclaration);

            var isStatic = false;
            var isOptional = false;

            var linkKind = SymbolLinkKind.PublicMember;

            var propertySymbol: PullSymbol = null;

            if (hasFlag(declFlags, PullElementFlags.Static)) {
                isStatic = true;
            }

            if (hasFlag(declFlags, PullElementFlags.Private)) {
                linkKind = SymbolLinkKind.PrivateMember;
            }

            if (hasFlag(declFlags, PullElementFlags.Optional)) {
                isOptional = true;
            }

            var declName = propertyDeclaration.getName();

            var parentHadSymbol = false;

            var parent = this.getParent(true);

            if (parent.isClass() && isStatic) {

                for (var i = 0; i < this.staticClassMembers.length; i++) {
                    if (this.staticClassMembers[i].getName() === declName) {
                        propertySymbol = this.staticClassMembers[i];
                        break;
                    }
                }
            }
            else {
                propertySymbol = parent.findMember(declName, false);
            }

            if (propertySymbol && (!this.reBindingAfterChange || this.symbolIsRedeclaration(propertySymbol))) {

                var span = propertyDeclaration.getSpan();

                propertyDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), span.start(), span.length(), "Duplicate identifier '{0}'.", [propertyDeclaration.getDisplayName()]));

                propertySymbol = null;
            }

            if (propertySymbol) {
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && propertySymbol) {

                // prune out-of-date decls...
                var decls = propertySymbol.getDeclarations();
                var scriptName = propertyDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        propertySymbol.removeDeclaration(decls[j]);
                    }
                }

                propertySymbol.setUnresolved();
            }

            var classTypeSymbol: PullClassTypeSymbol;

            if (!parentHadSymbol) {
                propertySymbol = new PullSymbol(declName, declKind);
            }

            propertySymbol.addDeclaration(propertyDeclaration);
            propertyDeclaration.setSymbol(propertySymbol);

            this.semanticInfo.setSymbolForAST(propDeclAST.id, propertySymbol);
            this.semanticInfo.setSymbolForAST(propDeclAST, propertySymbol);            

            if (isOptional) {
                propertySymbol.setIsOptional();
            }

            if (parent && !parentHadSymbol) {
                if (parent.isClass()) {
                    classTypeSymbol = <PullClassTypeSymbol>parent;

                    if (isStatic) {
                        this.staticClassMembers[this.staticClassMembers.length] = propertySymbol;
                    }
                    else {
                        classTypeSymbol.addMember(propertySymbol, linkKind);
                    }
                }
                else {
                    parent.addMember(propertySymbol, linkKind);
                }
            }

            propertySymbol.setIsBound(this.bindingPhase);
        }

        // parameters
        public bindParameterSymbols(funcDecl: FunctionDeclaration, funcType: PullTypeSymbol, signatureSymbol: PullSignatureSymbol) {
            // create a symbol for each ast
            // if it's a property, add the symbol to the enclosing type's member list
            var parameters: PullSymbol[] = [];
            var decl: PullDecl = null;
            var argDecl: BoundDecl = null;
            var parameterSymbol: PullSymbol = null;
            var isProperty = false;
            var params: any = new BlockIntrinsics();

            if (funcDecl.arguments) {

                for (var i = 0; i < funcDecl.arguments.members.length; i++) {
                    argDecl = <BoundDecl>funcDecl.arguments.members[i];
                    decl = this.semanticInfo.getDeclForAST(argDecl);
                    isProperty = hasFlag(argDecl.getVarFlags(), VariableFlags.Property);
                    parameterSymbol = new PullSymbol(argDecl.id.text, PullElementKind.Parameter);

                    if (funcDecl.variableArgList && i === funcDecl.arguments.members.length - 1) {
                        parameterSymbol.setIsVarArg();
                    }

                    if (decl.getFlags() & PullElementFlags.Optional) {
                        parameterSymbol.setIsOptional();
                    }

                    if (params[argDecl.id.text]) {
                        decl.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), argDecl.minChar, argDecl.getLength(), "Duplicate identifier '{0}'.", [argDecl.id.actualText]));
                    }
                    else {
                        params[argDecl.id.text] = true;
                    }
                    if (decl) {
                        parameterSymbol.addDeclaration(decl);
                        decl.setSymbol(parameterSymbol);

                        var valDecl = decl.getValueDecl();

                        // if this is a parameter property, we still need to set the value decl
                        // for the function parameter
                        if (valDecl) {
                            valDecl.setSymbol(parameterSymbol);
                            parameterSymbol.addDeclaration(valDecl);
                        }
                    }
                    this.semanticInfo.setSymbolForAST(argDecl.id, parameterSymbol);
                    this.semanticInfo.setSymbolForAST(argDecl, parameterSymbol);

                    signatureSymbol.addParameter(parameterSymbol, parameterSymbol.getIsOptional());

                    if (signatureSymbol.isDefinition()) {
                        parameterSymbol.setContainer(funcType);
                    }

                    // PULLREVIEW: Shouldn't need this, since parameters are created off of decl collection
                    // add a member to the parent type
                    //if (decl && isProperty) {
                    //    parameterSymbol = new PullSymbol(argDecl.id.text, PullElementKind.Field);

                    //    parameterSymbol.addDeclaration(decl);
                    //    decl.setPropertySymbol(parameterSymbol);

                    //    var linkKind = (decl.getDeclFlags() & PullElementFlags.Private) ? SymbolLinkKind.PrivateProperty : SymbolLinkKind.PublicProperty;
                    //    var parent = context.getParent(1);
                    //    if (parent.hasBrand()) {
                    //        (<PullClassSymbol>parent).getInstanceType().addMember(parameterSymbol, linkKind);
                    //    }
                    //    else {
                    //        // PULLTODO: I don't think we ever even take this branch...
                    //        parent.addMember(parameterSymbol, linkKind);
                    //    }
                    //}
                }
            }
        }

        // function declarations
        public bindFunctionDeclarationToPullSymbol(functionDeclaration: PullDecl) {
            var declKind = functionDeclaration.getKind();
            var declFlags = functionDeclaration.getFlags();
            var funcDeclAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(functionDeclaration);

            var isExported = (declFlags & PullElementFlags.Exported) !== 0;

            var funcName = functionDeclaration.getName();

            // 1. Test for existing decl - if it exists, use its symbol
            // 2. If no other decl exists, create a new symbol and use that one

            var isSignature: boolean = (declFlags & PullElementFlags.Signature) !== 0;

            var parent = this.getParent(true);
            var parentHadSymbol = false;
            var cleanedPreviousDecls = false;

            // PULLREVIEW: On a re-bind, there's no need to search far-and-wide: just look in the parent's member list
            var functionSymbol: PullSymbol = null;
            var functionTypeSymbol: PullFunctionTypeSymbol = null;

            if (parent) {
                functionSymbol = parent.findMember(funcName, false);

                if (!functionSymbol) {
                    functionSymbol = parent.findContainedMember(funcName);

                    if (functionSymbol) {
                        var declarations = functionSymbol.getDeclarations();

                        if (declarations.length) {
                            var funcSymbolParent = declarations[0].getParentDecl();

                            if ((this.getParentDecl() !== funcSymbolParent) && (!this.reBindingAfterChange || (funcSymbolParent.getDeclID() >= this.startingDeclForRebind))) {
                                functionSymbol = null;
                            }
                        }
                    }
                }
            }
            else if (!(functionDeclaration.getFlags() & PullElementFlags.Exported)) {
                functionSymbol = this.findSymbolInContext(funcName, PullElementKind.SomeValue, []);
            }

            if (functionSymbol && 
                (functionSymbol.getKind() !== PullElementKind.Function ||
                    (this.symbolIsRedeclaration(functionSymbol) && !isSignature && !functionSymbol.allDeclsHaveFlag(PullElementFlags.Signature)))) {
                functionDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), "Duplicate identifier '{0}'.", [functionDeclaration.getDisplayName()]));
                functionSymbol = null;
            }

            if (functionSymbol) {
                functionTypeSymbol = <PullFunctionTypeSymbol>functionSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && functionSymbol) {

                // prune out-of-date decls...
                var decls = functionSymbol.getDeclarations();
                var scriptName = functionDeclaration.getScriptName();
                var isGeneric = functionTypeSymbol.isGeneric();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        functionSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                decls = functionTypeSymbol.getDeclarations();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        functionTypeSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (isGeneric) {
                    var specializations = functionTypeSymbol.getKnownSpecializations();

                    for (var i = 0; i < specializations.length; i++) {
                        decls = specializations[i].getDeclarations();

                        for (var j = 0; j < decls.length; j++) {
                            if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                                specializations[i].removeDeclaration(decls[j]);
                                specializations[i].addDeclaration(functionDeclaration);
                                specializations[i].invalidate();
                                cleanedPreviousDecls = true;
                            }                    
                        }
                    }
                }

                functionSymbol.invalidate();
                functionTypeSymbol.invalidate();
            }

            if (!functionSymbol) {
                // PULLTODO: Make sure that we properly flag signature decl types when collecting decls
                functionSymbol = new PullSymbol(funcName, PullElementKind.Function);
            }

            if (!functionTypeSymbol) {
                functionTypeSymbol = new PullFunctionTypeSymbol();
                functionSymbol.setType(functionTypeSymbol);
            }

            functionDeclaration.setSymbol(functionSymbol);
            functionSymbol.addDeclaration(functionDeclaration);
            functionTypeSymbol.addDeclaration(functionDeclaration);

            this.semanticInfo.setSymbolForAST(funcDeclAST.name, functionSymbol);
            this.semanticInfo.setSymbolForAST(funcDeclAST, functionSymbol);

            if (parent && !parentHadSymbol) {
                if (isExported) {
                    parent.addMember(functionSymbol, SymbolLinkKind.PublicMember);
                }
                else {
                    functionSymbol.setContainer(parent);
                }
            }

            if (!isSignature) {
                this.pushParent(functionTypeSymbol, functionDeclaration);
            }

            // PULLTODO: For now, remove stale signatures from the function type, but we want to be smarter about this when
            // incremental parsing comes online
            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = functionTypeSymbol.getCallSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    functionTypeSymbol.removeCallSignature(callSigs[i], false);
                }

                // just invalidate this once, so we don't pay the cost of rebuilding caches
                // for each signature removed
                functionSymbol.invalidate();
                functionTypeSymbol.invalidate();
                functionTypeSymbol.recomputeCallSignatures();
            }

            var signature = isSignature ? new PullSignatureSymbol(PullElementKind.CallSignature) : new PullDefinitionSignatureSymbol(PullElementKind.CallSignature);

            signature.addDeclaration(functionDeclaration);
            functionDeclaration.setSignatureSymbol(signature);

            if (funcDeclAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(functionDeclaration), functionTypeSymbol, signature);

            var typeParameters = functionDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = signature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    signature.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        functionDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            // add the implicit call member for this function type
            functionTypeSymbol.addSignature(signature);

            if (!isSignature) {
                var childDecls = functionDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            //functionSymbol.setIsBound(this.bindingPhase);
        }

        public bindFunctionExpressionToPullSymbol(functionExpressionDeclaration: PullDecl) {
            var declKind = functionExpressionDeclaration.getKind();
            var declFlags = functionExpressionDeclaration.getFlags();
            var funcExpAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(functionExpressionDeclaration);

            // 1. Test for existing decl - if it exists, use its symbol
            // 2. If no other decl exists, create a new symbol and use that one

            var functionName = declKind == PullElementKind.FunctionExpression ?
                                    (<PullFunctionExpressionDecl>functionExpressionDeclaration).getFunctionExpressionName() :
                                    functionExpressionDeclaration.getName();
            var functionSymbol: PullSymbol = new PullSymbol(functionName, PullElementKind.Function);
            var functionTypeSymbol = new PullFunctionTypeSymbol();

            functionSymbol.setType(functionTypeSymbol);

            functionExpressionDeclaration.setSymbol(functionSymbol);
            functionSymbol.addDeclaration(functionExpressionDeclaration);
            functionTypeSymbol.addDeclaration(functionExpressionDeclaration);

            if (funcExpAST.name) {
                this.semanticInfo.setSymbolForAST(funcExpAST.name, functionSymbol);
            }
            this.semanticInfo.setSymbolForAST(funcExpAST, functionSymbol);

            this.pushParent(functionTypeSymbol, functionExpressionDeclaration);

            var signature = new PullDefinitionSignatureSymbol(PullElementKind.CallSignature);

            if (funcExpAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            var typeParameters = functionExpressionDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = signature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    signature.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        functionExpressionDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            signature.addDeclaration(functionExpressionDeclaration);
            functionExpressionDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(functionExpressionDeclaration), functionTypeSymbol, signature);

            // add the implicit call member for this function type
            functionTypeSymbol.addSignature(signature);

            var childDecls = functionExpressionDeclaration.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }

            this.popParent();
        }

        public bindFunctionTypeDeclarationToPullSymbol(functionTypeDeclaration: PullDecl) {
            var declKind = functionTypeDeclaration.getKind();
            var declFlags = functionTypeDeclaration.getFlags();
            var funcTypeAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(functionTypeDeclaration);

            // 1. Test for existing decl - if it exists, use its symbol
            // 2. If no other decl exists, create a new symbol and use that one

            var functionTypeSymbol = new PullFunctionTypeSymbol();

            functionTypeDeclaration.setSymbol(functionTypeSymbol);
            functionTypeSymbol.addDeclaration(functionTypeDeclaration);
            this.semanticInfo.setSymbolForAST(funcTypeAST, functionTypeSymbol);

            this.pushParent(functionTypeSymbol, functionTypeDeclaration);

            var signature = new PullDefinitionSignatureSymbol(PullElementKind.CallSignature);

            if (funcTypeAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            var typeParameters = functionTypeDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = signature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    signature.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        functionTypeDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            signature.addDeclaration(functionTypeDeclaration);
            functionTypeDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(functionTypeDeclaration), functionTypeSymbol, signature);

            // add the implicit call member for this function type
            functionTypeSymbol.addSignature(signature);

            this.popParent();
        }

        // method declarations
        public bindMethodDeclarationToPullSymbol(methodDeclaration: PullDecl) {
            var declKind = methodDeclaration.getKind();
            var declFlags = methodDeclaration.getFlags();
            var methodAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(methodDeclaration);

            var isPrivate = (declFlags & PullElementFlags.Private) !== 0;
            var isStatic = (declFlags & PullElementFlags.Static) !== 0;
            var isOptional = (declFlags & PullElementFlags.Optional) !== 0;

            var methodName = methodDeclaration.getName();

            var isSignature: boolean = (declFlags & PullElementFlags.Signature) !== 0;

            var parent = this.getParent(true);
            var parentHadSymbol = false;

            var cleanedPreviousDecls = false;

            var methodSymbol: PullSymbol = null;
            var methodTypeSymbol: PullFunctionTypeSymbol = null;

            var linkKind = isPrivate ? SymbolLinkKind.PrivateMember : SymbolLinkKind.PublicMember;

            if (parent.isClass() && isStatic) {

                for (var i = 0; i < this.staticClassMembers.length; i++) {
                    if (this.staticClassMembers[i].getName() === methodName) {
                        methodSymbol = this.staticClassMembers[i];
                        break;
                    }
                }
            }
            else {
                methodSymbol = parent.findMember(methodName, false);
            }

            if (methodSymbol &&
                (methodSymbol.getKind() !== PullElementKind.Method ||
                (this.symbolIsRedeclaration(methodSymbol) && !isSignature && !methodSymbol.allDeclsHaveFlag(PullElementFlags.Signature)))) {
                methodDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), methodAST.minChar, methodAST.getLength(), "Duplicate identifier '{0}'.", [methodDeclaration.getDisplayName()]));
                methodSymbol = null;
            }

            if (methodSymbol) {
                methodTypeSymbol = <PullFunctionTypeSymbol>methodSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && methodSymbol) {

                // prune out-of-date decls...
                var decls = methodSymbol.getDeclarations();
                var scriptName = methodDeclaration.getScriptName();
                var isGeneric = methodTypeSymbol.isGeneric();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        methodSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                decls = methodTypeSymbol.getDeclarations();
                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        methodTypeSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (isGeneric) {
                    var specializations = methodTypeSymbol.getKnownSpecializations();

                    for (var i = 0; i < specializations.length; i++) {
                        decls = specializations[i].getDeclarations();

                        for (var j = 0; j < decls.length; j++) {
                            if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                                specializations[i].removeDeclaration(decls[j]);
                                specializations[i].addDeclaration(methodDeclaration);
                                specializations[i].invalidate();
                                cleanedPreviousDecls = true;
                            }                    
                        }
                    }
                }

                methodSymbol.invalidate();
                methodTypeSymbol.invalidate();
            }

            if (!methodSymbol) {
                // PULLTODO: Make sure that we properly flag signature decl types when collecting decls
                methodSymbol = new PullSymbol(methodName, PullElementKind.Method);
            }

            if (!methodTypeSymbol) {
                methodTypeSymbol = new PullFunctionTypeSymbol();
                methodSymbol.setType(methodTypeSymbol);
            }

            methodDeclaration.setSymbol(methodSymbol);
            methodSymbol.addDeclaration(methodDeclaration);
            methodTypeSymbol.addDeclaration(methodDeclaration);
            this.semanticInfo.setSymbolForAST(methodAST.name, methodSymbol);
            this.semanticInfo.setSymbolForAST(methodAST, methodSymbol);

            if (isOptional) {
                methodSymbol.setIsOptional();
            }

            if (!parentHadSymbol) {

                if (isStatic) {
                    this.staticClassMembers[this.staticClassMembers.length] = methodSymbol;
                }
                else {
                    parent.addMember(methodSymbol, linkKind);
                }
            }

            if (!isSignature) {
                this.pushParent(methodTypeSymbol, methodDeclaration);
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = methodTypeSymbol.getCallSignatures();
                var constructSigs = methodTypeSymbol.getConstructSignatures();
                var indexSigs = methodTypeSymbol.getIndexSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    methodTypeSymbol.removeCallSignature(callSigs[i], false);
                }
                for (var i = 0; i < constructSigs.length; i++) {
                    methodTypeSymbol.removeConstructSignature(constructSigs[i], false);
                }
                for (var i = 0; i < indexSigs.length; i++) {
                    methodTypeSymbol.removeIndexSignature(indexSigs[i], false);
                }

                methodSymbol.invalidate();
                methodTypeSymbol.invalidate();
                methodTypeSymbol.recomputeCallSignatures();
                methodTypeSymbol.recomputeConstructSignatures();
                methodTypeSymbol.recomputeIndexSignatures();
            }

            var sigKind = PullElementKind.CallSignature;

            var signature = isSignature ? new PullSignatureSymbol(sigKind) : new PullDefinitionSignatureSymbol(sigKind);

            if (methodAST.variableArgList) {
                signature.setHasVariableParamList();
            }

            var typeParameters = methodDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;
            var typeParameterName: string;
            var typeParameterAST: TypeParameter;

            for (var i = 0; i < typeParameters.length; i++) {
                typeParameterName = typeParameters[i].getName();
                typeParameterAST = <TypeParameter>this.semanticInfo.getASTForDecl(typeParameters[i]);

                typeParameter = signature.findTypeParameter(typeParameterName);


                if (!typeParameter) {

                    if (!typeParameterAST.constraint) {
                        typeParameter = this.findTypeParameterInCache(typeParameterName);
                    }

                    if (!typeParameter) {
                        typeParameter = new PullTypeParameterSymbol(typeParameterName);

                        if (!typeParameterAST.constraint) {
                            this.addTypeParameterToCache(typeParameter);
                        }
                    }

                    signature.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        typeParameterAST = <TypeParameter>this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        methodDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            signature.addDeclaration(methodDeclaration);
            methodDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(methodDeclaration), methodTypeSymbol, signature);

            // add the implicit call member for this function type
            methodTypeSymbol.addSignature(signature);

            if (!isSignature) {
                var childDecls = methodDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            //methodSymbol.setIsBound(this.bindingPhase);
        }

        // class constructor declarations
        public bindConstructorDeclarationToPullSymbol(constructorDeclaration: PullDecl) {
            var declKind = constructorDeclaration.getKind();
            var declFlags = constructorDeclaration.getFlags();
            var constructorAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(constructorDeclaration);

            var constructorName = constructorDeclaration.getName();

            var isSignature: boolean = (declFlags & PullElementFlags.Signature) !== 0;

            var parent = <PullClassTypeSymbol>this.getParent(true);

            var parentHadSymbol = false;
            var cleanedPreviousDecls = false;

            var constructorSymbol: PullSymbol = parent.getConstructorMethod();
            var constructorTypeSymbol: PullConstructorTypeSymbol = null;

            var linkKind = SymbolLinkKind.ConstructorMethod;

            if (constructorSymbol &&
                (constructorSymbol.getKind() !== PullElementKind.ConstructorMethod ||
                (this.symbolIsRedeclaration(constructorSymbol) && !isSignature && !constructorSymbol.allDeclsHaveFlag(PullElementFlags.Signature)))) {

                constructorDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), constructorAST.minChar, constructorAST.getLength(), "Multiple constructor implementations are not allowed.", null));

                constructorSymbol = null;
            }

            if (constructorSymbol) {

                constructorTypeSymbol = <PullConstructorTypeSymbol>constructorSymbol.getType();

                if (this.reBindingAfterChange) {
                    // prune out-of-date decls...
                    var decls = constructorSymbol.getDeclarations();
                    var scriptName = constructorDeclaration.getScriptName();
                    var isGeneric = constructorTypeSymbol.isGeneric();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            constructorSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }

                    decls = constructorTypeSymbol.getDeclarations();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            constructorTypeSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }

                    if (isGeneric) {
                        var specializations = constructorTypeSymbol.getKnownSpecializations();

                        for (var i = 0; i < specializations.length; i++) {
                            decls = specializations[i].getDeclarations();

                            for (var j = 0; j < decls.length; j++) {
                                if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                                    specializations[i].removeDeclaration(decls[j]);
                                    specializations[i].addDeclaration(constructorDeclaration);
                                    specializations[i].invalidate();
                                    cleanedPreviousDecls = true;
                                }                    
                            }
                        }
                    }                          

                    constructorSymbol.invalidate();
                    constructorTypeSymbol.invalidate();
                }
            }

            if (!constructorSymbol) {
                constructorSymbol = new PullSymbol(constructorName, PullElementKind.ConstructorMethod);
                constructorTypeSymbol = new PullConstructorTypeSymbol();
            }

            // Even if we're reusing the symbol, it would have been cleared by the call to invalidate above
            parent.setConstructorMethod(constructorSymbol);
            constructorSymbol.setType(constructorTypeSymbol);

            constructorDeclaration.setSymbol(constructorSymbol);
            constructorSymbol.addDeclaration(constructorDeclaration);
            constructorTypeSymbol.addDeclaration(constructorDeclaration);
            this.semanticInfo.setSymbolForAST(constructorAST, constructorSymbol);

            if (!isSignature) {
                this.pushParent(constructorTypeSymbol, constructorDeclaration);
            }

            if (parentHadSymbol && cleanedPreviousDecls) {
                var constructSigs = constructorTypeSymbol.getConstructSignatures();

                for (var i = 0; i < constructSigs.length; i++) {
                    constructorTypeSymbol.removeConstructSignature(constructSigs[i]);
                }

                constructorSymbol.invalidate();
                constructorTypeSymbol.invalidate();
                constructorTypeSymbol.recomputeConstructSignatures();
            }

            // add a call signature to the constructor method, and a construct signature to the parent class type
            var constructSignature = isSignature ? new PullSignatureSymbol(PullElementKind.ConstructSignature) : new PullDefinitionSignatureSymbol(PullElementKind.ConstructSignature);

            constructSignature.setReturnType(parent);

            constructSignature.addDeclaration(constructorDeclaration);
            constructorDeclaration.setSignatureSymbol(constructSignature);

            this.bindParameterSymbols(constructorAST, constructorTypeSymbol, constructSignature);

            if (constructorAST.variableArgList) {
                constructSignature.setHasVariableParamList();
            }

            constructorTypeSymbol.addSignature(constructSignature);

            if (!isSignature) {
                var childDecls = constructorDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            //constructorSymbol.setIsBound(this.bindingPhase);
        }

        public bindConstructSignatureDeclarationToPullSymbol(constructSignatureDeclaration: PullDecl) {
            var parent = this.getParent(true);
            var constructorAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(constructSignatureDeclaration);

            var constructSigs = parent.getConstructSignatures();

            for (var i = 0; i < constructSigs.length; i++) {
                if (constructSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    parent.removeConstructSignature(constructSigs[i], false);
                }
            }

            // update the construct signature list
            parent.recomputeConstructSignatures();
            var constructSignature = new PullSignatureSymbol(PullElementKind.ConstructSignature);

            if (constructorAST.variableArgList) {
                constructSignature.setHasVariableParamList();
            }

            var typeParameters = constructSignatureDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = constructSignature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    constructSignature.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        constructSignatureDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            constructSignature.addDeclaration(constructSignatureDeclaration);
            constructSignatureDeclaration.setSignatureSymbol(constructSignature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(constructSignatureDeclaration), null, constructSignature);

            this.semanticInfo.setSymbolForAST(this.semanticInfo.getASTForDecl(constructSignatureDeclaration), constructSignature);

            parent.addConstructSignature(constructSignature);
        }

        public bindCallSignatureDeclarationToPullSymbol(callSignatureDeclaration: PullDecl) {
            var parent = this.getParent(true);
            var callSignatureAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(callSignatureDeclaration);

            // PULLTODO: For now, remove stale signatures from the function type, but we want to be smarter about this when
            // incremental parsing comes online
            var callSigs = parent.getCallSignatures();

            for (var i = 0; i < callSigs.length; i++) {
                if (callSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    parent.removeCallSignature(callSigs[i], false);
                }
            }

            // update the call signature list
            parent.recomputeCallSignatures();

            var callSignature = new PullSignatureSymbol(PullElementKind.CallSignature);

            if (callSignatureAST.variableArgList) {
                callSignature.setHasVariableParamList();
            }

            var typeParameters = callSignatureDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = callSignature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    callSignature.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        callSignatureDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            callSignature.addDeclaration(callSignatureDeclaration);
            callSignatureDeclaration.setSignatureSymbol(callSignature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(callSignatureDeclaration), null, callSignature);

            this.semanticInfo.setSymbolForAST(this.semanticInfo.getASTForDecl(callSignatureDeclaration), callSignature);

            parent.addCallSignature(callSignature);
        }

        public bindIndexSignatureDeclarationToPullSymbol(indexSignatureDeclaration: PullDecl) {
            var parent = this.getParent(true);

            var indexSigs = parent.getIndexSignatures();

            for (var i = 0; i < indexSigs.length; i++) {
                if (indexSigs[i].getSymbolID() < this.startingSymbolForRebind) {
                    parent.removeIndexSignature(indexSigs[i], false);
                }
            }

            // update the index signature list
            parent.recomputeIndexSignatures();

            var indexSignature = new PullSignatureSymbol(PullElementKind.IndexSignature);

            var typeParameters = indexSignatureDeclaration.getTypeParameters();
            var typeParameter: PullTypeParameterSymbol;
            var typeParameterDecls: PullDecl[] = null;

            for (var i = 0; i < typeParameters.length; i++) {

                typeParameter = indexSignature.findTypeParameter(typeParameters[i].getName());

                if (!typeParameter) {
                    typeParameter = new PullTypeParameterSymbol(typeParameters[i].getName());

                    indexSignature.addTypeParameter(typeParameter);
                }
                else {
                    typeParameterDecls = typeParameter.getDeclarations();

                    if (this.symbolIsRedeclaration(typeParameter)) {
                        var typeParameterAST = this.semanticInfoChain.getASTForDecl(typeParameterDecls[0]);
                        indexSignatureDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), typeParameterAST.minChar, typeParameterAST.getLength(), "Duplicate identifier '{0}'.", [typeParameter.getName()]));
                    }

                    // clean the decls
                    typeParameterDecls = typeParameter.getDeclarations();

                    for (var j = 0; j < typeParameterDecls.length; j++) {
                        if (typeParameterDecls[j].getDeclID() < this.startingDeclForRebind) {
                            typeParameter.removeDeclaration(typeParameterDecls[j]);
                        }
                    }
                }

                typeParameter.addDeclaration(typeParameters[i]);
                typeParameters[i].setSymbol(typeParameter);
            }

            indexSignature.addDeclaration(indexSignatureDeclaration);
            indexSignatureDeclaration.setSignatureSymbol(indexSignature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(indexSignatureDeclaration), null, indexSignature);

            this.semanticInfo.setSymbolForAST(this.semanticInfo.getASTForDecl(indexSignatureDeclaration), indexSignature);

            parent.addIndexSignature(indexSignature);
        }

        // getters and setters

        public bindGetAccessorDeclarationToPullSymbol(getAccessorDeclaration: PullDecl) {
            var declKind = getAccessorDeclaration.getKind();
            var declFlags = getAccessorDeclaration.getFlags();
            var funcDeclAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(getAccessorDeclaration);

            var isExported = (declFlags & PullElementFlags.Exported) !== 0;

            var funcName = getAccessorDeclaration.getName();

            var isSignature: boolean = (declFlags & PullElementFlags.Signature) !== 0;
            var isStatic = false;
            var linkKind = SymbolLinkKind.PublicMember;

            if (hasFlag(declFlags, PullElementFlags.Static)) {
                isStatic = true;
            }

            if (hasFlag(declFlags, PullElementFlags.Private)) {
                linkKind = SymbolLinkKind.PrivateMember;
            }

            var parent = this.getParent(true);
            var parentHadSymbol = false;
            var hadOtherAccessor = false;
            var cleanedPreviousDecls = false;

            var accessorSymbol: PullAccessorSymbol = null;
            var getterSymbol: PullSymbol = null;
            var getterTypeSymbol: PullFunctionTypeSymbol = null;

            if (!isStatic) {
                accessorSymbol = <PullAccessorSymbol>parent.findMember(funcName, false);
            }
            else {
                var candidate: PullSymbol;

                for (var m = 0; m < this.staticClassMembers.length; m++) {
                    candidate = this.staticClassMembers[m];

                    if (candidate.getName() === funcName) {
                        accessorSymbol = <PullAccessorSymbol>candidate;
                        hadOtherAccessor = accessorSymbol.isAccessor();
                        break;
                    }
                }
            }

            if (accessorSymbol) {
                if (!accessorSymbol.isAccessor()) {
                    getAccessorDeclaration.addDiagnostic(
                        new Diagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), "Duplicate identifier '{0}'." , [getAccessorDeclaration.getDisplayName()]));
                    accessorSymbol = null;
                }
                else {
                    getterSymbol = accessorSymbol.getGetter();

                    if (getterSymbol && (!this.reBindingAfterChange || this.symbolIsRedeclaration(getterSymbol))) {
                        getAccessorDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(),funcDeclAST.minChar, funcDeclAST.getLength(), "Getter '{0}' already declared.", [getAccessorDeclaration.getDisplayName()]));
                        accessorSymbol = null;
                        getterSymbol = null;
                    }
                }
            }

            // we have an accessor we can use...
            if (accessorSymbol && getterSymbol) {
                getterTypeSymbol = <PullFunctionTypeSymbol>getterSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && accessorSymbol) {

                // prune out-of-date decls...
                var decls = accessorSymbol.getDeclarations();
                var scriptName = getAccessorDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        accessorSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (getterSymbol) {
                    decls = getterSymbol.getDeclarations();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            getterSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }
                }

                accessorSymbol.invalidate();
            }

            if (!accessorSymbol) {
                accessorSymbol = new PullAccessorSymbol(funcName);
            }

            if (!getterSymbol) {
                getterSymbol = new PullSymbol(funcName, PullElementKind.Function);
                getterTypeSymbol = new PullFunctionTypeSymbol();

                getterSymbol.setType(getterTypeSymbol);

                accessorSymbol.setGetter(getterSymbol);
            }

            getAccessorDeclaration.setSymbol(accessorSymbol);
            accessorSymbol.addDeclaration(getAccessorDeclaration);
            getterSymbol.addDeclaration(getAccessorDeclaration);

            this.semanticInfo.setSymbolForAST(funcDeclAST.name, getterSymbol);
            this.semanticInfo.setSymbolForAST(funcDeclAST, getterSymbol);

            // PULLTODO: Verify parent is a class or object literal
            // PULLTODO: Verify static/non-static between getter and setter

            if (!parentHadSymbol && !hadOtherAccessor) {

                if (isStatic) {
                    this.staticClassMembers[this.staticClassMembers.length] = accessorSymbol;
                }
                else {
                    parent.addMember(accessorSymbol, linkKind);
                }
            }

            if (!isSignature) {
                this.pushParent(getterTypeSymbol, getAccessorDeclaration);
            }

            // PULLTODO: For now, remove stale signatures from the function type, but we want to be smarter about this when
            // incremental parsing comes online
            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = getterTypeSymbol.getCallSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    getterTypeSymbol.removeCallSignature(callSigs[i], false);
                }

                // just invalidate this once, so we don't pay the cost of rebuilding caches
                // for each signature removed
                getterSymbol.invalidate();
                getterTypeSymbol.invalidate();
                getterTypeSymbol.recomputeCallSignatures();
            }

            var signature = isSignature ? new PullSignatureSymbol(PullElementKind.CallSignature) : new PullDefinitionSignatureSymbol(PullElementKind.CallSignature);

            signature.addDeclaration(getAccessorDeclaration);
            getAccessorDeclaration.setSignatureSymbol(signature);

            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(getAccessorDeclaration), getterTypeSymbol, signature);

            var typeParameters = getAccessorDeclaration.getTypeParameters();

            if (typeParameters.length) {
                getAccessorDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), "Accessors cannot have type parameters.", null));
            }

            // add the implicit call member for this function type
            getterTypeSymbol.addSignature(signature);

            if (!isSignature) {
                var childDecls = getAccessorDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            getterSymbol.setIsBound(this.bindingPhase);
        }

        public bindSetAccessorDeclarationToPullSymbol(setAccessorDeclaration: PullDecl) {
            var declKind = setAccessorDeclaration.getKind();
            var declFlags = setAccessorDeclaration.getFlags();
            var funcDeclAST = <FunctionDeclaration>this.semanticInfo.getASTForDecl(setAccessorDeclaration);

            var isExported = (declFlags & PullElementFlags.Exported) !== 0;

            var funcName = setAccessorDeclaration.getName();

            var isSignature: boolean = (declFlags & PullElementFlags.Signature) !== 0;
            var isStatic = false;
            var linkKind = SymbolLinkKind.PublicMember;

            if (hasFlag(declFlags, PullElementFlags.Static)) {
                isStatic = true;
            }

            if (hasFlag(declFlags, PullElementFlags.Private)) {
                linkKind = SymbolLinkKind.PrivateMember;
            }

            var parent = this.getParent(true);
            var parentHadSymbol = false;
            var hadOtherAccessor = false;
            var cleanedPreviousDecls = false;

            var accessorSymbol: PullAccessorSymbol = null;
            var setterSymbol: PullSymbol = null;
            var setterTypeSymbol: PullFunctionTypeSymbol = null;

            if (!isStatic) {
                accessorSymbol = <PullAccessorSymbol>parent.findMember(funcName, false);
            }
            else {
                var candidate: PullSymbol;

                for (var m = 0; m < this.staticClassMembers.length; m++) {
                    candidate = this.staticClassMembers[m];

                    if (candidate.getName() === funcName) {
                        accessorSymbol = <PullAccessorSymbol>candidate;
                        hadOtherAccessor = accessorSymbol.isAccessor();
                        break;
                    }
                }
            }

            if (accessorSymbol) {
                if (!accessorSymbol.isAccessor()) {
                    setAccessorDeclaration.addDiagnostic(
                        new Diagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), "Duplicate identifier '{0}'.", [setAccessorDeclaration.getDisplayName()]));
                    accessorSymbol = null;
                }
                else {
                    setterSymbol = accessorSymbol.getSetter();

                    if (setterSymbol && (!this.reBindingAfterChange || this.symbolIsRedeclaration(setterSymbol))) {
                        setAccessorDeclaration.addDiagnostic(
                            new Diagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), "Setter '{0}' already declared.", [setAccessorDeclaration.getDisplayName()]));
                        accessorSymbol = null;
                        setterSymbol = null;
                    }
                }
            }

            // we have an accessor we can use...
            if (accessorSymbol && setterSymbol) {
                setterTypeSymbol = <PullFunctionTypeSymbol>setterSymbol.getType();
                parentHadSymbol = true;
            }

            if (this.reBindingAfterChange && accessorSymbol) {

                // prune out-of-date decls...
                var decls = accessorSymbol.getDeclarations();
                var scriptName = setAccessorDeclaration.getScriptName();

                for (var j = 0; j < decls.length; j++) {
                    if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                        accessorSymbol.removeDeclaration(decls[j]);

                        cleanedPreviousDecls = true;
                    }
                }

                if (setterSymbol) {
                    decls = setterSymbol.getDeclarations();

                    for (var j = 0; j < decls.length; j++) {
                        if (decls[j].getScriptName() === scriptName && decls[j].getDeclID() < this.startingDeclForRebind) {
                            setterSymbol.removeDeclaration(decls[j]);

                            cleanedPreviousDecls = true;
                        }
                    }
                }

                accessorSymbol.invalidate();
            }

            if (!accessorSymbol) {
                // PULLTODO: Make sure that we properly flag signature decl types when collecting decls
                accessorSymbol = new PullAccessorSymbol(funcName);
            }

            if (!setterSymbol) {
                setterSymbol = new PullSymbol(funcName, PullElementKind.Function);
                setterTypeSymbol = new PullFunctionTypeSymbol();

                setterSymbol.setType(setterTypeSymbol);

                accessorSymbol.setSetter(setterSymbol);
            }

            setAccessorDeclaration.setSymbol(accessorSymbol);
            accessorSymbol.addDeclaration(setAccessorDeclaration);
            setterSymbol.addDeclaration(setAccessorDeclaration);

            this.semanticInfo.setSymbolForAST(funcDeclAST.name, setterSymbol);
            this.semanticInfo.setSymbolForAST(funcDeclAST, setterSymbol);

            // PULLTODO: Verify parent is a class or object literal
            // PULLTODO: Verify static/non-static between getter and setter

            if (!parentHadSymbol && !hadOtherAccessor) {

                if (isStatic) {
                    this.staticClassMembers[this.staticClassMembers.length] = accessorSymbol;
                }
                else {
                    parent.addMember(accessorSymbol, linkKind);
                }
            }

            if (!isSignature) {
                this.pushParent(setterTypeSymbol, setAccessorDeclaration);
            }

            // PULLTODO: For now, remove stale signatures from the function type, but we want to be smarter about this when
            // incremental parsing comes online
            if (parentHadSymbol && cleanedPreviousDecls) {
                var callSigs = setterTypeSymbol.getCallSignatures();

                for (var i = 0; i < callSigs.length; i++) {
                    setterTypeSymbol.removeCallSignature(callSigs[i], false);
                }

                // just invalidate this once, so we don't pay the cost of rebuilding caches
                // for each signature removed
                setterSymbol.invalidate();
                setterTypeSymbol.invalidate();
                setterTypeSymbol.recomputeCallSignatures();
            }

            var signature = isSignature ? new PullSignatureSymbol(PullElementKind.CallSignature) : new PullDefinitionSignatureSymbol(PullElementKind.CallSignature);

            signature.addDeclaration(setAccessorDeclaration);
            setAccessorDeclaration.setSignatureSymbol(signature);

            // PULLTODO: setter should not have a parameters
            this.bindParameterSymbols(<FunctionDeclaration>this.semanticInfo.getASTForDecl(setAccessorDeclaration), setterTypeSymbol, signature);

            var typeParameters = setAccessorDeclaration.getTypeParameters();

            if (typeParameters.length) {
                setAccessorDeclaration.addDiagnostic(
                    new Diagnostic(this.semanticInfo.getPath(), funcDeclAST.minChar, funcDeclAST.getLength(), "Accessors cannot have type parameters.", null));
            }

            // add the implicit call member for this function type
            setterTypeSymbol.addSignature(signature);

            if (!isSignature) {
                var childDecls = setAccessorDeclaration.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.bindDeclToPullSymbol(childDecls[i]);
                }

                this.popParent();
            }

            setterSymbol.setIsBound(this.bindingPhase);
        }

        public bindCatchBlockPullSymbols(catchBlockDecl: PullDecl) {
            var childDecls = catchBlockDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }
        }

        public bindWithBlockPullSymbols(withBlockDecl: PullDecl) {
            var childDecls = withBlockDecl.getChildDecls();

            for (var i = 0; i < childDecls.length; i++) {
                this.bindDeclToPullSymbol(childDecls[i]);
            }
        }

        // binding
        public bindDeclToPullSymbol(decl: PullDecl, rebind = false) {

            if (rebind) {
                this.startingDeclForRebind = lastBoundPullDeclId;
                this.startingSymbolForRebind = lastBoundPullSymbolID;
                this.reBindingAfterChange = true;
            }

            switch (decl.getKind()) {

                case PullElementKind.Script:
                    var childDecls = decl.getChildDecls();
                    for (var i = 0; i < childDecls.length; i++) {
                        this.bindDeclToPullSymbol(childDecls[i]);
                    }
                    break;

                case PullElementKind.DynamicModule:
                case PullElementKind.Container:
                    this.bindModuleDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.Interface:
                    this.bindInterfaceDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.Class:
                    this.bindClassDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.Function:
                    this.bindFunctionDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.Variable:
                    this.bindVariableDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.EnumMember:
                case PullElementKind.Property:
                    this.bindPropertyDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.Method:
                    this.bindMethodDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.ConstructorMethod:
                    this.bindConstructorDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.CallSignature:
                    this.bindCallSignatureDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.ConstructSignature:
                    this.bindConstructSignatureDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.IndexSignature:
                    this.bindIndexSignatureDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.Enum:
                    this.bindEnumDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.GetAccessor:
                    this.bindGetAccessorDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.SetAccessor:
                    this.bindSetAccessorDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.ObjectType:
                    this.bindObjectTypeDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.FunctionType:
                    this.bindFunctionTypeDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.ConstructorType:
                    this.bindConstructorTypeDeclarationToPullSymbol(decl);
                    break;

                case PullElementKind.FunctionExpression:
                    this.bindFunctionExpressionToPullSymbol(decl);
                    break;

                case PullElementKind.TypeAlias:
                    this.bindImportDeclaration(decl);
                    break;

                case PullElementKind.Parameter:
                    // parameters are bound by their enclosing function
                    break;

                case PullElementKind.CatchBlock:
                    this.bindCatchBlockPullSymbols(decl);

                case PullElementKind.WithBlock:
                    this.bindWithBlockPullSymbols(decl);
                    break;

                default:
                    throw new Error("Unrecognized type declaration");
            }
        }

        public bindDeclsForUnit(filePath: string, rebind = false) {
            this.setUnit(filePath);

            var topLevelDecls = this.semanticInfo.getTopLevelDecls();

            for (var i = 0; i < topLevelDecls.length; i++) {
                this.bindDeclToPullSymbol(topLevelDecls[i], rebind);
            }
        }
    }
}