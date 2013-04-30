// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='..\typescript.ts' />

module TypeScript {
    export class TypeComparisonInfo {
        public onlyCaptureFirstError = false;
        public flags: TypeRelationshipFlags = TypeRelationshipFlags.SuccessfulComparison;
        public message = "";
        public stringConstantVal: AST = null;
        private indent = 1;

        constructor(sourceComparisonInfo?: TypeComparisonInfo) {
            if (sourceComparisonInfo) {
                this.flags = sourceComparisonInfo.flags;
                this.onlyCaptureFirstError = sourceComparisonInfo.onlyCaptureFirstError;
                this.stringConstantVal = sourceComparisonInfo.stringConstantVal;
                this.indent = sourceComparisonInfo.indent + 1;
            }
        }

        private indentString(): string {
            var result = "";
            for (var i = 0; i < this.indent; i++) {
                result += "\t";
            }

            return result;
        }

        public addMessage(message) {
            if (!this.onlyCaptureFirstError && this.message) {
                this.message = this.message + "\r\n" + this.indentString() + message;
            }
            else {
                this.message = this.indentString() + message;
            }
        }

        public setMessage(message) {
            this.message = this.indentString() + message;
        }
    }

    export class PullTypeCheckContext {
        public enclosingDeclStack: PullDecl[] = [];
        public enclosingDeclReturnStack: boolean[] = [];
        public semanticInfo: SemanticInfo = null;
        public inSuperConstructorCall = false;
        public inSuperConstructorTarget = false;
        public seenSuperConstructorCall = false;
        public inConstructorArguments = false;

        constructor(public compiler: TypeScriptCompiler, public script: Script, public scriptName: string) {
        }

        public pushEnclosingDecl(decl: PullDecl) {
            this.enclosingDeclStack[this.enclosingDeclStack.length] = decl;
            this.enclosingDeclReturnStack[this.enclosingDeclReturnStack.length] = false;
        }

        public popEnclosingDecl() {
            this.enclosingDeclStack.length--;
            this.enclosingDeclReturnStack.length--;
        }

        public getEnclosingDecl(kind: PullElementKind = PullElementKind.All) {
            for (var i = this.enclosingDeclStack.length - 1; i >= 0; i--) {
                var decl = this.enclosingDeclStack[i];
                if (decl.getKind() & kind) {
                    return decl;
                }
            }

            return null;
        }

        public getEnclosingNonLambdaDecl() {
            for (var i = this.enclosingDeclStack.length - 1; i >= 0; i--) {
                var decl = this.enclosingDeclStack[i];
                if (!(decl.getKind() === PullElementKind.FunctionExpression && (decl.getFlags() & PullElementFlags.FatArrow))) {
                    return decl;
                }
            }

            return null;
        }

        public getEnclosingClassDecl(): PullDecl {
            return this.getEnclosingDecl(PullElementKind.Class);
        }

        public getEnclosingDeclHasReturn() {
            return this.enclosingDeclReturnStack[this.enclosingDeclReturnStack.length - 1];
        }

        public setEnclosingDeclHasReturn() {
            return this.enclosingDeclReturnStack[this.enclosingDeclReturnStack.length - 1] = true;
        }
    }

    export class PullTypeChecker {

        static globalPullTypeCheckPhase = 0;

        public resolver: PullTypeResolver = null;

        private context: PullTypeResolutionContext = new PullTypeResolutionContext();

        constructor(private compilationSettings: CompilationSettings,
            public semanticInfoChain: SemanticInfoChain) {
        }

        public setUnit(unitPath: string) {
            this.resolver = new PullTypeResolver(this.compilationSettings, this.semanticInfoChain, unitPath);
        }

        private getScriptDecl(fileName: string): PullDecl {
            return this.semanticInfoChain.getUnit(fileName).getTopLevelDecls()[0];
        }

        private checkForResolutionError(typeSymbol: PullTypeSymbol, decl: PullDecl): void {
            if (typeSymbol && typeSymbol.isError()) {
                decl.addDiagnostic((<PullErrorTypeSymbol>typeSymbol).getDiagnostic());
            }
        }

        private postError(offset: number, length: number, fileName: string, diagnosticKey: string, arguments: any[], enclosingDecl: PullDecl) {
            enclosingDecl.addDiagnostic(new Diagnostic(fileName, offset, length, diagnosticKey, arguments));
        }

        private validateVariableDeclarationGroups(enclosingDecl: PullDecl, typeCheckContext: PullTypeCheckContext) {
            var declGroups: PullDecl[][] = enclosingDecl.getVariableDeclGroups();
            var decl: PullDecl;
            var firstSymbol: PullSymbol;
            var symbol: PullSymbol;
            var boundDeclAST: AST;

            for (var i = 0; i < declGroups.length; i++) {

                for (var j = 0; j < declGroups[i].length; j++) {
                    decl = declGroups[i][j];
                    symbol = decl.getSymbol();
                    boundDeclAST = this.semanticInfoChain.getASTForDecl(decl);
                    this.resolver.resolveDeclaration(boundDeclAST, this.context, enclosingDecl);
                    if (!j) {
                        firstSymbol = decl.getSymbol();

                        if (this.resolver.isAnyOrEquivalent(this.resolver.widenType(firstSymbol.getType()))) {
                            return;
                        }
                        continue;
                    }

                    if (!this.resolver.typesAreIdentical(symbol.getType(), firstSymbol.getType())) {
                        this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, "Subsequent variable declarations must have the same type.  Variable '{0}' must be of type '{1}', but here has type '{2}'", [symbol.getDisplayName(), firstSymbol.getType().toString(), symbol.getType().toString()], enclosingDecl);
                    }
                }
            }
        }

        // declarations

        private typeCheckAST(ast: AST, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment = false): PullTypeSymbol {

            if (!ast) {
                return null;
            }

            if (ast.typeCheckPhase >= PullTypeChecker.globalPullTypeCheckPhase) {
                return null;
            }
            else {
                ast.typeCheckPhase = PullTypeChecker.globalPullTypeCheckPhase;
            }

            switch (ast.nodeType) {

                // lists
                case NodeType.List:
                    return this.typeCheckList(<ASTList>ast, typeCheckContext);

                // decarations

                case NodeType.VariableDeclarator:
                case NodeType.Parameter:
                    return this.typeCheckBoundDecl(ast, typeCheckContext);

                case NodeType.FunctionDeclaration:
                    return this.typeCheckFunction(<FunctionDeclaration>ast, typeCheckContext, inContextuallyTypedAssignment);

                case NodeType.ClassDeclaration:
                    return this.typeCheckClass(ast, typeCheckContext);

                case NodeType.InterfaceDeclaration:
                    return this.typeCheckInterface(ast, typeCheckContext);

                case NodeType.ModuleDeclaration:
                    return this.typeCheckModule(ast, typeCheckContext);

                // expressions

                // assignment
                case NodeType.AssignmentExpression:
                    return this.typeCheckAssignment(<BinaryExpression>ast, typeCheckContext);

                case GenericType:
                    return this.typeCheckGenericType(ast, typeCheckContext);

                case NodeType.ObjectLiteralExpression:
                    return this.typeCheckObjectLiteral(ast, typeCheckContext, inContextuallyTypedAssignment);

                case NodeType.ArrayLiteralExpression:
                    return this.typeCheckArrayLiteral(ast, typeCheckContext, inContextuallyTypedAssignment);

                case NodeType.ThisExpression:
                    return this.typeCheckThisExpression(<ThisExpression>ast, typeCheckContext);

                case NodeType.SuperExpression:
                    return this.typeCheckSuper(ast, typeCheckContext);

                case NodeType.InvocationExpression:
                    return this.typeCheckCallExpression(<CallExpression>ast, typeCheckContext);

                case NodeType.ObjectCreationExpression:
                    return this.typeCheckObjectCreationExpression(<CallExpression>ast, typeCheckContext);

                case NodeType.CastExpression:
                    return this.typeCheckTypeAssertion(ast, typeCheckContext);

                case NodeType.TypeRef:
                    return this.typeCheckTypeReference(ast, typeCheckContext);

                // boolean operations
                case NodeType.NotEqualsWithTypeConversionExpression:
                case NodeType.EqualsWithTypeConversionExpression:
                case NodeType.EqualsExpression:
                case NodeType.NotEqualsExpression:
                case NodeType.LessThanExpression:
                case NodeType.LessThanOrEqualExpression:
                case NodeType.GreaterThanOrEqualExpression:
                case NodeType.GreaterThanExpression:
                    return this.typeCheckLogicalOperation(ast, typeCheckContext);

                case NodeType.CommaExpression:
                    return this.typeCheckCommaExpression(ast, typeCheckContext);

                case NodeType.AddExpression:
                case NodeType.AddAssignmentExpression:
                    return this.typeCheckBinaryAdditionOperation(<BinaryExpression>ast, typeCheckContext);

                case NodeType.SubtractExpression:
                case NodeType.MultiplyExpression:
                case NodeType.DivideExpression:
                case NodeType.ModuloExpression:
                case NodeType.BitwiseOrExpression:
                case NodeType.BitwiseAndExpression:
                case NodeType.LeftShiftExpression:
                case NodeType.SignedRightShiftExpression:
                case NodeType.UnsignedRightShiftExpression:
                case NodeType.BitwiseExclusiveOrExpression:
                case NodeType.ExclusiveOrAssignmentExpression:
                case NodeType.LeftShiftAssignmentExpression:
                case NodeType.SignedRightShiftAssignmentExpression:
                case NodeType.UnsignedRightShiftAssignmentExpression:
                case NodeType.SubtractAssignmentExpression:
                case NodeType.MultiplyAssignmentExpression:
                case NodeType.DivideAssignmentExpression:
                case NodeType.ModuloAssignmentExpression:
                case NodeType.OrAssignmentExpression:
                case NodeType.AndAssignmentExpression:
                    return this.typeCheckBinaryArithmeticOperation(<BinaryExpression>ast, typeCheckContext);

                case NodeType.PlusExpression:
                case NodeType.NegateExpression:
                case NodeType.BitwiseNotExpression:
                case NodeType.PostIncrementExpression:
                case NodeType.PreIncrementExpression:
                case NodeType.PostDecrementExpression:
                case NodeType.PreDecrementExpression:
                    return this.typeCheckUnaryArithmeticOperation(<UnaryExpression>ast, typeCheckContext, inContextuallyTypedAssignment);

                case NodeType.ElementAccessExpression:
                    return this.typeCheckElementAccessExpression(<BinaryExpression>ast, typeCheckContext);

                case NodeType.LogicalNotExpression:
                    return this.typeCheckLogicalNotExpression(<UnaryExpression>ast, typeCheckContext, inContextuallyTypedAssignment);

                case NodeType.LogicalOrExpression:
                case NodeType.LogicalAndExpression:
                    return this.typeCheckLogicalAndOrExpression(ast, typeCheckContext);

                case NodeType.TypeOfExpression:
                    return this.typeCheckTypeOf(ast, typeCheckContext);

                case NodeType.ConditionalExpression:
                    return this.typeCheckConditionalExpression(<ConditionalExpression>ast, typeCheckContext);

                case NodeType.VoidExpression:
                    return this.typeCheckVoidExpression(<UnaryExpression>ast, typeCheckContext);

                case NodeType.ThrowStatement:
                    return this.typeCheckThrowStatement(<ThrowStatement>ast, typeCheckContext);

                case NodeType.DeleteExpression:
                    return this.typeCheckDeleteExpression(<UnaryExpression>ast, typeCheckContext);

                case NodeType.RegularExpressionLiteral:
                    return this.typeCheckRegExpExpression(ast, typeCheckContext);

                case NodeType.InExpression:
                    return this.typeCheckInExpression(<BinaryExpression>ast, typeCheckContext);

                case NodeType.InstanceOfExpression:
                    return this.typeCheckInstanceOfExpression(<BinaryExpression>ast, typeCheckContext);

                case NodeType.ParenthesizedExpression:
                    return this.typeCheckParenthesizedExpression(<ParenthesizedExpression>ast, typeCheckContext);

                // statements
                case NodeType.ForStatement:
                    return this.typeCheckForStatement(<ForStatement>ast, typeCheckContext);

                case NodeType.ForInStatement:
                    return this.typeCheckForInStatement(ast, typeCheckContext);

                case NodeType.WhileStatement:
                    return this.typeCheckWhileStatement(<WhileStatement>ast, typeCheckContext);

                case NodeType.DoStatement:
                    return this.typeCheckDoStatement(<DoStatement>ast, typeCheckContext);

                case NodeType.IfStatement:
                    return this.typeCheckIfStatement(<IfStatement>ast, typeCheckContext);

                case NodeType.Block:
                    return this.typeCheckBlock(<Block>ast, typeCheckContext);

                case NodeType.VariableDeclaration:
                    return this.typeCheckVariableDeclaration(<VariableDeclaration>ast, typeCheckContext);

                case NodeType.VariableStatement:
                    return this.typeCheckVariableStatement(<VariableStatement>ast, typeCheckContext);

                case NodeType.WithStatement:
                    return this.typeCheckWithStatement(<WithStatement>ast, typeCheckContext);

                case NodeType.TryStatement:
                    return this.typeCheckTryStatement(<TryStatement>ast, typeCheckContext);

                case NodeType.CatchClause:
                    return this.typeCheckCatchClause(<CatchClause>ast, typeCheckContext);

                case NodeType.ReturnStatement:
                    return this.typeCheckReturnStatement(<ReturnStatement>ast, typeCheckContext);

                case NodeType.Name:
                    return this.typeCheckNameExpression(ast, typeCheckContext);

                case NodeType.MemberAccessExpression:
                    return this.typeCheckMemberAccessExpression(<BinaryExpression>ast, typeCheckContext);

                case NodeType.SwitchStatement:
                    return this.typeCheckSwitchStatement(<SwitchStatement>ast, typeCheckContext);

                case NodeType.ExpressionStatement:
                    return this.typeCheckExpressionStatement(<ExpressionStatement>ast, typeCheckContext, inContextuallyTypedAssignment);

                case NodeType.CaseClause:
                    return this.typeCheckCaseClause(<CaseClause>ast, typeCheckContext);

                case NodeType.LabeledStatement:
                    return this.typeCheckLabeledStatement(<LabeledStatement>ast, typeCheckContext);

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

                default:
                    break;
            }

            return null;
        }

