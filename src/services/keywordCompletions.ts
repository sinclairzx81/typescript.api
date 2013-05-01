// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0. 
// See LICENSE.txt in the project root for complete license information.

///<reference path='typescriptServices.ts' />

module Services {
    export class KeywordCompletions {
        private static keywords = [
            "break",
            "case",
            "catch",
            "class",
            "constructor",
            "continue",
            "debugger",
            "declare",
            "default",
            "delete",
            "do",
            "else",
            "enum",
            "export",
            "extends",
            "false",
            "finally",
            "for",
            "function",
            "get",
            "if",
            "implements",
            "import",
            "in",
            "instanceOf",
            "interface",
            "module",
            "new",
            "private",
            "public",
            "return",
            "set",
            "static",
            "super",
            "switch",
            "this",
            "throw",
            "true",
            "try",
            "typeOf",
            "var",
            "while",
            "with",
        ];

        private static keywordCompletions: CompletionEntry[] = null;

        public static getKeywordCompltions(): CompletionEntry[]{
            if (KeywordCompletions.keywordCompletions === null) {
                var completions: CompletionEntry[] = [];
                for (var i = 0, n = KeywordCompletions.keywords.length; i < n; i++) {
                    var keyword = KeywordCompletions.keywords[i];
                    var entry = new CompletionEntry();
                    entry.name = entry.fullSymbolName = keyword;
                    entry.type = null;
                    entry.docComment = null;
                    entry.kind = ScriptElementKind.keyword;
                    entry.kindModifiers = ScriptElementKindModifier.none;
                    completions.push(entry);
                }

                KeywordCompletions.keywordCompletions = completions;
            }

            return KeywordCompletions.keywordCompletions;
        }
    }
}