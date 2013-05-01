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

///<reference path='formatting.ts' />

module TypeScript.Formatting {
    export class IndentationTrackingWalker extends SyntaxWalker {
        private _position: number = 0;
        private _parent: IndentationNodeContext = null;
        private _textSpan: TextSpan;
        private _snapshot: ITextSnapshot;
        private _lastTriviaWasNewLine: boolean;
        private _indentationNodeContextPool: IndentationNodeContextPool;

        constructor(textSpan: TextSpan, sourceUnit: SourceUnitSyntax, snapshot: ITextSnapshot, indentFirstToken: boolean) {
            super();

            // Create a pool object to manage context nodes while walking the tree
            this._indentationNodeContextPool = new IndentationNodeContextPool();

            this._textSpan = textSpan;
            this._snapshot = snapshot;
            this._parent = this._indentationNodeContextPool.getNode(null, sourceUnit, 0, 0, 0);

            // Is the first token in the span at the start of a new line.
            this._lastTriviaWasNewLine = indentFirstToken;
        }

        public position(): number {
            return this._position;
        }

        public parent(): IndentationNodeContext {
            return this._parent;
        }

        public textSpan(): TextSpan {
            return this._textSpan;
        }

        public snapshot(): ITextSnapshot {
            return this._snapshot;
        }

        public indentationNodeContextPool(): IndentationNodeContextPool {
            return this._indentationNodeContextPool;
        }

        public forceIndentNextToken(): void {
            this._lastTriviaWasNewLine = true;
        }

        public forceSkipIndentingNextToken(): void {
            this._lastTriviaWasNewLine = false;
        }

        public indentToken(token: ISyntaxToken, indentationLevel: number, commentIndentationLevel: number): void {
            throw Errors.abstract();
        }

        public visitTokenInSpan(token: ISyntaxToken): void {
            if (this._lastTriviaWasNewLine) {
                // Compute the indentation level at the current token
                var indentationLevel = this.getTokenIndentationLevel(token);
                var commentIndentationLevel = this.getCommentIndentationLevel(token);

                // Process the token
                this.indentToken(token, indentationLevel, commentIndentationLevel);
            }
        }

        public visitToken(token: ISyntaxToken): void {
            var tokenSpan = new TextSpan(this._position, token.fullWidth());

            if (tokenSpan.intersectsWithTextSpan(this._textSpan)) {
                this.visitTokenInSpan(token);

                // Only track new lines on tokens within the range. Make sure to check that the last trivia is a newline, and not just one of the trivia
                var trivia = token.trailingTrivia();
                this._lastTriviaWasNewLine = token.hasTrailingNewLine() && trivia.syntaxTriviaAt(trivia.count() - 1).kind() == SyntaxKind.NewLineTrivia;
            }

            // Update the position
            this._position += token.fullWidth();
        }

        public visitNode(node: SyntaxNode): void {
            var nodeSpan = new TextSpan(this._position, node.fullWidth());

            if (nodeSpan.intersectsWithTextSpan(this._textSpan)) {
                // Update indentation level
                var indentation = this.getNodeIndentation(node);

                // Update the parent
                var currentParent = this._parent;
                this._parent = this._indentationNodeContextPool.getNode(currentParent, node, this._position, indentation.indentationLevel, indentation.indentationLevelDelta);

                // Visit node
                node.accept(this);

                // Reset state
                this._indentationNodeContextPool.releaseNode(this._parent);
                this._parent = currentParent;
            }
            else {
                // We're skipping the node, so update our position accordingly.
                this._position += node.fullWidth();
            }
        }

        private getTokenIndentationLevel(token: ISyntaxToken): number {
            // If this is the first token of a node, it should follow the node indentation and not the child indentation; 
            // (e.g.class in a class declaration or module in module declariotion).
            // Open and close braces should follow the indentation of thier parent as well(e.g.
            // class {
            // }
            // Also in a do-while statement, the while should be indented like the parent.
            if (this._parent.node().firstToken() === token ||
                token.kind() === SyntaxKind.OpenBraceToken || token.kind() === SyntaxKind.CloseBraceToken ||
                token.kind() === SyntaxKind.OpenBracketToken || token.kind() === SyntaxKind.CloseBracketToken ||
                (token.kind() === SyntaxKind.WhileKeyword && this._parent.node().kind() == SyntaxKind.DoStatement)) {
                return this._parent.indentationLevel();
            }

            return (this._parent.indentationLevel() + this._parent.childIndentationLevelDelta());
        }

        private getCommentIndentationLevel(token: ISyntaxToken): number {
            // If this is token terminating an indentation scope, leading comments should be indented to follow the children 
            // indentation level and not the node

            if (token.kind() === SyntaxKind.CloseBraceToken || token.kind() === SyntaxKind.CloseBracketToken) {
                return (this._parent.indentationLevel() + this._parent.childIndentationLevelDelta());
            }
            return this._parent.indentationLevel();
        }