        //
        // Validation
        //

        // scripts
        public typeCheckScript(script: Script, scriptName: string, compiler: TypeScriptCompiler) {

            var unit = this.semanticInfoChain.getUnit(scriptName);

            if (unit.getTypeChecked()) {
                return;
            }

            var typeCheckContext = new PullTypeCheckContext(compiler, script, scriptName);

            this.setUnit(scriptName);

            typeCheckContext.semanticInfo = typeCheckContext.compiler.semanticInfoChain.getUnit(typeCheckContext.scriptName);
            var scriptDecl = typeCheckContext.semanticInfo.getTopLevelDecls()[0];
            typeCheckContext.pushEnclosingDecl(scriptDecl);

            PullTypeChecker.globalPullTypeCheckPhase++;

            this.typeCheckAST(script.moduleElements, typeCheckContext);

            this.validateVariableDeclarationGroups(scriptDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            unit.setTypeChecked();
        }

        // lists
        private typeCheckList(list: ASTList, typeCheckContext: PullTypeCheckContext) {
            if (!list) {
                return null;
            }

            for (var i = 0; i < list.members.length; i++) {
                this.typeCheckAST(list.members[i], typeCheckContext);
            }
        }

        // variable and argument declarations
        // validate:
        //  - lhs and rhs types agree (if lhs has no type annotation)
        private typeCheckBoundDecl(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var boundDeclAST = <BoundDecl>ast;

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var typeExprSymbol: PullTypeSymbol = null;

            if (boundDeclAST.typeExpr) {
                typeExprSymbol = this.typeCheckAST(boundDeclAST.typeExpr, typeCheckContext);

                if (typeExprSymbol.isNamedTypeSymbol() && typeExprSymbol.isGeneric() && !typeExprSymbol.isTypeParameter() && typeExprSymbol.isResolved() && !typeExprSymbol.getIsSpecialized()) {
                    typeExprSymbol = this.resolver.specializeTypeToAny(typeExprSymbol, enclosingDecl, this.context);
                }
            }

            // if there's a type expr and an initializer, resolve the initializer
            if (boundDeclAST.init) {
                if (typeExprSymbol) {
                    this.context.pushContextualType(typeExprSymbol, this.context.inProvisionalResolution(), null);
                }

                var initTypeSymbol = this.typeCheckAST(boundDeclAST.init, typeCheckContext, !!typeExprSymbol);

                if (typeExprSymbol) {
                    this.context.popContextualType();
                }

                if (typeExprSymbol && typeExprSymbol.isContainer()) {
                    var instanceTypeSymbol = (<PullContainerTypeSymbol>typeExprSymbol.getType()).getInstanceSymbol();

                    if (!instanceTypeSymbol) {
                        this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, "Tried to set variable type to uninitialized module type.", null, enclosingDecl);
                        typeExprSymbol = null;
                    }
                    else {
                        typeExprSymbol = instanceTypeSymbol.getType();
                    }
                }

                if (initTypeSymbol && initTypeSymbol.isContainer()) {
                    instanceTypeSymbol = (<PullContainerTypeSymbol>initTypeSymbol.getType()).getInstanceSymbol();

                    if (!instanceTypeSymbol) {
                        this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, "Tried to set variable type to uninitialized module type '{0}'.", [initTypeSymbol.toString()], enclosingDecl);
                        initTypeSymbol = null;
                    }
                    else {
                        initTypeSymbol = instanceTypeSymbol.getType();
                    }
                }

                if (initTypeSymbol && typeExprSymbol) {

                    var comparisonInfo = new TypeComparisonInfo();

                    var isAssignable = this.resolver.sourceIsAssignableToTarget(initTypeSymbol, typeExprSymbol, this.context, comparisonInfo);

                    if (!isAssignable) {
                        if (comparisonInfo.message) {
                            this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}':{NL}{2}", [initTypeSymbol.toString(), typeExprSymbol.toString(), comparisonInfo.message], enclosingDecl);
                        } else {
                            this.postError(boundDeclAST.minChar, boundDeclAST.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}'.", [initTypeSymbol.toString(), typeExprSymbol.toString()], enclosingDecl);
                        }
                    }
                }
            }

            // now resolve the actual symbol, but supress the errors since we've already surfaced them above
            var prevSupressErrors = this.context.suppressErrors;
            this.context.suppressErrors = true;
            var decl: PullDecl = this.resolver.getDeclForAST(boundDeclAST);
            var varTypeSymbol = this.resolver.resolveAST(boundDeclAST, false, enclosingDecl, this.context).getType();

            if (typeExprSymbol && typeExprSymbol.isContainer() && varTypeSymbol.isError()) {
                this.checkForResolutionError(varTypeSymbol, decl);
            }

            this.context.suppressErrors = prevSupressErrors;

            var declSymbol = decl.getSymbol();

            // Check if variable satisfies type privacy
            if (declSymbol.getKind() != PullElementKind.Parameter &&
                (declSymbol.getKind() != PullElementKind.Property || declSymbol.getContainer().isNamedTypeSymbol())) {
                this.checkTypePrivacy(declSymbol, varTypeSymbol, (typeSymbol: PullTypeSymbol) =>
                    this.variablePrivacyErrorReporter(declSymbol, typeSymbol, typeCheckContext));
            }

            return varTypeSymbol;
        }

        // functions 
        // validate:
        //  - use of super calls 
        //  - signatures agree in optionality
        //  - getter/setter type agreement
        //  - body members expr
        //  - getter/setter flags agree
        //  - getters have no parameters 
        //  - getters return a value
        //  - setters return no value
        // PULLTODO: split up into separate functions for constructors, indexers, expressions, signatures, etc.
        private typeCheckFunction(funcDeclAST: FunctionDeclaration, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment = false): PullTypeSymbol {
            if (funcDeclAST.isConstructor || hasFlag(funcDeclAST.getFunctionFlags(), FunctionFlags.ConstructMember)) {
                return this.typeCheckConstructor(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment);
            }
            else if (hasFlag(funcDeclAST.getFunctionFlags(), FunctionFlags.IndexerMember)) {
                return this.typeCheckIndexer(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment);
            }
            else if (funcDeclAST.isAccessor()) {
                return this.typeCheckAccessor(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment);
            }

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var functionSymbol = this.resolver.resolveAST(funcDeclAST, inContextuallyTypedAssignment, enclosingDecl, this.context);

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);

            typeCheckContext.pushEnclosingDecl(functionDecl);

            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, inContextuallyTypedAssignment);
            this.typeCheckAST(funcDeclAST.block, typeCheckContext);

            var hasReturn = typeCheckContext.getEnclosingDeclHasReturn();

            this.validateVariableDeclarationGroups(functionDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            var functionSignature = functionDecl.getSignatureSymbol();

            // check for optionality
            var parameters = functionSignature.getParameters();

            if (parameters.length) {
                for (var i = 0; i < parameters.length; i++) {
                    this.checkForResolutionError(parameters[i].getType(), enclosingDecl);
                }
            }


            var returnType = functionSignature.getReturnType();

            this.checkForResolutionError(returnType, enclosingDecl);

            if (funcDeclAST.block && funcDeclAST.returnTypeAnnotation != null && !hasReturn) {
                var isVoidOrAny = this.resolver.isAnyOrEquivalent(returnType) || returnType === this.semanticInfoChain.voidTypeSymbol;

                if (!isVoidOrAny && !(funcDeclAST.block.statements.members.length > 0 && funcDeclAST.block.statements.members[0].nodeType === NodeType.ThrowStatement)) {
                    var funcName = functionDecl.getDisplayName();
                    funcName = funcName ? "'" + funcName + "'" : "expression";

                    this.postError(funcDeclAST.returnTypeAnnotation.minChar, funcDeclAST.returnTypeAnnotation.getLength(), typeCheckContext.scriptName, "Function {0} declared a non-void return type, but has no return expression.", [funcName], typeCheckContext.getEnclosingDecl());
                }
            }

            this.typeCheckFunctionOverloads(funcDeclAST, typeCheckContext);
            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);

            return functionSymbol ? functionSymbol.getType() : null;
        }

        private typeCheckFunctionOverloads(funcDecl: FunctionDeclaration, typeCheckContext: PullTypeCheckContext) {
            var functionSignatureInfo = PullHelpers.getSignatureForFuncDecl(funcDecl, typeCheckContext.semanticInfo);

            var signature = functionSignatureInfo.signature;
            var allSignatures = functionSignatureInfo.allSignatures;
            var funcSymbol = typeCheckContext.semanticInfo.getSymbolForAST(funcDecl);

            // Find the definition signature for this signature group
            var definitionSignature: PullSignatureSymbol = null;
            for (var i = allSignatures.length - 1; i >= 0; i--) {
                if (allSignatures[i].isDefinition()) {
                    definitionSignature = allSignatures[i];
                    break;
                }
            }

            if (!signature.isDefinition()) {
                // Check for if the signatures are identical, check with the signatures before the current current one
                for (var i = 0; i < allSignatures.length; i++) {
                    if (allSignatures[i] === signature) {
                        break;
                    }

                    if (this.resolver.signaturesAreIdentical(allSignatures[i], signature)) {
                        if (funcDecl.isConstructor) {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Duplicate constructor overload signature.", null, typeCheckContext.getEnclosingDecl());
                        } else if (funcDecl.isConstructMember()) {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Duplicate overload construct signature.", null, typeCheckContext.getEnclosingDecl());
                        } else if (funcDecl.isCallMember()) {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Duplicate overload call signature.", null, typeCheckContext.getEnclosingDecl());
                        } else {
                            this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Duplicate overload signature for '{0}'.", [funcSymbol.getScopedNameEx().toString()], typeCheckContext.getEnclosingDecl());
                        }

                        break;
                    }
                }
            }

            // Verify assignment compatibility or in case of constantOverload signature, if its subtype of atleast one signature
            var isConstantOverloadSignature = signature.isStringConstantOverloadSignature();
            if (isConstantOverloadSignature) {
                if (signature.isDefinition()) {
                    // Report error - definition signature cannot specify constant type
                    this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Overload signature implementation cannot use specialized type.", null, typeCheckContext.getEnclosingDecl());
                } else {
                    var resolutionContext = new PullTypeResolutionContext();
                    var foundSubtypeSignature = false;
                    for (var i = 0; i < allSignatures.length; i++) {
                        if (allSignatures[i].isDefinition() || allSignatures[i] === signature) {
                            continue;
                        }

                        if (!allSignatures[i].isResolved()) {
                            this.resolver.resolveDeclaredSymbol(allSignatures[i], typeCheckContext.getEnclosingDecl(), resolutionContext);
                        }
                        
                        if (allSignatures[i].isStringConstantOverloadSignature()) {
                            continue;
                        }

                        if (this.resolver.signatureIsSubtypeOfTarget(signature, allSignatures[i], resolutionContext)) {
                            foundSubtypeSignature = true;
                            break;
                        }
                    }
                    
                    if (!foundSubtypeSignature) {
                        // Could not find the overload signature subtype
                        this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Specialized overload signature is not subtype of any non-specialized signature.", null, typeCheckContext.getEnclosingDecl());
                    }
                }
            } else if (definitionSignature && definitionSignature != signature) {
                var comparisonInfo = new TypeComparisonInfo();
                var resolutionContext = new PullTypeResolutionContext();
                if (!definitionSignature.isResolved()) {
                    this.resolver.resolveDeclaredSymbol(definitionSignature, typeCheckContext.getEnclosingDecl(), resolutionContext);
                }

                if (!this.resolver.signatureIsAssignableToTarget(definitionSignature, signature, resolutionContext, comparisonInfo)) {
                    // definition signature is not assignable to functionSignature then its incorrect overload signature
                    if (comparisonInfo.message) {
                        this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Overload signature is not compatible with function definition:{NL}{0}", [comparisonInfo.message], typeCheckContext.getEnclosingDecl());
                    } else {
                        this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, "Overload signature is not compatible with function definition.", null, typeCheckContext.getEnclosingDecl());
                    }
                }
            }

            var signatureForVisibilityCheck = definitionSignature;
            if (!definitionSignature) {
                if (allSignatures[0] === signature) {
                    return;
                }
                signatureForVisibilityCheck = allSignatures[0];
            }

            if (!funcDecl.isConstructor && !funcDecl.isConstructMember() && signature != signatureForVisibilityCheck) {
                var errorCode: string;
                // verify it satisfies all the properties of first signature
                if (signatureForVisibilityCheck.hasFlag(PullElementFlags.Private) != signature.hasFlag(PullElementFlags.Private)) {
                    errorCode = "Overload signatures must all be public or private.";
                }
                else if (signatureForVisibilityCheck.hasFlag(PullElementFlags.Exported) != signature.hasFlag(PullElementFlags.Exported)) {
                    errorCode = "Overload signatures must all be exported or local.";
                }
                else if (signatureForVisibilityCheck.hasFlag(PullElementFlags.Ambient) != signature.hasFlag(PullElementFlags.Ambient)) {
                    errorCode = "Overload signatures must all be ambient or non-ambient.";
                }
                else if (signatureForVisibilityCheck.hasFlag(PullElementFlags.Optional) != signature.hasFlag(PullElementFlags.Optional)) {
                    errorCode = "Overload signatures must all be optional or required.";
                }

                if (errorCode) {
                    this.postError(funcDecl.minChar, funcDecl.getLength(), typeCheckContext.scriptName, errorCode, null, typeCheckContext.getEnclosingDecl());
                }
            }
        }

        private typeCheckAccessor(ast: AST, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment = false): PullTypeSymbol {
            var funcDeclAST = <FunctionDeclaration>ast;

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var accessorSymbol = <PullAccessorSymbol>this.resolver.resolveAST(ast, inContextuallyTypedAssignment, enclosingDecl, this.context);
            this.checkForResolutionError(accessorSymbol.getType(), enclosingDecl);

            var isGetter = hasFlag(funcDeclAST.getFunctionFlags(), FunctionFlags.GetAccessor);
            var isSetter = !isGetter;

            var getter = accessorSymbol.getGetter();
            var setter = accessorSymbol.getSetter();

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            typeCheckContext.pushEnclosingDecl(functionDecl);

            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, inContextuallyTypedAssignment);

            this.typeCheckAST(funcDeclAST.block, typeCheckContext);

            var hasReturn = typeCheckContext.getEnclosingDeclHasReturn();

            this.validateVariableDeclarationGroups(functionDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            var functionSignature = functionDecl.getSignatureSymbol();

            // check for optionality
            var parameters = functionSignature.getParameters();

            var returnType = functionSignature.getReturnType();

            this.checkForResolutionError(returnType, enclosingDecl);

            var funcNameAST = funcDeclAST.name;

            if (isGetter && !hasReturn) {
                if (!(funcDeclAST.block.statements.members.length > 0 && funcDeclAST.block.statements.members[0].nodeType === NodeType.ThrowStatement)) {
                    this.postError(funcNameAST.minChar, funcNameAST.getLength(), typeCheckContext.scriptName, "Getters must return a value.", null, typeCheckContext.getEnclosingDecl());
                }
            }

            // Setter with return value is checked in typeCheckReturnExpression

            if (getter && setter) {
                var getterDecl = getter.getDeclarations()[0];
                var setterDecl = setter.getDeclarations()[0];

                var getterIsPrivate = getterDecl.getFlags() & PullElementFlags.Private;
                var setterIsPrivate = setterDecl.getFlags() & PullElementFlags.Private;

                if (getterIsPrivate != setterIsPrivate) {
                    this.postError(funcNameAST.minChar, funcNameAST.getLength(), typeCheckContext.scriptName, "Getter and setter accessors do not agree in visibility.", null, typeCheckContext.getEnclosingDecl());
                }
            }

            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);

            return null;
        }

        private typeCheckConstructor(funcDeclAST: FunctionDeclaration, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment: boolean): PullTypeSymbol {

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var functionSymbol = this.resolver.resolveAST(funcDeclAST, inContextuallyTypedAssignment, enclosingDecl, this.context);

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            typeCheckContext.pushEnclosingDecl(functionDecl);

            typeCheckContext.inConstructorArguments = true;
            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, inContextuallyTypedAssignment);
            typeCheckContext.inConstructorArguments = false;

            // Reset the flag
            typeCheckContext.seenSuperConstructorCall = false;

            this.typeCheckAST(funcDeclAST.block, typeCheckContext);

            this.validateVariableDeclarationGroups(functionDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            var constructorSignature = functionDecl.getSignatureSymbol();

            // check for optionality
            var parameters = constructorSignature.getParameters();

            if (parameters.length) {
                for (var i = 0, n = parameters.length; i < n; i++) {
                    this.checkForResolutionError(parameters[i].getType(), enclosingDecl);
                }
            }

            this.checkForResolutionError(constructorSignature.getReturnType(), enclosingDecl);

            if (functionDecl.getSignatureSymbol() && functionDecl.getSignatureSymbol().isDefinition() && this.enclosingClassIsDerived(typeCheckContext)) {
                // Constructors for derived classes must contain a call to the class's 'super' constructor
                if (!typeCheckContext.seenSuperConstructorCall) {
                    this.postError(funcDeclAST.minChar, 11 /* "constructor" */, typeCheckContext.scriptName,
                        "Constructors for derived classes must contain a 'super' call.", null, enclosingDecl);
                }
                // The first statement in the body of a constructor must be a super call if both of the following are true:
                //  � The containing class is a derived class.
                //  � The constructor declares parameter properties or the containing class declares instance member variables with initializers.
                else if (this.superCallMustBeFirstStatementInConstructor(functionDecl, enclosingDecl)) {
                    var firstStatement = this.getFirstStatementFromFunctionDeclAST(funcDeclAST)
                    if (!firstStatement || !this.isSuperCallNode(firstStatement)) {
                        this.postError(funcDeclAST.minChar, 11 /* "constructor" */, typeCheckContext.scriptName,
                            "A 'super' call must be the first statement in the constructor when a class contains initialized properties or has parameter properties.", null, enclosingDecl);
                    }
                }
            }

            this.typeCheckFunctionOverloads(funcDeclAST, typeCheckContext);
            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);
            return functionSymbol ? functionSymbol.getType() : null;
        }

        private typeCheckIndexer(ast: AST, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment = false): PullTypeSymbol {

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            // resolve the index signature, even though we won't be needing its type
            this.resolver.resolveAST(ast, inContextuallyTypedAssignment, enclosingDecl, this.context);

            var funcDeclAST = <FunctionDeclaration>ast;

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            typeCheckContext.pushEnclosingDecl(functionDecl);

            this.typeCheckAST(funcDeclAST.arguments, typeCheckContext, inContextuallyTypedAssignment);

            this.typeCheckAST(funcDeclAST.block, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            var indexSignature = functionDecl.getSignatureSymbol();
            var parameters = indexSignature.getParameters();

            if (parameters.length) {
                var parameterType: PullTypeSymbol = null;

                for (var i = 0; i < parameters.length; i++) {
                    this.checkForResolutionError(parameters[i].getType(), enclosingDecl);
                }
            }

            this.checkForResolutionError(indexSignature.getReturnType(), enclosingDecl);
            this.checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);

            return null;
        }

        private typeCheckIfTypeMemberPropertyOkToOverride(typeSymbol: PullTypeSymbol, extendedType: PullTypeSymbol,
            typeMember: PullSymbol, extendedTypeMember: PullSymbol, comparisonInfo: TypeComparisonInfo) {

            if (!typeSymbol.isClass()) {
                return true;
            }

            var typeMemberKind = typeMember.getKind();
            var extendedMemberKind = extendedTypeMember.getKind();

            if (typeMemberKind === extendedMemberKind) {
                return true;
            }

            var errorCode: string;
            if (typeMemberKind === PullElementKind.Property) {
                if (typeMember.isAccessor()) {
                    errorCode = "Class '{0}' defines instance member accessor '{1}', but extended class '{2}' defines it as instance member function.";
                } else {
                    errorCode = "Class '{0}' defines instance member property '{1}', but extended class '{2}' defines it as instance member function.";
                }
            } else if (typeMemberKind === PullElementKind.Method) {
                if (extendedTypeMember.isAccessor()) {
                    errorCode = "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member accessor.";
                } else {
                    errorCode = "Class '{0}' defines instance member function '{1}', but extended class '{2}' defines it as instance member property.";
                }
            }

            var message = getDiagnosticMessage(errorCode, [typeSymbol.toString(), typeMember.getScopedNameEx().toString(), extendedType.toString()]);
            comparisonInfo.addMessage(message);
            return false;
        }

        private typeCheckIfTypeExtendsType(typeDecl: TypeDeclaration, typeSymbol: PullTypeSymbol,
            extendedType: PullTypeSymbol, typeCheckContext: PullTypeCheckContext) {
            var typeMembers = typeSymbol.getMembers();

            var resolutionContext = new PullTypeResolutionContext();
            var comparisonInfo = new TypeComparisonInfo();
            var foundError = false;

            // Check members
            for (var i = 0; i < typeMembers.length; i++) {
                var propName = typeMembers[i].getName();
                var extendedTypeProp = extendedType.findMember(propName);
                if (extendedTypeProp) {
                    foundError = !this.typeCheckIfTypeMemberPropertyOkToOverride(typeSymbol, extendedType, typeMembers[i], extendedTypeProp, comparisonInfo);

                    if (!foundError) {
                        foundError = !this.resolver.sourcePropertyIsSubtypeOfTargetProperty(typeSymbol, extendedType, typeMembers[i], extendedTypeProp, resolutionContext, comparisonInfo);
                    }

                    if (foundError) {
                        break;
                    }
                }
            }

            // Check call signatures
            if (!foundError && typeSymbol.hasOwnCallSignatures()) {
                foundError = !this.resolver.sourceCallSignaturesAreSubtypeOfTargetCallSignatures(typeSymbol, extendedType, resolutionContext, comparisonInfo);
            }

            // Check construct signatures
            if (!foundError && typeSymbol.hasOwnConstructSignatures()) {
                foundError = !this.resolver.sourceConstructSignaturesAreSubtypeOfTargetConstructSignatures(typeSymbol, extendedType, resolutionContext, comparisonInfo);
            }

            // Check index signatures
            if (!foundError && typeSymbol.hasOwnIndexSignatures()) {
                foundError = !this.resolver.sourceIndexSignaturesAreSubtypeOfTargetIndexSignatures(typeSymbol, extendedType, resolutionContext, comparisonInfo);
            }

            if (!foundError && typeSymbol.isClass()) {
                // If there is base class verify the constructor type is subtype of base class
                var typeConstructorType = (<PullClassTypeSymbol>typeSymbol).getConstructorMethod().getType();
                var typeConstructorTypeMembers = typeConstructorType.getMembers();
                if (typeConstructorTypeMembers.length) {
                    var extendedConstructorType = (<PullClassTypeSymbol>extendedType).getConstructorMethod().getType();
                    var comparisonInfoForPropTypeCheck = new TypeComparisonInfo(comparisonInfo);

                    // Verify that all the overriden members of the constructor type are compatible
                    for (var i = 0; i < typeConstructorTypeMembers.length; i++) {
                        var propName = typeConstructorTypeMembers[i].getName();
                        var extendedConstructorTypeProp = extendedConstructorType.findMember(propName);
                        if (extendedConstructorTypeProp) {
                            if (!extendedConstructorTypeProp.isResolved()) {
                                var extendedClassAst = typeCheckContext.semanticInfo.getASTForSymbol(extendedType);
                                var extendedClassDecl = typeCheckContext.semanticInfo.getDeclForAST(extendedClassAst);
                                this.resolver.resolveDeclaredSymbol(extendedConstructorTypeProp, extendedClassDecl, resolutionContext);
                            }

                            // check if type of property is subtype of extended type's property type
                            var typeConstructorTypePropType = typeConstructorTypeMembers[i].getType();
                            var extendedConstructorTypePropType = extendedConstructorTypeProp.getType();
                            if (!this.resolver.sourceIsSubtypeOfTarget(typeConstructorTypePropType, extendedConstructorTypePropType, resolutionContext, comparisonInfoForPropTypeCheck)) {
                                var propMessage: string;
                                if (comparisonInfoForPropTypeCheck.message) {
                                    propMessage = getDiagnosticMessage("Types of static property '{0}' of class '{1}' and class '{2}' are incompatible:{NL}{3}",
                                        [extendedConstructorTypeProp.getScopedNameEx().toString(), typeSymbol.toString(), extendedType.toString(), comparisonInfoForPropTypeCheck.message]);
                                } else {
                                    propMessage = getDiagnosticMessage("Types of static property '{0}' of class '{1}' and class '{2}' are incompatible.",
                                        [extendedConstructorTypeProp.getScopedNameEx().toString(), typeSymbol.toString(), extendedType.toString()]);
                                }
                                comparisonInfo.addMessage(propMessage);
                                foundError = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (foundError) {
                var errorCode: string;
                if (typeSymbol.isClass()) {
                    errorCode = "Class '{0}' cannot extend class '{1}':{NL}{2}";
                } else {
                    if (extendedType.isClass()) {
                        errorCode = "Interface '{0}' cannot extend class '{1}':{NL}{2}";
                    } else {
                        errorCode = "Interface '{0}' cannot extend interface '{1}':{NL}{2}";
                    }
                }

                this.postError(typeDecl.name.minChar, typeDecl.name.getLength(), typeCheckContext.scriptName, errorCode, [typeSymbol.getScopedName(), extendedType.getScopedName(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
            }
        }

        private typeCheckIfClassImplementsType(classDecl: TypeDeclaration, classSymbol: PullTypeSymbol,
            implementedType: PullTypeSymbol, typeCheckContext: PullTypeCheckContext) {

            var resolutionContext = new PullTypeResolutionContext();
            var comparisonInfo = new TypeComparisonInfo();
            var foundError = !this.resolver.sourceMembersAreSubtypeOfTargetMembers(classSymbol, implementedType, resolutionContext, comparisonInfo);
            if (!foundError) {
                foundError = !this.resolver.sourceCallSignaturesAreSubtypeOfTargetCallSignatures(classSymbol, implementedType, resolutionContext, comparisonInfo);
                if (!foundError) {
                    foundError = !this.resolver.sourceConstructSignaturesAreSubtypeOfTargetConstructSignatures(classSymbol, implementedType, resolutionContext, comparisonInfo);
                    if (!foundError) {
                        foundError = !this.resolver.sourceIndexSignaturesAreSubtypeOfTargetIndexSignatures(classSymbol, implementedType, resolutionContext, comparisonInfo);
                    }
                }
            }

            // Report error
            if (foundError) {
                var errorCode = implementedType.isClass() ?
                    "Class {0} declares class {1} as an implemented interface but does not implement it:{NL}{2}" :
                    "Class {0} declares interface {1} but does not implement it:{NL}{2}";

                this.postError(classDecl.name.minChar, classDecl.name.getLength(), typeCheckContext.scriptName, errorCode, [classSymbol.getScopedName(), implementedType.getScopedName(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
            }
        }

        private typeCheckBase(typeDeclAst: TypeDeclaration,
                              typeSymbol: PullTypeSymbol, baseDeclAST: AST,
                              isExtendedType: boolean,
                              typeCheckContext: PullTypeCheckContext) {

            var typeDecl = typeCheckContext.semanticInfo.getDeclForAST(typeDeclAst);
            var contextForBaseTypeResolution = new PullTypeResolutionContext();
            contextForBaseTypeResolution.isResolvingClassExtendedType = true;
            var baseType = this.resolver.resolveTypeReference(new TypeReference(baseDeclAST, 0), typeDecl, contextForBaseTypeResolution);
            contextForBaseTypeResolution.isResolvingClassExtendedType = false;

            var typeDeclIsClass = typeSymbol.isClass();

            if (!typeSymbol.isValidBaseKind(baseType, isExtendedType)) {
                // Report error about invalid base kind
                if (baseType.isError()) {
                    var error = (<PullErrorTypeSymbol>baseType).getDiagnostic();
                    this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, error.diagnosticKey(), error.arguments(), typeCheckContext.getEnclosingDecl());
                } else if (isExtendedType) {
                    if (typeDeclIsClass) {
                        this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, "A class may only extend another class.", null, typeCheckContext.getEnclosingDecl());
                    } else {
                        this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, "An interface may only extend another class or interface.", null, typeCheckContext.getEnclosingDecl());
                    }
                } else {
                    this.postError(baseDeclAST.minChar, baseDeclAST.getLength(), typeCheckContext.scriptName, "A class may only implement another class or interface.", null, typeCheckContext.getEnclosingDecl());
                }
                return;
            }

            // Check if its a recursive extend/implement type
            if (baseType.hasBase(typeSymbol)) {
                // Report error
                this.postError(typeDeclAst.name.minChar,
                    typeDeclAst.name.getLength(),
                    typeCheckContext.scriptName,
                    typeDeclIsClass ? "Class '{0}' is recursively referenced as a base type of itself." : "Interface '{0}' is recursively referenced as a base type of itself.", [typeSymbol.getScopedName()],
                    typeCheckContext.getEnclosingDecl());
                return;
            }

            if (isExtendedType) {
                // Verify all own overriding members are subtype
                this.typeCheckIfTypeExtendsType(typeDeclAst, typeSymbol, baseType, typeCheckContext);
            } else {
                // If class implementes interface or class, verify all the public members are implemented
                this.typeCheckIfClassImplementsType(typeDeclAst, typeSymbol, baseType, typeCheckContext);
            }

            // Privacy error:
            this.checkTypePrivacy(typeSymbol, baseType, (errorTypeSymbol: PullTypeSymbol) =>
                this.baseListPrivacyErrorReporter(typeDeclAst, typeSymbol, baseDeclAST, isExtendedType, errorTypeSymbol, typeCheckContext));
        }

        private typeCheckBases(typeDeclAst: TypeDeclaration, typeSymbol: PullTypeSymbol, typeCheckContext: PullTypeCheckContext) {
            if (!typeDeclAst.extendsList && !typeDeclAst.implementsList) {
                return;
            }

            for (var i = 0; i < typeDeclAst.extendsList.members.length; i++) {
                this.typeCheckBase(typeDeclAst, typeSymbol, typeDeclAst.extendsList.members[i], true, typeCheckContext);
            }
            if (typeSymbol.isClass()) {
                for (var i = 0; i < typeDeclAst.implementsList.members.length; i++) {
                    this.typeCheckBase(typeDeclAst, typeSymbol, typeDeclAst.implementsList.members[i], false, typeCheckContext);
                }
            } else if (typeDeclAst.implementsList) {
                this.postError(typeDeclAst.implementsList.minChar, typeDeclAst.implementsList.getLength(), typeCheckContext.scriptName, "An interface cannot implement another type.", null, typeCheckContext.getEnclosingDecl());
            }
        }

        // Classes
        // validate:
        //  - mutually recursive base classes
        //  - duplicate implemented interfaces
        //  - mutually recursive type parameters
        //  - bases are interfaces or classes
        //  - properties satisfy implemented interfaces
        //  - properties of base class and implemented interfaces agree
        //  - type of overridden member is subtype of original
        //  - method does not overrided field, or vice-versa
        //  - body members
        private typeCheckClass(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var classAST = <ClassDeclaration>ast;
            // resolving the class also resolves its members...
            var classSymbol = <PullClassTypeSymbol>this.resolver.resolveAST(ast, false, typeCheckContext.getEnclosingDecl(), this.context).getType();
            this.checkForResolutionError(classSymbol, typeCheckContext.getEnclosingDecl());

            var classDecl = typeCheckContext.semanticInfo.getDeclForAST(classAST);
            typeCheckContext.pushEnclosingDecl(classDecl);

            this.typeCheckAST(classAST.members, typeCheckContext);

            typeCheckContext.popEnclosingDecl();
            this.typeCheckBases(classAST, classSymbol, typeCheckContext);

            return classSymbol;
        }

        // Interfaces
        // validate:
        //  - mutually recursive bases
        //  - duplicate implemented or extended interfaces
        //  - mutually recursive type parameters
        //  - properties of extended interfaces do not conflict
        //  - bases are interfaces or classes
        //  - declarations agree in generic parameters 
        private typeCheckInterface(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var interfaceAST = <InterfaceDeclaration>ast;
            // resolving the interface also resolves its members...
            var interfaceType = this.resolver.resolveAST(ast, false, typeCheckContext.getEnclosingDecl(), this.context).getType();
            this.checkForResolutionError(interfaceType, typeCheckContext.getEnclosingDecl());

            var interfaceDecl = typeCheckContext.semanticInfo.getDeclForAST(interfaceAST);
            typeCheckContext.pushEnclosingDecl(interfaceDecl);

            this.typeCheckAST(interfaceAST.members, typeCheckContext);

            typeCheckContext.popEnclosingDecl();
            this.typeCheckBases(<InterfaceDeclaration>ast, interfaceType, typeCheckContext);

            return interfaceType;
        }

        // Modules
        // validate:
        //  - No type parameters?
        private typeCheckModule(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {

            // we resolve here because resolving a module *does not* resolve its MemberScopeContext
            // PULLREVIEW: Perhaps it should?
            var moduleDeclAST = <ModuleDeclaration>ast;
            var moduleType = <PullTypeSymbol>this.resolver.resolveAST(ast, false, typeCheckContext.getEnclosingDecl(), this.context);

            this.checkForResolutionError(moduleType, typeCheckContext.getEnclosingDecl());

            var moduleDecl = typeCheckContext.semanticInfo.getDeclForAST(moduleDeclAST);
            typeCheckContext.pushEnclosingDecl(moduleDecl);

            this.typeCheckAST(moduleDeclAST.members, typeCheckContext);

            this.validateVariableDeclarationGroups(moduleDecl, typeCheckContext);

            typeCheckContext.popEnclosingDecl();

            return moduleType;
        }

        private checkAssignability(ast: AST, source: PullTypeSymbol, target: PullTypeSymbol, typeCheckContext: PullTypeCheckContext): void {
            var comparisonInfo = new TypeComparisonInfo();

            var isAssignable = this.resolver.sourceIsAssignableToTarget(source, target, this.context, comparisonInfo);

            if (!isAssignable) {
                var enclosingDecl = typeCheckContext.getEnclosingDecl();
                if (comparisonInfo.message) {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}':{NL}{2}", [source.toString(), target.toString(), comparisonInfo.message], enclosingDecl);
                } else {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}'.", [source.toString(), target.toString()], enclosingDecl);
                }
            }
        }

        private isValidLHS(ast: AST, expressionSymbol: PullSymbol, isEnumInitializer: boolean): boolean {
            var expressionTypeSymbol = expressionSymbol.getType();

            return isEnumInitializer ||
                ast.nodeType === NodeType.ElementAccessExpression ||
                this.resolver.isAnyOrEquivalent(expressionTypeSymbol) ||
                ((!expressionSymbol.isType() || expressionTypeSymbol.isArray()) &&
                (expressionSymbol.getKind() & PullElementKind.SomeLHS) != 0);
        }

        // expressions

        // Assignment
        // validate:
        //  - lhs and rhs types agree
        //  - lhs is a valid value type
        private typeCheckAssignment(binaryExpression: BinaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            this.typeCheckAST(binaryExpression.operand1, typeCheckContext, false);

            var leftExpr = this.resolver.resolveAST(binaryExpression.operand1, false, typeCheckContext.getEnclosingDecl(), this.context);
            var leftType = leftExpr.getType();
            this.checkForResolutionError(leftType, enclosingDecl);
            leftType = this.resolver.widenType(leftExpr.getType()); //this.typeCheckAST(assignmentAST.operand1, typeCheckContext);

            this.context.pushContextualType(leftType, this.context.inProvisionalResolution(), null);
            var rightType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand2, typeCheckContext, true));
            this.context.popContextualType();

            // Check if LHS is a valid target
            if (!this.isValidLHS(binaryExpression.operand1, leftExpr, hasFlag(binaryExpression.getFlags(), ASTFlags.EnumInitializer))) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "Invalid left-hand side of assignment expression.", null, enclosingDecl);
            }

            this.checkAssignability(binaryExpression.operand1, rightType, leftType, typeCheckContext);
            return leftType;
        }

        // Generic Type references
        // validate:
        //
        private typeCheckGenericType(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            // validate:
            //  - mutually recursive type parameters and constraints
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var genericType = this.resolver.resolveAST(ast, false, enclosingDecl, this.context).getType();
            this.checkForResolutionError(genericType, enclosingDecl);

            return genericType;
        }

        // Object literals
        // validate:
        //
        private typeCheckObjectLiteral(ast: AST, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment = false): PullTypeSymbol {
            var objectLitAST = <UnaryExpression>ast;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            // PULLTODO: We're really resolving these expressions twice - need a better way...
            var objectLitType = this.resolver.resolveAST(ast, inContextuallyTypedAssignment, enclosingDecl, this.context).getType();
            var memberDecls = <ASTList>objectLitAST.operand;

            var contextualType = this.context.getContextualType();
            var memberType: PullTypeSymbol;


            // PULLTODO: Contextually type the members
            if (memberDecls) {
                var member: PullSymbol = null;

                for (var i = 0; i < memberDecls.members.length; i++) {
                    var binex = <BinaryExpression>memberDecls.members[i];

                    if (contextualType) {
                        var text: string;
                        if (binex.operand1.nodeType === NodeType.Name) {
                            text = (<Identifier>binex.operand1).text;
                        }
                        else if (binex.operand1.nodeType === NodeType.StringLiteral) {
                            text = (<StringLiteral>binex.operand1).text;
                        }

                        member = contextualType.findMember(text);

                        if (member) {
                            this.context.pushContextualType(member.getType(), this.context.inProvisionalResolution(), null);
                        }
                    }

                    this.typeCheckAST(binex.operand2, typeCheckContext, member != null);

                    if (member) {
                        this.context.popContextualType();
                        member = null;
                    }
                }
            }

            this.checkForResolutionError(objectLitType, enclosingDecl);

            return objectLitType;
        }

        // Array literals
        // validate:
        //  - incompatible types in expression
        private typeCheckArrayLiteral(ast: AST, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment = false): PullTypeSymbol {
            var arrayLiteralAST = <UnaryExpression>ast;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            // PULLTODO: We're really resolving these expressions twice - need a better way...
            var type = this.resolver.resolveAST(ast, inContextuallyTypedAssignment, enclosingDecl, this.context).getType();
            var memberASTs = <ASTList>arrayLiteralAST.operand;

            // Find the contextual member type
            var contextualType = this.context.getContextualType();
            var contextualMemberType: PullTypeSymbol = null;
            if (contextualType && contextualType.isArray()) {
                contextualMemberType = contextualType.getElementType();
            }

            if (memberASTs && memberASTs.members && memberASTs.members.length) {
                var elementTypes: PullTypeSymbol[] = [];

                if (contextualMemberType) {
                    this.context.pushContextualType(contextualMemberType, this.context.inProvisionalResolution(), null);
                }

                for (var i = 0; i < memberASTs.members.length; i++) {
                    elementTypes[elementTypes.length] = this.typeCheckAST(memberASTs.members[i], typeCheckContext, /*inContextuallyTypedAssignment*/ false);
                }

                if (contextualMemberType) {
                    this.context.popContextualType();

                    // Check if all array members match the contextual Type
                    var collection: IPullTypeCollection = {
                        getLength: () => { return elementTypes.length; } ,
                        setTypeAtIndex: (index: number, type: PullTypeSymbol) => { elementTypes[index] = type; } ,
                        getTypeAtIndex: (index: number) => { return elementTypes[index]; }
                    };

                    var comparisonInfo = new TypeScript.TypeComparisonInfo();
                    var elementType = this.resolver.findBestCommonType(elementTypes[0], contextualMemberType, collection, false, this.context, comparisonInfo);
                    if (!elementType) {
                        this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "Type of array literal cannot be determined. Best common type could not be found for array elements.", null, enclosingDecl);
                    }
                }
            }

            this.checkForResolutionError(type, enclosingDecl);

            return type;
        }

        private enclosingClassIsDerived(typeCheckContext: PullTypeCheckContext): boolean {
            var enclosingClass = typeCheckContext.getEnclosingDecl(PullElementKind.Class);

            if (enclosingClass) {
                var classSymbol = <PullClassTypeSymbol>enclosingClass.getSymbol();
                if (classSymbol.getExtendedTypes().length > 0) {
                    return true;
                }
            }

            return false;
        }

        private isSuperCallNode(node: AST): boolean {
            if (node && node.nodeType === NodeType.ExpressionStatement) {
                var expressionStatement = <ExpressionStatement>node;
                if (expressionStatement.expression && expressionStatement.expression.nodeType === NodeType.InvocationExpression) {
                    var callExpression = <CallExpression>expressionStatement.expression;
                    if (callExpression.target && callExpression.target.nodeType === NodeType.SuperExpression) {
                        return true;
                    }
                }
            }
            return false;
        }

        private getFirstStatementFromFunctionDeclAST(funcDeclAST: FunctionDeclaration): AST {
            if (funcDeclAST.block && funcDeclAST.block.statements && funcDeclAST.block.statements.members) {
                return funcDeclAST.block.statements.members[0];
            }

            return null;
        }

        private superCallMustBeFirstStatementInConstructor(enclosingConstructor: PullDecl, enclosingClass: PullDecl): boolean {
            /*
            The first statement in the body of a constructor must be a super call if both of the following are true:
                �	The containing class is a derived class.
                �	The constructor declares parameter properties or the containing class declares instance member variables with initializers.
            In such a required super call, it is a compile-time error for argument expressions to reference this.
            */
            if (enclosingConstructor && enclosingClass) {
                var classSymbol = <PullClassTypeSymbol>enclosingClass.getSymbol();
                if (classSymbol.getExtendedTypes().length === 0) {
                    return false;
                }

                var classMembers = classSymbol.getMembers();
                for (var i = 0, n1 = classMembers.length; i < n1; i++) {
                    var member = classMembers[i];

                    if (member.getKind() === PullElementKind.Property) {
                        var declarations = member.getDeclarations();
                        for (var j = 0, n2 = declarations.length; j < n2; j++) {
                            var declaration = declarations[j];
                            var ast = this.semanticInfoChain.getASTForDecl(declaration);
                            if (ast.nodeType === NodeType.Parameter) {
                                return true;
                            }

                            if (ast.nodeType === NodeType.VariableDeclarator) {
                                var variableDeclarator = <VariableDeclarator>ast;
                                if (variableDeclarator.init) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            return false;
        }

        private checkForThisCaptureInArrowFunction(thisExpressionAST: ThisExpression, typeCheckContext: PullTypeCheckContext): void {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var declPath: PullDecl[] = typeCheckContext.enclosingDeclStack;

            // work back up the decl path, until you can find a class
            // PULLTODO: Obviously not completely correct, but this sufficiently unblocks testing of the pull model
            if (declPath.length) {
                var inFatArrow = false;
                for (var i = declPath.length - 1; i >= 0; i--) {
                    var decl = declPath[i];
                    var declKind = decl.getKind();
                    var declFlags = decl.getFlags();

                    if (declKind === PullElementKind.FunctionExpression &&
                        hasFlag(declFlags, PullElementFlags.FatArrow)) {

                        inFatArrow = true;
                        continue;
                    }

                    if (inFatArrow) {
                        if (declKind === PullElementKind.Function ||
                            declKind === PullElementKind.Method ||
                            declKind === PullElementKind.ConstructorMethod ||
                            declKind === PullElementKind.GetAccessor ||
                            declKind === PullElementKind.SetAccessor ||
                            declKind === PullElementKind.FunctionExpression ||
                            declKind === PullElementKind.Class ||
                            declKind === PullElementKind.Container ||
                            declKind === PullElementKind.DynamicModule ||
                            declKind === PullElementKind.Script) {

                            decl.setFlags(decl.getFlags() | PullElementFlags.MustCaptureThis);

                            // If we're accessing 'this' in a class, then the class constructor 
                            // needs to be marked as capturing 'this'.
                            if (declKind === PullElementKind.Class) {
                                decl.getChildDecls().filter(d => d.getKind() === PullElementKind.ConstructorMethod)
                                    .map(d => d.setFlags(d.getFlags() | PullElementFlags.MustCaptureThis));
                            }
                            break;
                        }
                    }
                }
            }
        }

        // 'This' expressions 
        // validate:
        //
        private typeCheckThisExpression(thisExpressionAST: ThisExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var enclosingNonLambdaDecl = typeCheckContext.getEnclosingNonLambdaDecl();

            if (typeCheckContext.inSuperConstructorCall &&
                this.superCallMustBeFirstStatementInConstructor(typeCheckContext.getEnclosingDecl(PullElementKind.ConstructorMethod), typeCheckContext.getEnclosingDecl(PullElementKind.Class))) {

                this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, "'this' cannot be referenced in current location.", null, enclosingDecl);
            }
            else if (enclosingNonLambdaDecl) {
                if (enclosingNonLambdaDecl.getKind() === PullElementKind.Class) {
                    this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, "'this' cannot be referenced in initializers in a class body.", null, enclosingDecl);
                }
                else if (enclosingNonLambdaDecl.getKind() === PullElementKind.Container || enclosingNonLambdaDecl.getKind() === PullElementKind.DynamicModule) {
                    this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, "'this' cannot be referenced within module bodies.", null, enclosingDecl);
                }
                else if (typeCheckContext.inConstructorArguments) {
                    this.postError(thisExpressionAST.minChar, thisExpressionAST.getLength(), typeCheckContext.scriptName, "'this' cannot be referenced in constructor arguments.", null, enclosingDecl);
                }
            }

            this.checkForThisCaptureInArrowFunction(thisExpressionAST, typeCheckContext);

            var type = this.resolver.resolveAST(thisExpressionAST, false, enclosingDecl, this.context).getType();
            this.checkForResolutionError(type, enclosingDecl);
            return type;
        }

        // 'Super' expressions 
        // validate:
        //
        private typeCheckSuper(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var nonLambdaEnclosingDecl = typeCheckContext.getEnclosingNonLambdaDecl();
            var nonLambdaEnclosingDeclKind = nonLambdaEnclosingDecl.getKind();
            var inSuperConstructorTarget = typeCheckContext.inSuperConstructorTarget;

            var type = this.resolver.resolveAST(ast, false, enclosingDecl, this.context).getType();

            // Super calls are not permitted outside constructors or in local functions inside constructors.
            if (inSuperConstructorTarget && enclosingDecl.getKind() !== PullElementKind.ConstructorMethod) {
                this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "Super calls are not permitted outside constructors or in local functions inside constructors.", null, enclosingDecl);
            }
            // A super property access is permitted only in a constructor, instance member function, or instance member accessor
            else if ((nonLambdaEnclosingDeclKind !== PullElementKind.Method && nonLambdaEnclosingDeclKind !== PullElementKind.GetAccessor && nonLambdaEnclosingDeclKind !== PullElementKind.SetAccessor && nonLambdaEnclosingDeclKind !== PullElementKind.ConstructorMethod) ||
                ((nonLambdaEnclosingDecl.getFlags() & PullElementFlags.Static) !== 0)) {
                this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "'super' property access is permitted only in a constructor, instance member function, or instance member accessor of a derived class.", null, enclosingDecl);
            }
            // A super is permitted only in a derived class 
            else if (!this.enclosingClassIsDerived(typeCheckContext)) {
                this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "'super' cannot be referenced in non-derived classes.", null, enclosingDecl);
            }

            this.checkForResolutionError(type, enclosingDecl);
            return type;
        }

        // Call expressions 
        // validate:
        //
        private typeCheckCallExpression(callExpression: CallExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            // "use of new expression as a statement"
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var inSuperConstructorCall = (callExpression.target.nodeType === NodeType.SuperExpression);

            var callResolutionData = new PullAdditionalCallResolutionData();
            var resultType = this.resolver.resolveCallExpression(callExpression, false, enclosingDecl, this.context, callResolutionData).getType();

            this.checkForResolutionError(resultType, enclosingDecl);

            // Type check the target
            if (!resultType.isError()) {
                var savedInSuperConstructorTarget = typeCheckContext.inSuperConstructorTarget;
                if (inSuperConstructorCall) {
                    typeCheckContext.inSuperConstructorTarget = true;
                }

                this.typeCheckAST(callExpression.target, typeCheckContext);

                typeCheckContext.inSuperConstructorTarget = savedInSuperConstructorTarget;
            }

            if (inSuperConstructorCall && enclosingDecl.getKind() === PullElementKind.ConstructorMethod) {
                typeCheckContext.seenSuperConstructorCall = true;
            }

            // Type check the arguments
            var savedInSuperConstructorCall = typeCheckContext.inSuperConstructorCall;
            if (inSuperConstructorCall) {
                typeCheckContext.inSuperConstructorCall = true;
            }

            // Apply contextual typing
            var contextTypes = callResolutionData.actualParametersContextTypeSymbols;
            if (callExpression.arguments) {
                var argumentASTs = callExpression.arguments.members;
                for (var i = 0, n = argumentASTs.length; i < n; i++) {
                    var argumentAST = argumentASTs[i];

                    if (contextTypes && contextTypes[i]) {
                        this.context.pushContextualType(contextTypes[i], this.context.inProvisionalResolution(), null);
                    }

                    this.typeCheckAST(argumentAST, typeCheckContext);

                    if (contextTypes && contextTypes[i]) {
                        this.context.popContextualType();
                    }
                }
            }

            typeCheckContext.inSuperConstructorCall = savedInSuperConstructorCall;

            return resultType;
        }

        // 'New' expressions 
        // validate:
        //
        private typeCheckObjectCreationExpression(callExpression: CallExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var callResolutionData = new PullAdditionalCallResolutionData();
            var resultType = this.resolver.resolveNewExpression(callExpression, false, enclosingDecl, this.context, callResolutionData).getType();

            this.checkForResolutionError(resultType, enclosingDecl);

            this.typeCheckAST(callExpression.target, typeCheckContext);
            this.typeCheckAST(callExpression.typeArguments, typeCheckContext);

            // Type check the arguments
            var contextTypes = callResolutionData.actualParametersContextTypeSymbols;
            if (callExpression.arguments) {
                var argumentASTs = callExpression.arguments.members;
                for (var i = 0, n = argumentASTs.length; i < n; i++) {
                    var argumentAST = argumentASTs[i];

                    if (contextTypes && contextTypes[i]) {
                        this.context.pushContextualType(contextTypes[i], this.context.inProvisionalResolution(), null);
                    }

                    this.typeCheckAST(argumentAST, typeCheckContext);

                    if (contextTypes && contextTypes[i]) {
                        this.context.popContextualType();
                    }
                }
            }

            return resultType;
        }

        // Type assertion expressions 
        // validate:
        //  - the type assertion and the expression it's applied to are assignment compatible
        private typeCheckTypeAssertion(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var returnType = this.resolver.resolveAST(ast, false, enclosingDecl, this.context).getType();

            this.checkForResolutionError(returnType, enclosingDecl);

            this.context.pushContextualType(returnType, this.context.inProvisionalResolution(), null);
            var exprType = this.typeCheckAST((<UnaryExpression>ast).operand, typeCheckContext, true);
            this.context.popContextualType();

            var comparisonInfo = new TypeComparisonInfo();
            var isAssignable = this.resolver.sourceIsAssignableToTarget(returnType, exprType, this.context, comparisonInfo) ||
                this.resolver.sourceIsAssignableToTarget(exprType, returnType, this.context, comparisonInfo);

            if (!isAssignable) {
                var message: string;
                if (comparisonInfo.message) {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}':{NL}{2}", [exprType.toString(), returnType.toString(), comparisonInfo.message], typeCheckContext.getEnclosingDecl());
                } else {
                    this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}'.", [exprType.toString(), returnType.toString()], typeCheckContext.getEnclosingDecl());
                }
            }

            return returnType;
        }

        // Logical operations
        // validate:
        //  - lhs and rhs are compatible
        private typeCheckLogicalOperation(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var binex = <BinaryExpression>ast;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var type = this.resolver.resolveAST(ast, false, typeCheckContext.getEnclosingDecl(), this.context).getType();

            this.checkForResolutionError(type, enclosingDecl);

            var leftType = this.typeCheckAST(binex.operand1, typeCheckContext);
            var rightType = this.typeCheckAST(binex.operand2, typeCheckContext);

            var comparisonInfo = new TypeComparisonInfo();
            if (!this.resolver.sourceIsAssignableToTarget(leftType, rightType, this.context, comparisonInfo) &&
                !this.resolver.sourceIsAssignableToTarget(rightType, leftType, this.context, comparisonInfo)) {

                this.postError(ast.minChar, ast.getLength(), typeCheckContext.scriptName,"Operator '{0}' cannot be applied to types '{1}' and '{2}'.", [BinaryExpression.getTextForBinaryToken(binex.nodeType), leftType.toString(), rightType.toString()], enclosingDecl);
            }
            return type;
        }

        // Logical 'And' and 'Or' expressions 
        // validate:
        // - lhs and rhs are compatible
        private typeCheckLogicalAndOrExpression(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var binex = <BinaryExpression>ast;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var type = this.resolver.resolveAST(ast, false, enclosingDecl, this.context).getType();

            this.checkForResolutionError(type, enclosingDecl);

            this.typeCheckAST(binex.operand1, typeCheckContext);
            this.typeCheckAST(binex.operand2, typeCheckContext);

            return type;
        }


        private typeCheckCommaExpression(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var binex = <BinaryExpression>ast;
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var type = this.resolver.resolveAST(ast, false, enclosingDecl, this.context).getType();

            this.checkForResolutionError(type, enclosingDecl);

            this.typeCheckAST(binex.operand1, typeCheckContext);
            this.typeCheckAST(binex.operand2, typeCheckContext);

            return type;
        }

        private typeCheckBinaryAdditionOperation(binaryExpression: BinaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var type = this.resolver.resolveAST(binaryExpression, false, enclosingDecl, this.context).getType();

            this.checkForResolutionError(type, enclosingDecl);

            var lhsType = this.typeCheckAST(binaryExpression.operand1, typeCheckContext);
            var rhsType = this.typeCheckAST(binaryExpression.operand2, typeCheckContext);

            if (lhsType.getKind() === PullElementKind.Enum) {
                lhsType = this.semanticInfoChain.numberTypeSymbol;
            }
            else if (lhsType === this.semanticInfoChain.nullTypeSymbol || lhsType === this.semanticInfoChain.undefinedTypeSymbol) {
                if (rhsType != this.semanticInfoChain.nullTypeSymbol && rhsType != this.semanticInfoChain.undefinedTypeSymbol) {
                    lhsType = rhsType;
                }
                else {
                    lhsType = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            if (rhsType.getKind() === PullElementKind.Enum) {
                rhsType = this.semanticInfoChain.numberTypeSymbol;
            }
            else if (rhsType === this.semanticInfoChain.nullTypeSymbol || rhsType === this.semanticInfoChain.undefinedTypeSymbol) {
                if (lhsType != this.semanticInfoChain.nullTypeSymbol && lhsType != this.semanticInfoChain.undefinedTypeSymbol) {
                    rhsType = lhsType;
                }
                else {
                    rhsType = this.semanticInfoChain.anyTypeSymbol;
                }
            }

            var exprType: PullTypeSymbol = null;

            if (lhsType === this.semanticInfoChain.stringTypeSymbol || rhsType === this.semanticInfoChain.stringTypeSymbol) {
                exprType = this.semanticInfoChain.stringTypeSymbol;
            }
            else if (this.resolver.isAnyOrEquivalent(lhsType) || this.resolver.isAnyOrEquivalent(rhsType)) {
                exprType = this.semanticInfoChain.anyTypeSymbol;
            }
            else if (rhsType === this.semanticInfoChain.numberTypeSymbol && lhsType === this.semanticInfoChain.numberTypeSymbol) {
                exprType = this.semanticInfoChain.numberTypeSymbol;
            }

            if (exprType) {
                if (binaryExpression.nodeType === NodeType.AddAssignmentExpression) {
                    // Check if LHS is a valid target
                    var lhsExpression = this.resolver.resolveAST(binaryExpression.operand1, false, typeCheckContext.getEnclosingDecl(), this.context);
                    if (!this.isValidLHS(binaryExpression.operand1, lhsExpression, hasFlag(binaryExpression.getFlags(), ASTFlags.EnumInitializer))) {
                        this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "Invalid left-hand side of assignment expression.", null, enclosingDecl);
                    }

                    this.checkAssignability(binaryExpression.operand1, exprType, lhsType, typeCheckContext);
                }
            }
            else {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "Invalid '+' expression - types not known to support the addition operator.", null, typeCheckContext.getEnclosingDecl());
                exprType = this.semanticInfoChain.anyTypeSymbol;
            }

            return exprType;
        }

        // Binary arithmetic expressions 
        // validate:
        //  - lhs and rhs are compatible
        private typeCheckBinaryArithmeticOperation(binaryExpression: BinaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var type = this.resolver.resolveAST(binaryExpression, false, enclosingDecl, this.context).getType();
            this.checkForResolutionError(type, enclosingDecl);

            var lhsType = this.typeCheckAST(binaryExpression.operand1, typeCheckContext);
            var rhsType = this.typeCheckAST(binaryExpression.operand2, typeCheckContext);

            var lhsIsFit = this.resolver.isAnyOrEquivalent(lhsType) || lhsType === this.semanticInfoChain.numberTypeSymbol || lhsType.getKind() === PullElementKind.Enum;
            var rhsIsFit = this.resolver.isAnyOrEquivalent(rhsType) || rhsType === this.semanticInfoChain.numberTypeSymbol || rhsType.getKind() === PullElementKind.Enum;

            if (!rhsIsFit) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "The right-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.", null, typeCheckContext.getEnclosingDecl());
            }

            if (!lhsIsFit) {
                this.postError(binaryExpression.operand2.minChar, binaryExpression.operand2.getLength(), typeCheckContext.scriptName, "The left-hand side of an arithmetic operation must be of type 'any', 'number' or an enum type.", null, typeCheckContext.getEnclosingDecl());
            }

            // If we havne't already reported an error, then check for assignment compatibility.
            if (rhsIsFit && lhsIsFit) {
                switch (binaryExpression.nodeType) {
                    case NodeType.LeftShiftAssignmentExpression:
                    case NodeType.SignedRightShiftAssignmentExpression:
                    case NodeType.UnsignedRightShiftAssignmentExpression:
                    case NodeType.SubtractAssignmentExpression:
                    case NodeType.MultiplyAssignmentExpression:
                    case NodeType.DivideAssignmentExpression:
                    case NodeType.ModuloAssignmentExpression:
                    case NodeType.OrAssignmentExpression:
                    case NodeType.AndAssignmentExpression:
                    case NodeType.ExclusiveOrAssignmentExpression:
                        // Check if LHS is a valid target
                        var lhsExpression = this.resolver.resolveAST(binaryExpression.operand1, false, typeCheckContext.getEnclosingDecl(), this.context);
                        if (!this.isValidLHS(binaryExpression.operand1, lhsExpression, hasFlag(binaryExpression.getFlags(), ASTFlags.EnumInitializer))) {
                            this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "Invalid left-hand side of assignment expression.", null, enclosingDecl);
                        }

                        this.checkAssignability(binaryExpression.operand1, rhsType, lhsType, typeCheckContext);
                        break;
                }
            }

            return this.semanticInfoChain.numberTypeSymbol;
        }

        private typeCheckLogicalNotExpression(unaryExpression: UnaryExpression, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment: boolean): PullTypeSymbol {
            this.typeCheckAST(unaryExpression.operand, typeCheckContext, inContextuallyTypedAssignment);
            return this.semanticInfoChain.booleanTypeSymbol;
        }

        // Unary arithmetic expressions 
        // validate:
        //  -
        private typeCheckUnaryArithmeticOperation(unaryExpression: UnaryExpression, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment: boolean): PullTypeSymbol {
            var operandType = this.typeCheckAST(unaryExpression.operand, typeCheckContext, inContextuallyTypedAssignment);

            switch (unaryExpression.nodeType) {
                case NodeType.PlusExpression:
                case NodeType.NegateExpression:
                case NodeType.BitwiseNotExpression:
                    return this.semanticInfoChain.numberTypeSymbol;
            }

            var operandIsFit = this.resolver.isAnyOrEquivalent(operandType) || operandType === this.semanticInfoChain.numberTypeSymbol || operandType.getKind() === PullElementKind.Enum;

            if (!operandIsFit) {
                this.postError(unaryExpression.operand.minChar, unaryExpression.operand.getLength(), typeCheckContext.scriptName, "The type of a unary arithmetic operation operand must be of type 'any', 'number' or an enum type.", null, typeCheckContext.getEnclosingDecl());
            }

            switch (unaryExpression.nodeType) {
                case NodeType.PostIncrementExpression:
                case NodeType.PreIncrementExpression:
                case NodeType.PostDecrementExpression:
                case NodeType.PreDecrementExpression:
                    // Check that operand is classified as a reference 
                    var expression = this.resolver.resolveAST(unaryExpression.operand, false, typeCheckContext.getEnclosingDecl(), this.context);
                    if (!this.isValidLHS(unaryExpression.operand, expression, false)) {
                        this.postError(unaryExpression.operand.minChar, unaryExpression.operand.getLength(), typeCheckContext.scriptName, "The operand of an increment or decrement operator must be a variable, property or indexer.", null, typeCheckContext.getEnclosingDecl());
                    }

                    break;
            }

            return operandType;
        }

        // Index expression 
        // validate:
        //  -
        private typeCheckElementAccessExpression(binaryExpression: BinaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(binaryExpression.operand1, typeCheckContext);
            this.typeCheckAST(binaryExpression.operand2, typeCheckContext);

            var type = this.resolver.resolveAST(binaryExpression, false, typeCheckContext.getEnclosingDecl(), this.context).getType();
            this.checkForResolutionError(type, typeCheckContext.getEnclosingDecl());
            return type;
        }

        // 'typeof' expression 
        // validate:
        //  -
        private typeCheckTypeOf(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST((<UnaryExpression>ast).operand, typeCheckContext);

            return this.semanticInfoChain.stringTypeSymbol;
        }

        // Type reference expression
        // validate:
        //  -
        private typeCheckTypeReference(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var type = this.resolver.resolveAST(ast, false, typeCheckContext.getEnclosingDecl(), this.context).getType();
            this.checkForResolutionError(type, typeCheckContext.getEnclosingDecl());
            return type;
        }

        // Conditional expressions
        // validate:
        //  -
        private typeCheckConditionalExpression(conditionalExpression: ConditionalExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(conditionalExpression.operand1, typeCheckContext);
            this.typeCheckAST(conditionalExpression.operand2, typeCheckContext);
            this.typeCheckAST(conditionalExpression.operand3, typeCheckContext);

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var type = this.resolver.resolveAST(conditionalExpression, false, enclosingDecl, this.context).getType();
            this.checkForResolutionError(type, enclosingDecl);

            return type;
        }

        // new expression types
        private typeCheckThrowStatement(throwStatement: ThrowStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(throwStatement.expression, typeCheckContext);

            var type = this.resolver.resolveAST(throwStatement.expression, false, typeCheckContext.getEnclosingDecl(), this.context).getType();
            this.checkForResolutionError(type, typeCheckContext.getEnclosingDecl());
            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckDeleteExpression(unaryExpression: UnaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(unaryExpression.operand, typeCheckContext);

            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var type = this.resolver.resolveAST(unaryExpression, false, enclosingDecl, this.context).getType();
            this.checkForResolutionError(type, enclosingDecl);

            return type;
        }

        private typeCheckVoidExpression(unaryExpression: UnaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(unaryExpression.operand, typeCheckContext);

            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var type = this.resolver.resolveAST(unaryExpression, false, enclosingDecl, this.context).getType();
            this.checkForResolutionError(type, enclosingDecl);

            return type;
        }

        private typeCheckRegExpExpression(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var type = this.resolver.resolveStatementOrExpression(ast, false, typeCheckContext.getEnclosingDecl(), this.context).getType();
            this.checkForResolutionError(type, typeCheckContext.getEnclosingDecl());
            return type;
        }

        // statements

        private typeCheckForStatement(forStatement: ForStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(forStatement.init, typeCheckContext);
            this.typeCheckAST(forStatement.cond, typeCheckContext);
            this.typeCheckAST(forStatement.body, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckForInStatement(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {

            var forInStatement = <ForInStatement>ast;

            var rhsType = this.resolver.widenType(this.typeCheckAST(forInStatement.obj, typeCheckContext));
            var lval = forInStatement.lval;

            if (lval.nodeType === NodeType.VariableDeclaration) {
                var declaration = <VariableDeclaration>forInStatement.lval;
                var varDecl = <VariableDeclarator>declaration.declarators.members[0];

                if (varDecl.typeExpr) {
                    this.postError(lval.minChar, lval.getLength(), typeCheckContext.scriptName, "Variable declarations for for/in expressions cannot contain a type annotation.", null, typeCheckContext.getEnclosingDecl());
                }
            }

            var varSym = this.resolver.resolveAST(forInStatement.lval, false, typeCheckContext.getEnclosingDecl(), this.context);
            this.checkForResolutionError(varSym.getType(), typeCheckContext.getEnclosingDecl());

            var isStringOrNumber = varSym.getType() === this.semanticInfoChain.stringTypeSymbol || this.resolver.isAnyOrEquivalent(varSym.getType());

            var isValidRHS = rhsType && (this.resolver.isAnyOrEquivalent(rhsType) || !rhsType.isPrimitive());

            if (!isStringOrNumber) {
                this.postError(lval.minChar, lval.getLength(), typeCheckContext.scriptName, "Variable declarations for for/in expressions must be of types 'string' or 'any'.", null, typeCheckContext.getEnclosingDecl());
            }

            if (!isValidRHS) {
                this.postError(forInStatement.obj.minChar, forInStatement.obj.getLength(), typeCheckContext.scriptName, "The right operand of a for/in expression must be of type 'any', an object type or a type parameter.", null, typeCheckContext.getEnclosingDecl());
            }

            this.typeCheckAST(forInStatement.body, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckInExpression(binaryExpression: BinaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var lhsType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand1, typeCheckContext));
            var rhsType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand2, typeCheckContext));

            var isStringAnyOrNumber = lhsType.getType() === this.semanticInfoChain.stringTypeSymbol ||
                                        this.resolver.isAnyOrEquivalent(lhsType.getType()) ||
                                        this.resolver.isNumberOrEquivalent(lhsType.getType());
            var isValidRHS = rhsType && (this.resolver.isAnyOrEquivalent(rhsType) || !rhsType.isPrimitive());

            if (!isStringAnyOrNumber) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "The left-hand side of an 'in' expression must be of types 'string' or 'any'.", null, typeCheckContext.getEnclosingDecl());
            }

            if (!isValidRHS) {

                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "The right-hand side of an 'in' expression must be of type 'any', an object type or a type parameter.", null, typeCheckContext.getEnclosingDecl());
            }

            return this.semanticInfoChain.booleanTypeSymbol;
        }

        private typeCheckInstanceOfExpression(binaryExpression: BinaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var lhsType = this.resolver.widenType(this.typeCheckAST(binaryExpression.operand1, typeCheckContext));
            var rhsType = this.typeCheckAST(binaryExpression.operand2, typeCheckContext);

            var isValidLHS = lhsType && (this.resolver.isAnyOrEquivalent(lhsType) || !lhsType.isPrimitive());
            var isValidRHS = rhsType && (this.resolver.isAnyOrEquivalent(rhsType) || rhsType.isClass() || this.resolver.typeIsSubtypeOfFunction(rhsType, this.context))

            if (!isValidLHS) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "The left-hand side of an 'instanceOf' expression must be of type 'any', an object type or a type parameter.", null, typeCheckContext.getEnclosingDecl());
            }

            if (!isValidRHS) {
                this.postError(binaryExpression.operand1.minChar, binaryExpression.operand1.getLength(), typeCheckContext.scriptName, "The right-hand side of an 'instanceOf' expression must be of type 'any' or a subtype of the 'Function' interface type.", null, typeCheckContext.getEnclosingDecl());
            }

            return this.semanticInfoChain.booleanTypeSymbol;
        }

        private typeCheckParenthesizedExpression(parenthesizedExpression: ParenthesizedExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            return this.typeCheckAST(parenthesizedExpression.expression, typeCheckContext);
        }

        private typeCheckWhileStatement(whileStatement: WhileStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(whileStatement.cond, typeCheckContext);
            this.typeCheckAST(whileStatement.body, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckDoStatement(doStatement: DoStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(doStatement.cond, typeCheckContext);
            this.typeCheckAST(doStatement.body, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckIfStatement(ifStatement: IfStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(ifStatement.cond, typeCheckContext);
            this.typeCheckAST(ifStatement.thenBod, typeCheckContext);
            this.typeCheckAST(ifStatement.elseBod, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckBlock(block: Block, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(block.statements, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckVariableDeclaration(variableDeclaration: VariableDeclaration, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(variableDeclaration.declarators, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckVariableStatement(variableStatement: VariableStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(variableStatement.declaration, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckWithStatement(withStatement: WithStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.postError(withStatement.expr.minChar, withStatement.expr.getLength(), typeCheckContext.scriptName, "All symbols within a with block will be resolved to 'any'.", null, typeCheckContext.getEnclosingDecl());

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckTryStatement(tryStatement: TryStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(tryStatement.tryBody, typeCheckContext);
            this.typeCheckAST(tryStatement.catchClause, typeCheckContext);
            this.typeCheckAST(tryStatement.finallyBody, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckCatchClause(catchClause: CatchClause, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var catchDecl = this.resolver.getDeclForAST(catchClause);

            typeCheckContext.pushEnclosingDecl(catchDecl);
            this.typeCheckAST(catchClause.body, typeCheckContext);
            typeCheckContext.popEnclosingDecl();

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckReturnStatement(returnAST: ReturnStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            typeCheckContext.setEnclosingDeclHasReturn();
            var returnExpr = returnAST.returnExpression;
            var returnType = this.typeCheckAST(returnExpr, typeCheckContext);

            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            if (enclosingDecl.getKind() === PullElementKind.SetAccessor && returnExpr) {
                this.postError(returnExpr.minChar, returnExpr.getLength(), typeCheckContext.scriptName, "Setters cannot return a value.", null, typeCheckContext.getEnclosingDecl());
            }

            if (enclosingDecl.getKind() & PullElementKind.SomeFunction) {
                var signatureSymbol = enclosingDecl.getSignatureSymbol();
                var sigReturnType = signatureSymbol.getReturnType();

                if (returnType && sigReturnType) {
                    var comparisonInfo = new TypeComparisonInfo();
                    var upperBound: PullTypeSymbol = null;

                    if (returnType.isTypeParameter()) {
                        upperBound = (<PullTypeParameterSymbol>returnType).getConstraint();

                        if (upperBound) {
                            returnType = upperBound;
                        }
                    }

                    if (sigReturnType.isTypeParameter()) {
                        upperBound = (<PullTypeParameterSymbol>sigReturnType).getConstraint();

                        if (upperBound) {
                            sigReturnType = upperBound;
                        }
                    }

                    if (!returnType.isResolved()) {
                        this.resolver.resolveDeclaredSymbol(returnType, enclosingDecl, this.context);
                    }

                    if (!sigReturnType.isResolved()) {
                        this.resolver.resolveDeclaredSymbol(sigReturnType, enclosingDecl, this.context);
                    }

                    var isAssignable = this.resolver.sourceIsAssignableToTarget(returnType, sigReturnType, this.context, comparisonInfo);

                    if (!isAssignable) {
                        if (comparisonInfo.message) {
                            this.postError(returnExpr.minChar, returnExpr.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}':{NL}{2}", [returnType.toString(), sigReturnType.toString(), comparisonInfo.message], enclosingDecl);
                        } else {
                            this.postError(returnExpr.minChar, returnExpr.getLength(), typeCheckContext.scriptName, "Cannot convert '{0}' to '{1}'.", [returnType.toString(), sigReturnType.toString()], enclosingDecl);
                        }
                    }
                }
            }

            return returnType;
        }

        private typeCheckNameExpression(ast: AST, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var type = this.resolver.resolveNameExpression(<Identifier>ast, enclosingDecl, this.context).getType();
            this.checkForResolutionError(type, enclosingDecl);
            return type;
        }

        private typeCheckMemberAccessExpression(memberAccessExpression: BinaryExpression, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {

            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var resolvedName = this.resolver.resolveDottedNameExpression(memberAccessExpression, enclosingDecl, this.context);
            var type = resolvedName.getType();
            this.checkForResolutionError(type, enclosingDecl);
            var prevCanUseTypeSymbol = this.context.canUseTypeSymbol;
            this.context.canUseTypeSymbol = true;
            var expressionType = this.typeCheckAST(memberAccessExpression.operand1, typeCheckContext);
            this.context.canUseTypeSymbol = prevCanUseTypeSymbol;
            if (resolvedName && resolvedName.hasFlag(PullElementFlags.Private)) {
                var memberContainer = resolvedName.getContainer();
                if (memberContainer && memberContainer.getKind() === PullElementKind.ConstructorType) {
                    memberContainer = memberContainer.getAssociatedContainerType();
                }

                if (memberContainer && memberContainer.isClass()) {
                    // We're accessing a private member of a class.  We can only do that if we're 
                    // actually contained within that class.
                    var containingClass = typeCheckContext.getEnclosingClassDecl();
                    if (!containingClass || containingClass.getSymbol() !== memberContainer) {
                        var name = <Identifier>memberAccessExpression.operand2;
                        this.postError(name.minChar, name.getLength(), typeCheckContext.scriptName, "'{0}.{1}' is inaccessible.", [memberContainer.toString(false), name.actualText], enclosingDecl);
                    }
                }
            }

            return type;
        }

        private typeCheckSwitchStatement(switchStatement: SwitchStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(switchStatement.val, typeCheckContext);
            this.typeCheckAST(switchStatement.caseList, typeCheckContext);
            this.typeCheckAST(switchStatement.defaultCase, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckExpressionStatement(ast: ExpressionStatement, typeCheckContext: PullTypeCheckContext, inContextuallyTypedAssignment: boolean): PullTypeSymbol {
            return this.typeCheckAST(ast.expression, typeCheckContext, inContextuallyTypedAssignment);
        }

        private typeCheckCaseClause(caseClause: CaseClause, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            this.typeCheckAST(caseClause.expr, typeCheckContext);
            this.typeCheckAST(caseClause.body, typeCheckContext);

            return this.semanticInfoChain.voidTypeSymbol;
        }

        private typeCheckLabeledStatement(labeledStatement: LabeledStatement, typeCheckContext: PullTypeCheckContext): PullTypeSymbol {
            return this.typeCheckAST(labeledStatement.statement, typeCheckContext);
        }

        // Privacy checking

        private checkTypePrivacy(declSymbol: PullSymbol, typeSymbol: PullTypeSymbol, privacyErrorReporter: (typeSymbol: PullTypeSymbol) => void ) {
            if (!typeSymbol || typeSymbol.getKind() === PullElementKind.Primitive) {
                return;
            }

            if (typeSymbol.isArray()) {
                this.checkTypePrivacy(declSymbol, (<PullArrayTypeSymbol>typeSymbol).getElementType(), privacyErrorReporter);
                return;
            }

            if (!typeSymbol.isNamedTypeSymbol()) {
                // Check the privacy of members, constructors, calls, index signatures
                var members = typeSymbol.getMembers();
                for (var i = 0; i < members.length; i++) {
                    this.checkTypePrivacy(declSymbol, members[i].getType(), privacyErrorReporter);
                }

                this.checkTypePrivacyOfSignatures(declSymbol, typeSymbol.getCallSignatures(), privacyErrorReporter);
                this.checkTypePrivacyOfSignatures(declSymbol, typeSymbol.getConstructSignatures(), privacyErrorReporter);
                this.checkTypePrivacyOfSignatures(declSymbol, typeSymbol.getIndexSignatures(), privacyErrorReporter);

                return;
            }

            // Check flags for the symbol itself
            if (declSymbol.isExternallyVisible()) {
                // Check if type symbol is externally visible
                var typeSymbolIsVisible = typeSymbol.isExternallyVisible();
                // If Visible check if the type is part of dynamic module
                if (typeSymbolIsVisible) {
                    var typeSymbolPath = typeSymbol.pathToRoot();
                    if (typeSymbolPath.length && typeSymbolPath[typeSymbolPath.length - 1].getKind() === PullElementKind.DynamicModule) {
                        // Type from the dynamic module
                        var declSymbolPath = declSymbol.pathToRoot();
                        if (declSymbolPath.length && declSymbolPath[declSymbolPath.length - 1] != typeSymbolPath[typeSymbolPath.length - 1]) {
                            // Declaration symbol is from different unit
                            var aliasSymbol = (<PullContainerTypeSymbol>typeSymbolPath[typeSymbolPath.length - 1]).getAliasedSymbol(declSymbol);
                            if (aliasSymbol) {
                                // Visible type.
                                // Also mark this Import declaration as visible
                                CompilerDiagnostics.assert(aliasSymbol.getKind() === PullElementKind.TypeAlias, "dynamic module need to be referenced by type alias");
                                (<PullTypeAliasSymbol>aliasSymbol).setIsTypeUsedExternally();
                            } else {
                                // Type from different module without import statement
                                typeSymbolIsVisible = false;
                            }
                        }
                    }
                }

                if (!typeSymbolIsVisible) {
                    // declaration is visible from outside but the type isnt - Report error
                    privacyErrorReporter(typeSymbol);
                }
            }
        }

        private checkTypePrivacyOfSignatures(declSymbol: PullSymbol, signatures: PullSignatureSymbol[], privacyErrorReporter: (typeSymbol: PullTypeSymbol) => void ) {
            for (var i = 0; i < signatures.length; i++) {
                var signature = signatures[i];
                if (signatures.length && signature.isDefinition()) {
                    continue;
                }

                var typeParams = signature.getTypeParameters();
                for (var j = 0; j < typeParams.length; j++) {
                    this.checkTypePrivacy(declSymbol, typeParams[j], privacyErrorReporter);
                }

                var params = signature.getParameters();
                for (var j = 0; j < params.length; j++) {
                    var paramType = params[j].getType();
                    this.checkTypePrivacy(declSymbol, paramType, privacyErrorReporter);
                }

                var returnType = signature.getReturnType();
                this.checkTypePrivacy(declSymbol, returnType, privacyErrorReporter);
            }
        }

        private baseListPrivacyErrorReporter(declAST: TypeDeclaration, declSymbol: PullTypeSymbol, baseAst: AST, isExtendedType: boolean, typeSymbol: PullTypeSymbol, typeCheckContext: PullTypeCheckContext) {
            var decl: PullDecl = this.resolver.getDeclForAST(declAST);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();
            var messageCode: string;
            var messageArguments: any[];

            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }
                if (declAST.nodeType === NodeType.ClassDeclaration) {
                    // Class
                    if (isExtendedType) {
                        messageCode = "Exported class '{0}' extends class from inaccessible module {1}.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = "Exported class '{0}' implements interface from inaccessible module {1}.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    // Interface
                    messageCode = "Exported interface '{0}' extends interface from inaccessible module {1}.";
                    messageArguments = [declSymbol.getDisplayName(), typeSymbolName];
                }
            } else {
                if (declAST.nodeType === NodeType.ClassDeclaration) {
                    // Class
                    if (isExtendedType) {
                        messageCode = "Exported class '{0}' extends private class '{1}'.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = "Exported class '{0}' implements private interface '{1}'.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    // Interface
                    messageCode = "Exported interface '{0}' extends private interface '{1}'.";
                    messageArguments = [declSymbol.getDisplayName(), typeSymbolName];
                }
            }

            this.context.postError(typeCheckContext.scriptName, baseAst.minChar, baseAst.getLength(), messageCode, messageArguments, enclosingDecl, true);
        }

        private variablePrivacyErrorReporter(declSymbol: PullSymbol, typeSymbol: PullTypeSymbol, typeCheckContext: PullTypeCheckContext) {
            var declAST = <VariableDeclarator>this.resolver.getASTForSymbol(declSymbol);
            var decl: PullDecl = this.resolver.getDeclForAST(declAST);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var isProperty = declSymbol.getKind() === PullElementKind.Property;
            var isPropertyOfClass = false;
            var declParent = declSymbol.getContainer();
            if (declParent && (declParent.getKind() === PullElementKind.Class || declParent.getKind() === PullElementKind.ConstructorMethod)) {
                isPropertyOfClass = true;
            }

            var messageCode: string;
            var messageArguments: any[];
            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }

                if (decl.getFlags() & PullElementFlags.Static) {
                    messageCode = "Public static property '{0}' of exported class is using inaccessible module {1}.";
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                } else if (isProperty) {
                    if (isPropertyOfClass) {
                        messageCode = "Public property '{0}' of exported class is using inaccessible module {1}.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = "Property '{0}' of exported interface is using inaccessible module {1}.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    messageCode = "Exported variable '{0}' is using inaccessible module {1}.";
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                }
            } else {
                if (decl.getFlags() & PullElementFlags.Static) {
                    messageCode = "Public static property '{0}' of exported class has or is using private type '{1}'.";
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                } else if (isProperty) {
                    if (isPropertyOfClass) {
                        messageCode = "Public property '{0}' of exported class has or is using private type '{1}'.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    } else {
                        messageCode = "Property '{0}' of exported interface has or is using private type '{1}'.";
                        messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                    }
                } else {
                    messageCode = "Exported variable '{0}' has or is using private type '{1}'.";
                    messageArguments = [declSymbol.getScopedName(), typeSymbolName];
                }
            }

            this.context.postError(typeCheckContext.scriptName, declAST.minChar, declAST.getLength(), messageCode, messageArguments, enclosingDecl, true);
        }

        private checkFunctionTypePrivacy(funcDeclAST: FunctionDeclaration, inContextuallyTypedAssignment: boolean, typeCheckContext: PullTypeCheckContext) {
            if (inContextuallyTypedAssignment || (funcDeclAST.getFunctionFlags() & FunctionFlags.IsFunctionExpression)) {
                return;
            }

            var functionDecl = typeCheckContext.semanticInfo.getDeclForAST(funcDeclAST);
            var functionSymbol = functionDecl.getSymbol();;
            var functionSignature: PullSignatureSymbol;

            var isGetter = funcDeclAST.isGetAccessor();
            var isSetter = funcDeclAST.isSetAccessor();

            if (isGetter || isSetter) {
                var accessorSymbol = <PullAccessorSymbol> functionSymbol;
                functionSignature = (isGetter ? accessorSymbol.getGetter() : accessorSymbol.getSetter()).getType().getCallSignatures()[0];
            } else {
                if (!functionSymbol) {
                    var parentDecl = functionDecl.getParentDecl();
                    functionSymbol = parentDecl.getSymbol();
                    if (functionSymbol && functionSymbol.isType() && !(<PullTypeSymbol>functionSymbol).isNamedTypeSymbol()) {
                        // Signature from the non named type
                        return;
                    }
                }
                functionSignature = functionDecl.getSignatureSymbol();
            }

            // Check function parameters
            if (!isGetter) {
                var funcParams = functionSignature.getParameters();
                for (var i = 0; i < funcParams.length; i++) {
                    this.checkTypePrivacy(functionSymbol, funcParams[i].getType(), (typeSymbol: PullTypeSymbol) =>
                        this.functionArgumentTypePrivacyErrorReporter(funcDeclAST, i, funcParams[i], typeSymbol, typeCheckContext));
                }
            }

            // Check return type
            if (!isSetter) {
                this.checkTypePrivacy(functionSymbol, functionSignature.getReturnType(), (typeSymbol: PullTypeSymbol) =>
                    this.functionReturnTypePrivacyErrorReporter(funcDeclAST, functionSignature.getReturnType(), typeSymbol, typeCheckContext));
            }
        }

        private functionArgumentTypePrivacyErrorReporter(declAST: FunctionDeclaration, argIndex: number, paramSymbol: PullSymbol, typeSymbol: PullTypeSymbol, typeCheckContext: PullTypeCheckContext) {
            var decl: PullDecl = this.resolver.getDeclForAST(declAST);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var isGetter = declAST.isAccessor() && hasFlag(declAST.getFunctionFlags(), FunctionFlags.GetAccessor);
            var isSetter = declAST.isAccessor() && hasFlag(declAST.getFunctionFlags(), FunctionFlags.SetAccessor);
            var isStatic = (decl.getFlags() & PullElementFlags.Static) === PullElementFlags.Static;
            var isMethod = decl.getKind() === PullElementKind.Method;
            var isMethodOfClass = false;
            var declParent = decl.getParentDecl();
            if (declParent && (declParent.getKind() === PullElementKind.Class || declParent.getKind() === PullElementKind.ConstructorMethod)) {
                isMethodOfClass = true;
            }

            var start = declAST.arguments.members[argIndex].minChar;
            var length = declAST.arguments.members[argIndex].getLength();

            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }

                if (declAST.isConstructor) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of constructor from exported class is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isSetter) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public static property setter from exported class is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public property setter from exported class is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (declAST.isConstructMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of constructor signature from exported interface is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (declAST.isCallMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of call signature from exported interface is using inaccessible module {1}", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isMethod) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public static method from exported class is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else if (isMethodOfClass) {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public method from exported class is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of method from exported interface is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (!isGetter) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of exported function is using inaccessible module {1}.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                }
            } else {
                if (declAST.isConstructor) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of constructor from exported class has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isSetter) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public static property setter from exported class has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public property setter from exported class has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (declAST.isConstructMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of constructor signature from exported interface has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (declAST.isCallMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of call signature from exported interface has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                } else if (isMethod) {
                    if (isStatic) {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public static method from exported class has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else if (isMethodOfClass) {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of public method from exported class has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    } else {
                        this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of method from exported interface has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                    }
                } else if (!isGetter && !declAST.isIndexerMember()) {
                    this.context.postError(typeCheckContext.scriptName, start, length, "Parameter '{0}' of exported function has or is using private type '{1}'.", [paramSymbol.getScopedName(), typeSymbolName], enclosingDecl, true);
                }
            }
        }

        private functionReturnTypePrivacyErrorReporter(declAST: FunctionDeclaration, funcReturnType: PullTypeSymbol, typeSymbol: PullTypeSymbol, typeCheckContext: PullTypeCheckContext) {
            var decl: PullDecl = this.resolver.getDeclForAST(declAST);
            var enclosingDecl = typeCheckContext.getEnclosingDecl();

            var isGetter = declAST.isAccessor() && hasFlag(declAST.getFunctionFlags(), FunctionFlags.GetAccessor);
            var isSetter = declAST.isAccessor() && hasFlag(declAST.getFunctionFlags(), FunctionFlags.SetAccessor);
            var isStatic = (decl.getFlags() & PullElementFlags.Static) === PullElementFlags.Static;
            var isMethod = decl.getKind() === PullElementKind.Method;
            var isMethodOfClass = false;
            var declParent = decl.getParentDecl();
            if (declParent && (declParent.getKind() === PullElementKind.Class || declParent.getKind() === PullElementKind.ConstructorMethod)) {
                isMethodOfClass = true;
            }

            var messageCode: string = null;
            var messageArguments: any[];
            var typeSymbolName = typeSymbol.getScopedName();
            if (typeSymbol.isContainer()) {
                if (!isQuoted(typeSymbolName)) {
                    typeSymbolName = "'" + typeSymbolName + "'";
                }

                if (isGetter) {
                    if (isStatic) {
                        messageCode = "Return type of public static property getter from exported class is using inaccessible module {0}.";
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = "Return type of public property getter from exported class is using inaccessible module {0}.";
                        messageArguments = [typeSymbolName];
                    }
                } else if (declAST.isConstructMember()) {
                    messageCode = "Return type of constructor signature from exported interface is using inaccessible module {0}.";
                    messageArguments = [typeSymbolName];
                } else if (declAST.isCallMember()) {
                    messageCode = "Return type of call signature from exported interface is using inaccessible module {0}.";
                    messageArguments = [typeSymbolName];
                } else if (declAST.isIndexerMember()) {
                    messageCode = "Return type of index signature from exported interface is using inaccessible module {0}.";
                    messageArguments = [typeSymbolName];
                } else if (isMethod) {
                    if (isStatic) {
                        messageCode = "Return type of public static method from exported class is using inaccessible module {0}.";
                        messageArguments = [typeSymbolName];
                    } else if (isMethodOfClass) {
                        messageCode = "Return type of public method from exported class is using inaccessible module {0}.";
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = "Return type of method from exported interface is using inaccessible module {0}.";
                        messageArguments = [typeSymbolName];
                    }
                } else if (!isSetter && !declAST.isConstructor) {
                    messageCode = "Return type of exported function is using inaccessible module {0}.";
                    messageArguments = [typeSymbolName];
                }
            } else {
                if (isGetter) {
                    if (isStatic) {
                        messageCode = "Return type of public static property getter from exported class has or is using private type '{0}'.";
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = "Return type of public property getter from exported class has or is using private type '{0}'.";
                        messageArguments = [typeSymbolName];
                    }
                } else if (declAST.isConstructMember()) {
                    messageCode = "Return type of constructor signature from exported interface has or is using private type '{0}'.";
                    messageArguments = [typeSymbolName];
                } else if (declAST.isCallMember()) {
                    messageCode = "Return type of call signature from exported interface has or is using private type '{0}'.";
                    messageArguments = [typeSymbolName];
                } else if (declAST.isIndexerMember()) {
                    messageCode = "Return type of index signature from exported interface has or is using private type '{0}'.";
                    messageArguments = [typeSymbolName];
                } else if (isMethod) {
                    if (isStatic) {
                        messageCode = "Return type of public static method from exported class has or is using private type '{0}'.";
                        messageArguments = [typeSymbolName];
                    } else if (isMethodOfClass) {
                        messageCode = "Return type of public method from exported class has or is using private type '{0}'.";
                        messageArguments = [typeSymbolName];
                    } else {
                        messageCode = "Return type of method from exported interface has or is using private type '{0}'.";
                        messageArguments = [typeSymbolName];
                    }
                } else if (!isSetter && !declAST.isConstructor) {
                    messageCode = "Return type of exported function has or is using private type '{0}'.";
                    messageArguments = [typeSymbolName];
                }
            }

            if (messageCode) {
                var reportOnFuncDecl = false;
                var contextForReturnTypeResolution = new PullTypeResolutionContext();
                var returnExpressionSymbol: PullTypeSymbol;
                if (declAST.returnTypeAnnotation != null) {
                    var returnTypeRef = <TypeReference>declAST.returnTypeAnnotation;
                    returnExpressionSymbol = this.resolver.resolveTypeReference(returnTypeRef, decl, contextForReturnTypeResolution);
                    if (returnExpressionSymbol === funcReturnType) {
                        // Error coming from return annotation
                        this.context.postError(typeCheckContext.scriptName, declAST.returnTypeAnnotation.minChar, declAST.returnTypeAnnotation.getLength(), messageCode, messageArguments, enclosingDecl, true);
                    }
                }

                if (declAST.block) {
                    var reportErrorOnReturnExpressions = (ast: AST, parent: AST, walker: IAstWalker) => {
                        var go = true;
                        switch (ast.nodeType) {
                            case NodeType.FunctionDeclaration:
                                // don't recurse into a function decl - we don't want to confuse a nested
                                // return type with the top-level function's return type
                                go = false;
                                break;

                            case NodeType.ReturnStatement:
                                var returnStatement: ReturnStatement = <ReturnStatement>ast;
                                returnExpressionSymbol = this.resolver.resolveStatementOrExpression(returnStatement.returnExpression, false, decl, contextForReturnTypeResolution).getType();
                                // Check if return statement's type matches the one that we concluded
                                if (returnExpressionSymbol === funcReturnType) {
                                    this.context.postError(typeCheckContext.scriptName, returnStatement.minChar, returnStatement.getLength(), messageCode, messageArguments, enclosingDecl, true);
                                } else {
                                    reportOnFuncDecl = true;
                                }
                                go = false;
                                break;

                            default:
                                break;
                        }

                        walker.options.goChildren = go;
                        return ast;
                    }

                    getAstWalkerFactory().walk(declAST.block, reportErrorOnReturnExpressions);
                }

                if (reportOnFuncDecl) {
                    // Show on function decl
                    this.context.postError(typeCheckContext.scriptName, declAST.minChar, declAST.getLength(), messageCode, messageArguments, enclosingDecl, true);
                }
            }
        }
    }
}