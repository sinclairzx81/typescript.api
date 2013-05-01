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
    export class IndentationNodeContext {
        private _node: SyntaxNode;
        private _parent: IndentationNodeContext;
        private _fullStart: number;
        private _indentationLevel: number;
        private _childIndentationLevelDelta: number;
        private _depth: number;
        private _hasSkippedOrMissingTokenChild: boolean;

        constructor(parent: IndentationNodeContext, node: SyntaxNode, fullStart: number, indentationLevel: number, childIndentationLevelDelta: number) {
            this.update(parent, node, fullStart, indentationLevel, childIndentationLevelDelta);
        }

        public parent(): IndentationNodeContext {
            return this._parent;
        }

        public node(): SyntaxNode {
            return this._node;
        }

        public fullStart(): number {
            return this._fullStart;
        }

        public fullWidth(): number {
            return this._node.fullWidth();
        }

        public start(): number {
            return this._fullStart + this._node.leadingTriviaWidth();
        }

        public end(): number {
            return this._fullStart + this._node.leadingTriviaWidth() + this._node.width();
        }

        public indentationLevel(): number {
            return this._indentationLevel;
        }

        public childIndentationLevelDelta(): number {
            return this._childIndentationLevelDelta;
        }

        public depth(): number {
            return this._depth;
        }

        public kind(): SyntaxKind {
            return this._node.kind();
        }

        public hasSkippedOrMissingTokenChild(): boolean {
            if (this._hasSkippedOrMissingTokenChild === null) {
                this._hasSkippedOrMissingTokenChild = Syntax.nodeHasSkippedOrMissingTokens(this._node);
            }
            return this._hasSkippedOrMissingTokenChild;
        }

        public clone(pool: IndentationNodeContextPool): IndentationNodeContext {
            var parent: IndentationNodeContext = null;
            if (this._parent) {
                parent = this._parent.clone(pool);
            }
            return pool.getNode(parent, this._node, this._fullStart, this._indentationLevel, this._childIndentationLevelDelta);
        }

        public update(parent: IndentationNodeContext, node: SyntaxNode, fullStart: number, indentationLevel: number, childIndentationLevelDelta: number) {
            this._parent = parent;
            this._node = node;
            this._fullStart = fullStart;
            this._indentationLevel = indentationLevel;
            this._childIndentationLevelDelta = childIndentationLevelDelta;
            this._hasSkippedOrMissingTokenChild = null;

            if (parent) {
                this._depth = parent.depth() + 1;
            }
            else {
                this._depth = 0;
            }
        }
    }
}