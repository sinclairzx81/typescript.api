// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='..\typescript.ts' />

module TypeScript {

    export module PullHelpers {
        export interface SignatureInfoForFuncDecl {
            signature: PullSignatureSymbol;
            allSignatures: PullSignatureSymbol[];
        }

        export function getSignatureForFuncDecl(funcDecl: FunctionDeclaration, semanticInfo: SemanticInfo) {
            var funcSymbol = semanticInfo.getSymbolForAST(funcDecl);
            if (funcSymbol.isSignature()) {
                return {
                    signature: <PullSignatureSymbol>funcSymbol,
                    allSignatures: [<PullSignatureSymbol>funcSymbol]
                };
            }
            var functionDecl = semanticInfo.getDeclForAST(funcDecl);
            var functionSignature = functionDecl.getSignatureSymbol();
            var funcTypeSymbol = funcSymbol.getType();
            var signatures: PullSignatureSymbol[];
            if (funcDecl.isConstructor || funcDecl.isConstructMember()) {
                signatures = funcTypeSymbol.getConstructSignatures();
            } else if (funcDecl.isIndexerMember()) {
                signatures = funcTypeSymbol.getIndexSignatures();
            } else {
                signatures = funcTypeSymbol.getCallSignatures();
            }
            return {
                signature: functionSignature,
                allSignatures: signatures
            };
        }

        export function getAccessorSymbol(getterOrSetter: FunctionDeclaration, semanticInfoChain: SemanticInfoChain, unitPath: string) {
            var getterOrSetterSymbol = semanticInfoChain.getSymbolForAST(getterOrSetter, unitPath);
            var linkKind: SymbolLinkKind;
            if (hasFlag(getterOrSetter.getFunctionFlags(), FunctionFlags.GetAccessor)) {
                linkKind = SymbolLinkKind.GetterFunction;
            } else {
                linkKind = SymbolLinkKind.SetterFunction;
            }

            var accessorSymbolLinks = getterOrSetterSymbol.findIncomingLinks((psl) => psl.kind === linkKind);
            if (accessorSymbolLinks.length) {
                return <PullAccessorSymbol>accessorSymbolLinks[0].start;
            }

            return null;
        }

        export function getGetterAndSetterFunction(funcDecl: FunctionDeclaration, semanticInfoChain: SemanticInfoChain, unitPath: string): { getter: FunctionDeclaration; setter: FunctionDeclaration; } {
            var accessorSymbol = PullHelpers.getAccessorSymbol(funcDecl, semanticInfoChain, unitPath);
            var result: { getter: FunctionDeclaration; setter: FunctionDeclaration; } = {
                getter: null,
                setter: null
            };
            var getter = accessorSymbol.getGetter();
            if (getter) {
                var getterDecl = getter.getDeclarations()[0];
                result.getter = <FunctionDeclaration>semanticInfoChain.getASTForDecl(getterDecl);
            }
            var setter = accessorSymbol.getSetter();
            if (setter) {
                var setterDecl = setter.getDeclarations()[0];
                result.setter = <FunctionDeclaration>semanticInfoChain.getASTForDecl(setterDecl);
            }

            return result;
        }
    }
}