        private getNodeIndentation(node: SyntaxNode): { indentationLevel: number; indentationLevelDelta: number; } {
            var parent = this._parent.node();
            var parentIndentationLevel = this._parent.indentationLevel();
            var parentIndentationLevelDelta = this._parent.childIndentationLevelDelta();

            // The indentation level of the node
            var indentationLevel;

            // The delta it adds to its children. 
            var indentationLevelDelta;

            switch (node.kind()) {
                default:
                    // General case
                    // This node should follow the child indentation set by its parent
                    // This node does not introduce any new indentation scope, indent any decendants of this node (tokens or child nodes)
                    // using the same indentation level
                    indentationLevel = (parentIndentationLevel + parentIndentationLevelDelta);
                    indentationLevelDelta = 0;
                    break;

                // Statements introducing {}
                case SyntaxKind.ClassDeclaration:
                case SyntaxKind.ModuleDeclaration:
                case SyntaxKind.ObjectType:
                case SyntaxKind.EnumDeclaration:
                case SyntaxKind.SwitchStatement:
                case SyntaxKind.ObjectLiteralExpression:
                case SyntaxKind.ConstructorDeclaration:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.MemberFunctionDeclaration:
                case SyntaxKind.GetMemberAccessorDeclaration:
                case SyntaxKind.SetMemberAccessorDeclaration:
                case SyntaxKind.CatchClause:
                // Statements introducing []
                case SyntaxKind.ArrayLiteralExpression:
                case SyntaxKind.ArrayType:
                case SyntaxKind.ElementAccessExpression:
                case SyntaxKind.IndexSignature:
                // Other statements
                case SyntaxKind.ForStatement:
                case SyntaxKind.ForInStatement:
                case SyntaxKind.WhileStatement:
                case SyntaxKind.DoStatement:
                case SyntaxKind.WithStatement:
                case SyntaxKind.CaseSwitchClause:
                case SyntaxKind.DefaultSwitchClause:
                case SyntaxKind.ReturnStatement:
                case SyntaxKind.ThrowStatement:
                case SyntaxKind.SimpleArrowFunctionExpression:
                case SyntaxKind.ParenthesizedArrowFunctionExpression:
                case SyntaxKind.VariableDeclaration:
                case SyntaxKind.ExportAssignment:

                // Expressions which have argument lists or parameter lists
                case SyntaxKind.InvocationExpression:
                case SyntaxKind.ObjectCreationExpression:
                case SyntaxKind.CallSignature:
                case SyntaxKind.ConstructSignature:

                    // These nodes should follow the child indentation set by its parent;
                    // they introduce a new indenation scope; children should be indented at one level deeper
                    indentationLevel = (parentIndentationLevel + parentIndentationLevelDelta);
                    indentationLevelDelta = 1;
                    break;

                case SyntaxKind.IfStatement:
                    if (parent.kind() === SyntaxKind.ElseClause &&
                        !(<ElseClauseSyntax>parent).elseKeyword.hasTrailingNewLine() &&
                        !(<IfStatementSyntax>node).ifKeyword.hasLeadingNewLine()) {
                        // This is an else if statement with the if on the same line as the else, do not indent the if statmement.
                        // Note: Children indentation has already been set by the parent if statement, so no need to increment
                        indentationLevel = parentIndentationLevel;
                    }
                    else {
                        // Otherwise introduce a new indenation scope; children should be indented at one level deeper
                        indentationLevel = (parentIndentationLevel + parentIndentationLevelDelta);
                    }
                    indentationLevelDelta = 1;
                    break;

                case SyntaxKind.ElseClause:
                    // Else should always follow its parent if statement indentation.
                    // Note: Children indentation has already been set by the parent if statement, so no need to increment
                    indentationLevel = parentIndentationLevel;
                    indentationLevelDelta = 1;
                    break;


                case SyntaxKind.Block:
                    // Check if the block is a member in a list of statements (if the parent is a source unit, module, or block, or switch clause)
                    switch (parent.kind()) {
                        case SyntaxKind.SourceUnit:
                        case SyntaxKind.ModuleDeclaration:
                        case SyntaxKind.Block:
                        case SyntaxKind.CaseSwitchClause:
                        case SyntaxKind.DefaultSwitchClause:
                            indentationLevel = parentIndentationLevel + parentIndentationLevelDelta;
                            break;

                        default:
                            indentationLevel = parentIndentationLevel;
                            break;
                    }

                    indentationLevelDelta = 1;
                    break;
            }

            // If the parent happens to start on the same line as this node, then override the current node indenation with that 
            // of the parent. This avoid having to add an extra level of indentation for the children. e.g.:
            //	return {
            //	    a:1
            //	};
            // instead of:
            //	return {
            //	        a:1
            //	    };
            // We also need to pass the delta (if it is 1) to the children, so that subsequent lines get indented. Essentially, if any node starting on the given line
            // has a delta of 1, the resulting delta should be 1. This is to indent cases like the following:
            //  return a
            //      || b;
            if (parent) {
                var parentStartLine = this._snapshot.getLineNumberFromPosition(this._parent.start());
                var currentNodeStartLine = this._snapshot.getLineNumberFromPosition(this._position + node.leadingTriviaWidth());
                if (parentStartLine === currentNodeStartLine) {
                    indentationLevel = parentIndentationLevel;
                    indentationLevelDelta = Math.min(1, parentIndentationLevelDelta + indentationLevelDelta);
                }
            }

            return {
                indentationLevel: indentationLevel,
                indentationLevelDelta: indentationLevelDelta
            };
        }
    }
}