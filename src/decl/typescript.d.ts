//////////////////////////////////////////////////////////
//
// declarations from compiler/tsc.ts
//
//////////////////////////////////////////////////////////


interface IResolvedFile {
    content: string;
    path: string;
}

interface IFileWatcher {
    close(): void;
}

interface IIO {
    readFile(path: string): string;
    writeFile(path: string, contents: string): void;
    createFile(path: string, useUTF8?: boolean): ITextWriter;
    deleteFile(path: string): void;
    dir(path: string, re?: RegExp, options?: { recursive?: boolean; }): string[];
    fileExists(path: string): boolean;
    directoryExists(path: string): boolean;
    createDirectory(path: string): void;
    resolvePath(path: string): string;
    dirName(path: string): string;
    findFile(rootPath: string, partialFilePath: string): IResolvedFile;
    print(str: string): void;
    printLine(str: string): void;
    arguments: string[];
    stderr: ITextWriter;
    stdout: ITextWriter;
    watchFile(fileName: string, callback: (string) => void ): IFileWatcher;
    run(source: string, fileName: string): void;
    getExecutingFilePath(): string;
    quit(exitCode?: number);
}

//////////////////////////////////////////////////////////
//
// TypeScript Declarations
//
//////////////////////////////////////////////////////////

declare module TypeScript {
	export var diagnosticMessages:any;
}

declare module TypeScript {
    class ArrayUtilities {
        static isArray(value: any): boolean;
        static sequenceEquals(array1: any[], array2: any[], equals: (v1: any, v2: any) => boolean): boolean;
        static contains(array: any[], value: any): boolean;
        static groupBy(array: any[], func: (v: any) => string): any;
        static min(array: any[], func: (v: any) => number): number;
        static max(array: any[], func: (v: any) => number): number;
        static last(array: any[]);
        static firstOrDefault(array: any[], func: (v: any) => boolean): any;
        static sum(array: any[], func: (v: any) => number): number;
        static whereNotNull(array: any[]): any[];
        static select(values: any[], func: (v: any) => any): any[];
        static where(values: any[], func: (v: any) => boolean): any[];
        static any(array: any[], func: (v: any) => boolean): boolean;
        static all(array: any[], func: (v: any) => boolean): boolean;
        static binarySearch(array: number[], value: number): number;
        static createArray(length: number, defaultvalue: any): any[];
        static grow(array: any[], length: number, defaultValue: any): void;
        static copy(sourceArray: any[], sourceIndex: number, destinationArray: any[], destinationIndex: number, length: number): void;
    }
}
declare module TypeScript {
    enum Constants {
        Max31BitInteger,
        Min31BitInteger,
    }
}
declare module TypeScript {
    class Contract {
        static requires(expression: boolean): void;
        static throwIfFalse(expression: boolean): void;
        static throwIfNull(value: any): void;
    }
}
declare module TypeScript {
    class Debug {
        static assert(expression: boolean, message?: string): void;
    }
}
declare module TypeScript {
    enum DiagnosticCategory {
        Warning,
        Error,
        Message,
    }
}
declare module TypeScript {
    class Errors {
        static argument(argument: string, message?: string): Error;
        static argumentOutOfRange(argument: string): Error;
        static argumentNull(argument: string): Error;
        static abstract(): Error;
        static notYetImplemented(): Error;
        static invalidOperation(message?: string): Error;
    }
}
declare module TypeScript {
    class Hash {
        private static FNV_BASE;
        private static FNV_PRIME;
        private static computeFnv1aCharArrayHashCode(text, start, len);
        static computeSimple31BitCharArrayHashCode(key: number[], start: number, len: number): number;
        static computeSimple31BitStringHashCode(key: string): number;
        static computeMurmur2CharArrayHashCode(key: number[], start: number, len: number): number;
        static computeMurmur2StringHashCode(key: string): number;
        private static primes;
        static getPrime(min: number): number;
        static expandPrime(oldSize: number): number;
        static combine(value: number, currentHash: number): number;
    }
}
declare module TypeScript.Collections {
    var DefaultHashTableCapacity: number;
    class HashTable {
        private hash;
        private equals;
        private entries;
        private count;
        constructor(capacity: number, hash: (k: any) => number, equals: (k1: any, k2: any) => boolean);
        public set(key: any, value: any): void;
        public add(key: any, value: any): void;
        public containsKey(key: any): boolean;
        public get(key: any): any;
        private computeHashCode(key);
        private addOrSet(key, value, throwOnExistingEntry);
        private findEntry(key, hashCode);
        private addEntry(key, value, hashCode);
        private grow();
    }
    function createHashTable(capacity?: number, hash?: (k: any) => number, equals?: (k1: any, k2: any) => boolean): HashTable;
    function identityHashCode(value: any): number;
}
declare module TypeScript {
    interface IDiagnostic {
        fileName(): string;
        start(): number;
        length(): number;
        diagnosticKey(): string;
        text(): string;
        message(): string;
    }
    class Diagnostic implements IDiagnostic {
        private _fileName;
        private _start;
        private _originalStart;
        private _length;
        private _diagnosticKey;
        private _arguments;
        constructor(fileName: string, start: number, length: number, diagnosticKey: string, arguments: any[]);
        public toJSON(key);
        public fileName(): string;
        public start(): number;
        public length(): number;
        public diagnosticKey(): string;
        public arguments(): any[];
        public text(): string;
        public message(): string;
        public adjustOffset(pos: number): void;
        public additionalLocations(): Location[];
        static equals(diagnostic1: Diagnostic, diagnostic2: Diagnostic): boolean;
    }
    function getDiagnosticInfoFromKey(diagnosticKey: string): DiagnosticInfo;
    function getDiagnosticText(diagnosticKey: string, args: any[]): string;
    function getDiagnosticMessage(diagnosticKey: string, args: any[]): string;
}
declare class Enumerator {
    public atEnd(): boolean;
    public moveNext();
    public item(): any;
    constructor(o: any);
}
declare module process {
    var argv: string[];
    var platform: string;
    function on(event: string, handler: (any: any) => void): void;
    module stdout {
        function write(str: string);
    }
    module stderr {
        function write(str: string);
    }
    module mainModule {
        var filename: string;
    }
    function exit(exitCode?: number);
}
interface IEnvironment {
    readFile(path: string, useUTF8?: boolean): string;
    writeFile(path: string, contents: string, useUTF8?: boolean): void;
    deleteFile(path: string): void;
    fileExists(path: string): boolean;
    directoryExists(path: string): boolean;
    listFiles(path: string, re?: RegExp, options?: {
            recursive?: boolean;
        }): string[];
    arguments: string[];
    standardOut: ITextWriter;
    currentDirectory(): string;
}
declare var Environment: IEnvironment;
declare module TypeScript {
    class IntegerUtilities {
        static integerDivide(numerator: number, denominator: number): number;
        static integerMultiplyLow32Bits(n1: number, n2: number): number;
        static integerMultiplyHigh32Bits(n1: number, n2: number): number;
    }
}
declare module TypeScript {
    class MathPrototype {
        static max(a: number, b: number): number;
        static min(a: number, b: number): number;
    }
}
declare module TypeScript.Collections {
    var DefaultStringTableCapacity: number;
    class StringTable {
        private entries;
        private count;
        constructor(capacity);
        public addCharArray(key: number[], start: number, len: number): string;
        private findCharArrayEntry(key, start, len, hashCode);
        private addEntry(text, hashCode);
        private grow();
        private static textCharArrayEquals(text, array, start, length);
    }
    var DefaultStringTable: StringTable;
}
declare module TypeScript {
    class StringUtilities {
        static fromCharCodeArray(array: number[]): string;
        static endsWith(string: string, value: string): boolean;
        static startsWith(string: string, value: string): boolean;
        static copyTo(source: string, sourceIndex: number, destination: number[], destinationIndex: number, count: number): void;
        static repeat(value: string, count: number): string;
        static stringEquals(val1: string, val2: string): boolean;
    }
}
declare var global;
declare module TypeScript {
    class Timer {
        public startTime;
        public time: number;
        public start(): void;
        public end(): void;
    }
}
declare module TypeScript {
    interface DiagnosticInfo {
        category: DiagnosticCategory;
        code: number;
    }
    var LocalizedDiagnosticMessages: any;
}
declare module TypeScript {
    enum CharacterCodes {
        nullCharacter,
        maxAsciiCharacter,
        lineFeed,
        carriageReturn,
        lineSeparator,
        paragraphSeparator,
        nextLine,
        space,
        nonBreakingSpace,
        enQuad,
        emQuad,
        enSpace,
        emSpace,
        threePerEmSpace,
        fourPerEmSpace,
        sixPerEmSpace,
        figureSpace,
        punctuationSpace,
        thinSpace,
        hairSpace,
        zeroWidthSpace,
        narrowNoBreakSpace,
        ideographicSpace,
        _,
        $,
        _0,
        _9,
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        k,
        l,
        m,
        n,
        o,
        p,
        r,
        s,
        t,
        u,
        v,
        w,
        x,
        y,
        z,
        A,
        E,
        F,
        X,
        Z,
        ampersand,
        asterisk,
        at,
        backslash,
        bar,
        caret,
        closeBrace,
        closeBracket,
        closeParen,
        colon,
        comma,
        dot,
        doubleQuote,
        equals,
        exclamation,
        greaterThan,
        lessThan,
        minus,
        openBrace,
        openBracket,
        openParen,
        percent,
        plus,
        question,
        semicolon,
        singleQuote,
        slash,
        tilde,
        backspace,
        formFeed,
        byteOrderMark,
        tab,
        verticalTab,
    }
}
declare module TypeScript {
    interface ILineAndCharacter {
        line: number;
        character: number;
    }
}
declare module TypeScript {
    interface IScriptSnapshot {
        getText(start: number, end: number): string;
        getLength(): number;
        getLineStartPositions(): number[];
        getTextChangeRangeSinceVersion(scriptVersion: number): TextChangeRange;
    }
    module ScriptSnapshot {
        function fromString(text: string): IScriptSnapshot;
    }
}
declare module TypeScript {
    interface ISimpleText {
        length(): number;
        copyTo(sourceIndex: number, destination: number[], destinationIndex: number, count: number): void;
        substr(start: number, length: number, intern: boolean): string;
        subText(span: TextSpan): ISimpleText;
        charCodeAt(index: number): number;
        lineMap(): LineMap;
    }
    interface IText extends ISimpleText {
        lineCount(): number;
        lines(): ITextLine[];
        charCodeAt(position: number): number;
        getLineFromLineNumber(lineNumber: number): ITextLine;
        getLineFromPosition(position: number): ITextLine;
        getLineNumberFromPosition(position: number): number;
        getLinePosition(position: number): LineAndCharacter;
        toString(span?: TextSpan): string;
    }
}
declare module TypeScript {
    interface ITextLine {
        start(): number;
        end(): number;
        endIncludingLineBreak(): number;
        extent(): TextSpan;
        extentIncludingLineBreak(): TextSpan;
        toString(): string;
        lineNumber(): number;
    }
}
declare module TypeScript {
    class LineMap {
        private _lineStarts;
        private length;
        static empty: LineMap;
        constructor(_lineStarts: number[], length: number);
        public toJSON(key): {
            lineStarts: number[];
            length: number;
        };
        public equals(other: LineMap): boolean;
        public lineStarts(): number[];
        public lineCount(): number;
        public getPosition(line: number, character: number): number;
        public getLineNumberFromPosition(position: number): number;
        public getLineStartPosition(lineNumber: number): number;
        public fillLineAndCharacterFromPosition(position: number, lineAndCharacter: ILineAndCharacter): void;
        public getLineAndCharacterFromPosition(position: number): LineAndCharacter;
        static fromSimpleText(text: ISimpleText): LineMap;
        static fromScriptSnapshot(scriptSnapshot: IScriptSnapshot): LineMap;
        static fromString(text: string): LineMap;
    }
}
declare module TypeScript {
    class LineAndCharacter {
        private _line;
        private _character;
        constructor(line: number, character: number);
        public line(): number;
        public character(): number;
    }
}
declare module TypeScript.TextFactory {
    function createText(value: string): IText;
}
declare module TypeScript.SimpleText {
    function fromString(value: string): ISimpleText;
    function fromScriptSnapshot(scriptSnapshot: IScriptSnapshot): ISimpleText;
}
declare module TypeScript.TextUtilities {
    function parseLineStarts(text: ISimpleText): number[];
    function getLengthOfLineBreakSlow(text: ISimpleText, index: number, c: number): number;
    function getLengthOfLineBreak(text: ISimpleText, index: number): number;
    function isAnyLineBreakCharacter(c: number): boolean;
}
declare module TypeScript {
    class TextSpan {
        private _start;
        private _length;
        constructor(start: number, length: number);
        public start(): number;
        public length(): number;
        public end(): number;
        public isEmpty(): boolean;
        public containsPosition(position: number): boolean;
        public containsTextSpan(span: TextSpan): boolean;
        public overlapsWith(span: TextSpan): boolean;
        public overlap(span: TextSpan): TextSpan;
        public intersectsWithTextSpan(span: TextSpan): boolean;
        public intersectsWith(start: number, length: number): boolean;
        public intersectsWithPosition(position: number): boolean;
        public intersection(span: TextSpan): TextSpan;
        static fromBounds(start: number, end: number): TextSpan;
    }
}
declare module TypeScript {
    class TextChangeRange {
        static unchanged: TextChangeRange;
        private _span;
        private _newLength;
        constructor(span: TextSpan, newLength: number);
        public span(): TextSpan;
        public newLength(): number;
        public newSpan(): TextSpan;
        public isUnchanged(): boolean;
        static collapseChangesFromSingleVersion(changes: TextChangeRange[]): TextChangeRange;
        static collapseChangesAcrossMultipleVersions(changes: TextChangeRange[]): TextChangeRange;
    }
}
declare var JSON2: any;
declare module TypeScript {
    class CharacterInfo {
        static isDecimalDigit(c: number): boolean;
        static isHexDigit(c: number): boolean;
        static hexValue(c: number): number;
        static isWhitespace(ch: number): boolean;
        static isLineTerminator(ch: number): boolean;
    }
}
declare module TypeScript {
    enum SyntaxConstants {
        TriviaNewLineMask,
        TriviaCommentMask,
        TriviaFullWidthShift,
        NodeDataComputed,
        NodeIncrementallyUnusableMask,
        NodeParsedInStrictModeMask,
        NodeFullWidthShift,
    }
}
declare class FormattingOptions {
    public useTabs: boolean;
    public spacesPerTab: number;
    public indentSpaces: number;
    public newLineCharacter: string;
    constructor(useTabs: boolean, spacesPerTab: number, indentSpaces: number, newLineCharacter: string);
    static defaultOptions: FormattingOptions;
}
declare module TypeScript.Indentation {
    function columnForEndOfToken(token: ISyntaxToken, syntaxInformationMap: SyntaxInformationMap, options: FormattingOptions): number;
    function columnForStartOfToken(token: ISyntaxToken, syntaxInformationMap: SyntaxInformationMap, options: FormattingOptions): number;
    function columnForStartOfFirstTokenInLineContainingToken(token: ISyntaxToken, syntaxInformationMap: SyntaxInformationMap, options: FormattingOptions): number;
    function columnForPositionInString(input: string, position: number, options: FormattingOptions): number;
    function indentationString(column: number, options: FormattingOptions): string;
    function indentationTrivia(column: number, options: FormattingOptions): ISyntaxTrivia;
    function firstNonWhitespacePosition(value: string): number;
}
declare module TypeScript {
    enum LanguageVersion {
        EcmaScript3,
        EcmaScript5,
    }
}
declare module TypeScript {
    class ParseOptions {
        private _allowAutomaticSemicolonInsertion;
        constructor(allowAutomaticSemicolonInsertion?: boolean);
        public toJSON(key): {
            allowAutomaticSemicolonInsertion: boolean;
        };
        public allowAutomaticSemicolonInsertion(): boolean;
    }
}
declare module TypeScript {
    class PositionedElement {
        private _parent;
        private _element;
        private _fullStart;
        constructor(parent: PositionedElement, element: ISyntaxElement, fullStart: number);
        static create(parent: PositionedElement, element: ISyntaxElement, fullStart: number): PositionedElement;
        public parent(): PositionedElement;
        public parentElement(): ISyntaxElement;
        public element(): ISyntaxElement;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): PositionedElement;
        public getPositionedChild(child: ISyntaxElement): PositionedElement;
        public fullStart(): number;
        public fullEnd(): number;
        public fullWidth(): number;
        public start(): number;
        public end(): number;
        public root(): PositionedNode;
        public containingNode(): PositionedNode;
    }
    class PositionedNodeOrToken extends PositionedElement {
        constructor(parent: PositionedElement, nodeOrToken: ISyntaxNodeOrToken, fullStart: number);
        public nodeOrToken(): ISyntaxNodeOrToken;
    }
    class PositionedNode extends PositionedNodeOrToken {
        constructor(parent: PositionedElement, node: SyntaxNode, fullStart: number);
        public node(): SyntaxNode;
    }
    class PositionedToken extends PositionedNodeOrToken {
        constructor(parent: PositionedElement, token: ISyntaxToken, fullStart: number);
        public token(): ISyntaxToken;
        public previousToken(includeSkippedTokens?: boolean): PositionedToken;
        public nextToken(includeSkippedTokens?: boolean): PositionedToken;
    }
    class PositionedList extends PositionedElement {
        constructor(parent: PositionedElement, list: ISyntaxList, fullStart: number);
        public list(): ISyntaxList;
    }
    class PositionedSeparatedList extends PositionedElement {
        constructor(parent: PositionedElement, list: ISeparatedSyntaxList, fullStart: number);
        public list(): ISeparatedSyntaxList;
    }
    class PositionedSkippedToken extends PositionedToken {
        private _parentToken;
        constructor(parentToken: PositionedToken, token: ISyntaxToken, fullStart: number);
        public parentToken(): PositionedToken;
        public previousToken(includeSkippedTokens?: boolean): PositionedToken;
        public nextToken(includeSkippedTokens?: boolean): PositionedToken;
    }
}
declare module TypeScript {
    class Scanner implements ISlidingWindowSource {
        private slidingWindow;
        private fileName;
        private text;
        private _languageVersion;
        private static isKeywordStartCharacter;
        private static isIdentifierStartCharacter;
        static isIdentifierPartCharacter: boolean[];
        private static isNumericLiteralStart;
        private static initializeStaticData();
        constructor(fileName: string, text: ISimpleText, languageVersion: LanguageVersion, window?: number[]);
        public languageVersion(): LanguageVersion;
        public fetchMoreItems(argument: any, sourceIndex: number, window: number[], destinationIndex: number, spaceAvailable: number): number;
        private currentCharCode();
        public absoluteIndex(): number;
        public setAbsoluteIndex(index: number): void;
        public scan(diagnostics: Diagnostic[], allowRegularExpression: boolean): ISyntaxToken;
        private createToken(fullStart, leadingTriviaInfo, start, kind, end, trailingTriviaInfo);
        private static triviaWindow;
        static scanTrivia(text: ISimpleText, start: number, length: number, isTrailing: boolean): ISyntaxTriviaList;
        private scanTrivia(isTrailing);
        private scanTriviaInfo(diagnostics, isTrailing);
        private isNewLineCharacter(ch);
        private scanWhitespaceTrivia();
        private scanSingleLineCommentTrivia();
        private scanSingleLineCommentTriviaLength();
        private scanMultiLineCommentTrivia();
        private scanMultiLineCommentTriviaLength(diagnostics);
        private scanLineTerminatorSequenceTrivia(ch);
        private scanLineTerminatorSequenceLength(ch);
        private scanSyntaxToken(diagnostics, allowRegularExpression);
        private isIdentifierStart(interpretedChar);
        private isIdentifierPart(interpretedChar);
        private tryFastScanIdentifierOrKeyword(firstCharacter);
        private slowScanIdentifier(diagnostics);
        private scanNumericLiteral();
        private scanDecimalNumericLiteral();
        private scanHexNumericLiteral();
        private isHexNumericLiteral();
        private advanceAndSetTokenKind(kind);
        private scanLessThanToken();
        private scanBarToken();
        private scanCaretToken();
        private scanAmpersandToken();
        private scanPercentToken();
        private scanMinusToken();
        private scanPlusToken();
        private scanAsteriskToken();
        private scanEqualsToken();
        private isDotPrefixedNumericLiteral();
        private scanDotToken();
        private scanSlashToken(allowRegularExpression);
        private tryScanRegularExpressionToken();
        private scanExclamationToken();
        private scanDefaultCharacter(character, diagnostics);
        private getErrorMessageText(text);
        private skipEscapeSequence(diagnostics);
        private scanStringLiteral(diagnostics);
        private isUnicodeOrHexEscape(character);
        private isUnicodeEscape(character);
        private isHexEscape(character);
        private peekCharOrUnicodeOrHexEscape();
        private peekCharOrUnicodeEscape();
        private peekUnicodeOrHexEscape();
        private scanCharOrUnicodeEscape(errors);
        private scanCharOrUnicodeOrHexEscape(errors);
        private scanUnicodeOrHexEscape(errors);
        public substring(start: number, end: number, intern: boolean): string;
        private createIllegalEscapeDiagnostic(start, end);
    }
}
declare module TypeScript {
    class ScannerUtilities {
        static identifierKind(array: number[], startIndex: number, length: number): SyntaxKind;
    }
}
declare module TypeScript {
    interface ISeparatedSyntaxList extends ISyntaxElement {
        childAt(index: number): ISyntaxNodeOrToken;
        toArray(): ISyntaxNodeOrToken[];
        toNonSeparatorArray(): ISyntaxNodeOrToken[];
        separatorCount();
        separatorAt(index: number): ISyntaxToken;
        nonSeparatorCount();
        nonSeparatorAt(index: number): ISyntaxNodeOrToken;
        insertChildrenInto(array: ISyntaxElement[], index: number): void;
    }
}
declare module TypeScript.Syntax {
    var emptySeparatedList: ISeparatedSyntaxList;
    function separatedList(nodes: ISyntaxNodeOrToken[]): ISeparatedSyntaxList;
}
declare module TypeScript {
    interface ISlidingWindowSource {
        fetchMoreItems(argument: any, sourceIndex: number, window: any[], destinationIndex: number, spaceAvailable: number): number;
    }
    class SlidingWindow {
        private source;
        public window: any[];
        private defaultValue;
        private sourceLength;
        private windowCount;
        public windowAbsoluteStartIndex: number;
        private currentRelativeItemIndex;
        private _pinCount;
        private firstPinnedAbsoluteIndex;
        constructor(source: ISlidingWindowSource, window: any[], defaultValue: any, sourceLength?: number);
        private windowAbsoluteEndIndex();
        private addMoreItemsToWindow(argument);
        private tryShiftOrGrowWindow();
        public absoluteIndex(): number;
        public isAtEndOfSource(): boolean;
        public getAndPinAbsoluteIndex(): number;
        public releaseAndUnpinAbsoluteIndex(absoluteIndex: number): void;
        public rewindToPinnedIndex(absoluteIndex: number): void;
        public currentItem(argument: any): any;
        public peekItemN(n: number): any;
        public moveToNextItem(): void;
        public disgardAllItemsFromCurrentIndexOnwards(): void;
        public setAbsoluteIndex(absoluteIndex: number): void;
        public pinCount(): number;
    }
}
declare module TypeScript {
    class Strings {
        static module__class__interface__enum__import_or_statement: string;
        static constructor__function__accessor_or_variable: string;
        static statement: string;
        static case_or_default_clause: string;
        static identifier: string;
        static call__construct__index__property_or_function_signature: string;
        static expression: string;
        static type_name: string;
        static property_or_accessor: string;
        static parameter: string;
        static type: string;
        static type_parameter: string;
    }
}
declare module TypeScript.Syntax {
    function emptySourceUnit(): SourceUnitSyntax;
    function getStandaloneExpression(positionedToken: PositionedToken): PositionedNodeOrToken;
    function isInModuleOrTypeContext(positionedToken: PositionedToken): boolean;
    function isInTypeOnlyContext(positionedToken: PositionedToken): boolean;
    function childOffset(parent: ISyntaxElement, child: ISyntaxElement): number;
    function nodeStructuralEquals(node1: SyntaxNode, node2: SyntaxNode): boolean;
    function nodeOrTokenStructuralEquals(node1: ISyntaxNodeOrToken, node2: ISyntaxNodeOrToken): boolean;
    function tokenStructuralEquals(token1: ISyntaxToken, token2: ISyntaxToken): boolean;
    function triviaListStructuralEquals(triviaList1: ISyntaxTriviaList, triviaList2: ISyntaxTriviaList): boolean;
    function triviaStructuralEquals(trivia1: ISyntaxTrivia, trivia2: ISyntaxTrivia): boolean;
    function listStructuralEquals(list1: ISyntaxList, list2: ISyntaxList): boolean;
    function separatedListStructuralEquals(list1: ISeparatedSyntaxList, list2: ISeparatedSyntaxList): boolean;
    function elementStructuralEquals(element1: ISyntaxElement, element2: ISyntaxElement): boolean;
    function identifierName(text: string, info?: ITokenInfo): ISyntaxToken;
    function trueExpression(): IUnaryExpressionSyntax;
    function falseExpression(): IUnaryExpressionSyntax;
    function numericLiteralExpression(text: string): IUnaryExpressionSyntax;
    function stringLiteralExpression(text: string): IUnaryExpressionSyntax;
    function isSuperInvocationExpression(node: IExpressionSyntax): boolean;
    function isSuperInvocationExpressionStatement(node: SyntaxNode): boolean;
    function isSuperMemberAccessExpression(node: IExpressionSyntax): boolean;
    function isSuperMemberAccessInvocationExpression(node: SyntaxNode): boolean;
    function assignmentExpression(left: IExpressionSyntax, token: ISyntaxToken, right: IExpressionSyntax): BinaryExpressionSyntax;
    function nodeHasSkippedOrMissingTokens(node: SyntaxNode): boolean;
    function isUnterminatedStringLiteral(token: ISyntaxToken): boolean;
    function isUnterminatedMultilineCommentTrivia(trivia: ISyntaxTrivia): boolean;
    function isEntirelyInsideCommentTrivia(trivia: ISyntaxTrivia, fullStart: number, position: number): boolean;
    function isEntirelyInsideComment(sourceUnit: SourceUnitSyntax, position: number): boolean;
    function isEntirelyInStringOrRegularExpressionLiteral(sourceUnit: SourceUnitSyntax, position: number): boolean;
    function findSkippedTokenInTriviaList(triviaList: ISyntaxTriviaList, parentToken: PositionedToken, fullStart: number, position: number): PositionedSkippedToken;
    function findSkippedTokenInPositionedToken(positionedToken: PositionedToken, position: number): PositionedSkippedToken;
}
declare module TypeScript {
    interface ISyntaxElement {
        kind(): TypeScript.SyntaxKind;
        isNode(): boolean;
        isToken(): boolean;
        isList(): boolean;
        isSeparatedList(): boolean;
        childCount(): number;
        childAt(index: number): TypeScript.ISyntaxElement;
        isTypeScriptSpecific(): boolean;
        isIncrementallyUnusable(): boolean;
        fullWidth(): number;
        width(): number;
        fullText(): string;
        leadingTrivia(): TypeScript.ISyntaxTriviaList;
        trailingTrivia(): TypeScript.ISyntaxTriviaList;
        leadingTriviaWidth(): number;
        trailingTriviaWidth(): number;
        firstToken(): TypeScript.ISyntaxToken;
        lastToken(): TypeScript.ISyntaxToken;
        collectTextElements(elements: string[]): void;
    }
    interface ISyntaxNode extends TypeScript.ISyntaxNodeOrToken {
    }
    interface IModuleReferenceSyntax extends TypeScript.ISyntaxNode {
    }
    interface IModuleElementSyntax extends ISyntaxNode {
    }
    interface IStatementSyntax extends TypeScript.IModuleElementSyntax {
    }
    interface ITypeMemberSyntax extends ISyntaxNode {
    }
    interface IClassElementSyntax extends ISyntaxNode {
    }
    interface IMemberDeclarationSyntax extends TypeScript.IClassElementSyntax {
    }
    interface ISwitchClauseSyntax extends TypeScript.ISyntaxNode {
    }
    interface IExpressionSyntax extends TypeScript.ISyntaxNodeOrToken {
    }
    interface IUnaryExpressionSyntax extends TypeScript.IExpressionSyntax {
    }
    interface ITypeSyntax extends TypeScript.IUnaryExpressionSyntax {
    }
    interface INameSyntax extends TypeScript.ITypeSyntax {
    }
}
declare module TypeScript.Syntax {
    interface IFactory {
        sourceUnit(moduleElements: ISyntaxList, endOfFileToken: ISyntaxToken): SourceUnitSyntax;
        externalModuleReference(moduleKeyword: ISyntaxToken, openParenToken: ISyntaxToken, stringLiteral: ISyntaxToken, closeParenToken: ISyntaxToken): ExternalModuleReferenceSyntax;
        moduleNameModuleReference(moduleName: INameSyntax): ModuleNameModuleReferenceSyntax;
        importDeclaration(importKeyword: ISyntaxToken, identifier: ISyntaxToken, equalsToken: ISyntaxToken, moduleReference: ModuleReferenceSyntax, semicolonToken: ISyntaxToken): ImportDeclarationSyntax;
        exportAssignment(exportKeyword: ISyntaxToken, equalsToken: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ExportAssignmentSyntax;
        classDeclaration(modifiers: ISyntaxList, classKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, openBraceToken: ISyntaxToken, classElements: ISyntaxList, closeBraceToken: ISyntaxToken): ClassDeclarationSyntax;
        interfaceDeclaration(modifiers: ISyntaxList, interfaceKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, body: ObjectTypeSyntax): InterfaceDeclarationSyntax;
        heritageClause(extendsOrImplementsKeyword: ISyntaxToken, typeNames: ISeparatedSyntaxList): HeritageClauseSyntax;
        moduleDeclaration(modifiers: ISyntaxList, moduleKeyword: ISyntaxToken, moduleName: INameSyntax, stringLiteral: ISyntaxToken, openBraceToken: ISyntaxToken, moduleElements: ISyntaxList, closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax;
        functionDeclaration(modifiers: ISyntaxList, functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): FunctionDeclarationSyntax;
        variableStatement(modifiers: ISyntaxList, variableDeclaration: VariableDeclarationSyntax, semicolonToken: ISyntaxToken): VariableStatementSyntax;
        variableDeclaration(varKeyword: ISyntaxToken, variableDeclarators: ISeparatedSyntaxList): VariableDeclarationSyntax;
        variableDeclarator(identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): VariableDeclaratorSyntax;
        equalsValueClause(equalsToken: ISyntaxToken, value: IExpressionSyntax): EqualsValueClauseSyntax;
        prefixUnaryExpression(kind: SyntaxKind, operatorToken: ISyntaxToken, operand: IUnaryExpressionSyntax): PrefixUnaryExpressionSyntax;
        arrayLiteralExpression(openBracketToken: ISyntaxToken, expressions: ISeparatedSyntaxList, closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax;
        omittedExpression(): OmittedExpressionSyntax;
        parenthesizedExpression(openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken): ParenthesizedExpressionSyntax;
        simpleArrowFunctionExpression(identifier: ISyntaxToken, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): SimpleArrowFunctionExpressionSyntax;
        parenthesizedArrowFunctionExpression(callSignature: CallSignatureSyntax, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): ParenthesizedArrowFunctionExpressionSyntax;
        qualifiedName(left: INameSyntax, dotToken: ISyntaxToken, right: ISyntaxToken): QualifiedNameSyntax;
        typeArgumentList(lessThanToken: ISyntaxToken, typeArguments: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeArgumentListSyntax;
        constructorType(newKeyword: ISyntaxToken, typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): ConstructorTypeSyntax;
        functionType(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): FunctionTypeSyntax;
        objectType(openBraceToken: ISyntaxToken, typeMembers: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectTypeSyntax;
        arrayType(type: ITypeSyntax, openBracketToken: ISyntaxToken, closeBracketToken: ISyntaxToken): ArrayTypeSyntax;
        genericType(name: INameSyntax, typeArgumentList: TypeArgumentListSyntax): GenericTypeSyntax;
        typeAnnotation(colonToken: ISyntaxToken, type: ITypeSyntax): TypeAnnotationSyntax;
        block(openBraceToken: ISyntaxToken, statements: ISyntaxList, closeBraceToken: ISyntaxToken): BlockSyntax;
        parameter(dotDotDotToken: ISyntaxToken, publicOrPrivateKeyword: ISyntaxToken, identifier: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): ParameterSyntax;
        memberAccessExpression(expression: IExpressionSyntax, dotToken: ISyntaxToken, name: ISyntaxToken): MemberAccessExpressionSyntax;
        postfixUnaryExpression(kind: SyntaxKind, operand: IExpressionSyntax, operatorToken: ISyntaxToken): PostfixUnaryExpressionSyntax;
        elementAccessExpression(expression: IExpressionSyntax, openBracketToken: ISyntaxToken, argumentExpression: IExpressionSyntax, closeBracketToken: ISyntaxToken): ElementAccessExpressionSyntax;
        invocationExpression(expression: IExpressionSyntax, argumentList: ArgumentListSyntax): InvocationExpressionSyntax;
        argumentList(typeArgumentList: TypeArgumentListSyntax, openParenToken: ISyntaxToken, arguments: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ArgumentListSyntax;
        binaryExpression(kind: SyntaxKind, left: IExpressionSyntax, operatorToken: ISyntaxToken, right: IExpressionSyntax): BinaryExpressionSyntax;
        conditionalExpression(condition: IExpressionSyntax, questionToken: ISyntaxToken, whenTrue: IExpressionSyntax, colonToken: ISyntaxToken, whenFalse: IExpressionSyntax): ConditionalExpressionSyntax;
        constructSignature(newKeyword: ISyntaxToken, callSignature: CallSignatureSyntax): ConstructSignatureSyntax;
        methodSignature(propertyName: ISyntaxToken, questionToken: ISyntaxToken, callSignature: CallSignatureSyntax): MethodSignatureSyntax;
        indexSignature(openBracketToken: ISyntaxToken, parameter: ParameterSyntax, closeBracketToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): IndexSignatureSyntax;
        propertySignature(propertyName: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): PropertySignatureSyntax;
        callSignature(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax): CallSignatureSyntax;
        parameterList(openParenToken: ISyntaxToken, parameters: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ParameterListSyntax;
        typeParameterList(lessThanToken: ISyntaxToken, typeParameters: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeParameterListSyntax;
        typeParameter(identifier: ISyntaxToken, constraint: ConstraintSyntax): TypeParameterSyntax;
        constraint(extendsKeyword: ISyntaxToken, type: ITypeSyntax): ConstraintSyntax;
        elseClause(elseKeyword: ISyntaxToken, statement: IStatementSyntax): ElseClauseSyntax;
        ifStatement(ifKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, elseClause: ElseClauseSyntax): IfStatementSyntax;
        expressionStatement(expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ExpressionStatementSyntax;
        constructorDeclaration(constructorKeyword: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): ConstructorDeclarationSyntax;
        memberFunctionDeclaration(modifiers: ISyntaxList, propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): MemberFunctionDeclarationSyntax;
        getMemberAccessorDeclaration(modifiers: ISyntaxList, getKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetMemberAccessorDeclarationSyntax;
        setMemberAccessorDeclaration(modifiers: ISyntaxList, setKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax): SetMemberAccessorDeclarationSyntax;
        memberVariableDeclaration(modifiers: ISyntaxList, variableDeclarator: VariableDeclaratorSyntax, semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax;
        throwStatement(throwKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ThrowStatementSyntax;
        returnStatement(returnKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ReturnStatementSyntax;
        objectCreationExpression(newKeyword: ISyntaxToken, expression: IExpressionSyntax, argumentList: ArgumentListSyntax): ObjectCreationExpressionSyntax;
        switchStatement(switchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, openBraceToken: ISyntaxToken, switchClauses: ISyntaxList, closeBraceToken: ISyntaxToken): SwitchStatementSyntax;
        caseSwitchClause(caseKeyword: ISyntaxToken, expression: IExpressionSyntax, colonToken: ISyntaxToken, statements: ISyntaxList): CaseSwitchClauseSyntax;
        defaultSwitchClause(defaultKeyword: ISyntaxToken, colonToken: ISyntaxToken, statements: ISyntaxList): DefaultSwitchClauseSyntax;
        breakStatement(breakKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): BreakStatementSyntax;
        continueStatement(continueKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ContinueStatementSyntax;
        forStatement(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, initializer: IExpressionSyntax, firstSemicolonToken: ISyntaxToken, condition: IExpressionSyntax, secondSemicolonToken: ISyntaxToken, incrementor: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForStatementSyntax;
        forInStatement(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, left: IExpressionSyntax, inKeyword: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForInStatementSyntax;
        whileStatement(whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WhileStatementSyntax;
        withStatement(withKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WithStatementSyntax;
        enumDeclaration(modifiers: ISyntaxList, enumKeyword: ISyntaxToken, identifier: ISyntaxToken, openBraceToken: ISyntaxToken, enumElements: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): EnumDeclarationSyntax;
        enumElement(propertyName: ISyntaxToken, equalsValueClause: EqualsValueClauseSyntax): EnumElementSyntax;
        castExpression(lessThanToken: ISyntaxToken, type: ITypeSyntax, greaterThanToken: ISyntaxToken, expression: IUnaryExpressionSyntax): CastExpressionSyntax;
        objectLiteralExpression(openBraceToken: ISyntaxToken, propertyAssignments: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax;
        simplePropertyAssignment(propertyName: ISyntaxToken, colonToken: ISyntaxToken, expression: IExpressionSyntax): SimplePropertyAssignmentSyntax;
        functionPropertyAssignment(propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionPropertyAssignmentSyntax;
        getAccessorPropertyAssignment(getKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetAccessorPropertyAssignmentSyntax;
        setAccessorPropertyAssignment(setKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, parameter: ParameterSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): SetAccessorPropertyAssignmentSyntax;
        functionExpression(functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionExpressionSyntax;
        emptyStatement(semicolonToken: ISyntaxToken): EmptyStatementSyntax;
        tryStatement(tryKeyword: ISyntaxToken, block: BlockSyntax, catchClause: CatchClauseSyntax, finallyClause: FinallyClauseSyntax): TryStatementSyntax;
        catchClause(catchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): CatchClauseSyntax;
        finallyClause(finallyKeyword: ISyntaxToken, block: BlockSyntax): FinallyClauseSyntax;
        labeledStatement(identifier: ISyntaxToken, colonToken: ISyntaxToken, statement: IStatementSyntax): LabeledStatementSyntax;
        doStatement(doKeyword: ISyntaxToken, statement: IStatementSyntax, whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, semicolonToken: ISyntaxToken): DoStatementSyntax;
        typeOfExpression(typeOfKeyword: ISyntaxToken, expression: IExpressionSyntax): TypeOfExpressionSyntax;
        deleteExpression(deleteKeyword: ISyntaxToken, expression: IExpressionSyntax): DeleteExpressionSyntax;
        voidExpression(voidKeyword: ISyntaxToken, expression: IExpressionSyntax): VoidExpressionSyntax;
        debuggerStatement(debuggerKeyword: ISyntaxToken, semicolonToken: ISyntaxToken): DebuggerStatementSyntax;
    }
    class NormalModeFactory implements IFactory {
        public sourceUnit(moduleElements: ISyntaxList, endOfFileToken: ISyntaxToken): SourceUnitSyntax;
        public externalModuleReference(moduleKeyword: ISyntaxToken, openParenToken: ISyntaxToken, stringLiteral: ISyntaxToken, closeParenToken: ISyntaxToken): ExternalModuleReferenceSyntax;
        public moduleNameModuleReference(moduleName: INameSyntax): ModuleNameModuleReferenceSyntax;
        public importDeclaration(importKeyword: ISyntaxToken, identifier: ISyntaxToken, equalsToken: ISyntaxToken, moduleReference: ModuleReferenceSyntax, semicolonToken: ISyntaxToken): ImportDeclarationSyntax;
        public exportAssignment(exportKeyword: ISyntaxToken, equalsToken: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ExportAssignmentSyntax;
        public classDeclaration(modifiers: ISyntaxList, classKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, openBraceToken: ISyntaxToken, classElements: ISyntaxList, closeBraceToken: ISyntaxToken): ClassDeclarationSyntax;
        public interfaceDeclaration(modifiers: ISyntaxList, interfaceKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, body: ObjectTypeSyntax): InterfaceDeclarationSyntax;
        public heritageClause(extendsOrImplementsKeyword: ISyntaxToken, typeNames: ISeparatedSyntaxList): HeritageClauseSyntax;
        public moduleDeclaration(modifiers: ISyntaxList, moduleKeyword: ISyntaxToken, moduleName: INameSyntax, stringLiteral: ISyntaxToken, openBraceToken: ISyntaxToken, moduleElements: ISyntaxList, closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax;
        public functionDeclaration(modifiers: ISyntaxList, functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): FunctionDeclarationSyntax;
        public variableStatement(modifiers: ISyntaxList, variableDeclaration: VariableDeclarationSyntax, semicolonToken: ISyntaxToken): VariableStatementSyntax;
        public variableDeclaration(varKeyword: ISyntaxToken, variableDeclarators: ISeparatedSyntaxList): VariableDeclarationSyntax;
        public variableDeclarator(identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): VariableDeclaratorSyntax;
        public equalsValueClause(equalsToken: ISyntaxToken, value: IExpressionSyntax): EqualsValueClauseSyntax;
        public prefixUnaryExpression(kind: SyntaxKind, operatorToken: ISyntaxToken, operand: IUnaryExpressionSyntax): PrefixUnaryExpressionSyntax;
        public arrayLiteralExpression(openBracketToken: ISyntaxToken, expressions: ISeparatedSyntaxList, closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax;
        public omittedExpression(): OmittedExpressionSyntax;
        public parenthesizedExpression(openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken): ParenthesizedExpressionSyntax;
        public simpleArrowFunctionExpression(identifier: ISyntaxToken, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): SimpleArrowFunctionExpressionSyntax;
        public parenthesizedArrowFunctionExpression(callSignature: CallSignatureSyntax, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): ParenthesizedArrowFunctionExpressionSyntax;
        public qualifiedName(left: INameSyntax, dotToken: ISyntaxToken, right: ISyntaxToken): QualifiedNameSyntax;
        public typeArgumentList(lessThanToken: ISyntaxToken, typeArguments: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeArgumentListSyntax;
        public constructorType(newKeyword: ISyntaxToken, typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): ConstructorTypeSyntax;
        public functionType(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): FunctionTypeSyntax;
        public objectType(openBraceToken: ISyntaxToken, typeMembers: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectTypeSyntax;
        public arrayType(type: ITypeSyntax, openBracketToken: ISyntaxToken, closeBracketToken: ISyntaxToken): ArrayTypeSyntax;
        public genericType(name: INameSyntax, typeArgumentList: TypeArgumentListSyntax): GenericTypeSyntax;
        public typeAnnotation(colonToken: ISyntaxToken, type: ITypeSyntax): TypeAnnotationSyntax;
        public block(openBraceToken: ISyntaxToken, statements: ISyntaxList, closeBraceToken: ISyntaxToken): BlockSyntax;
        public parameter(dotDotDotToken: ISyntaxToken, publicOrPrivateKeyword: ISyntaxToken, identifier: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): ParameterSyntax;
        public memberAccessExpression(expression: IExpressionSyntax, dotToken: ISyntaxToken, name: ISyntaxToken): MemberAccessExpressionSyntax;
        public postfixUnaryExpression(kind: SyntaxKind, operand: IExpressionSyntax, operatorToken: ISyntaxToken): PostfixUnaryExpressionSyntax;
        public elementAccessExpression(expression: IExpressionSyntax, openBracketToken: ISyntaxToken, argumentExpression: IExpressionSyntax, closeBracketToken: ISyntaxToken): ElementAccessExpressionSyntax;
        public invocationExpression(expression: IExpressionSyntax, argumentList: ArgumentListSyntax): InvocationExpressionSyntax;
        public argumentList(typeArgumentList: TypeArgumentListSyntax, openParenToken: ISyntaxToken, _arguments: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ArgumentListSyntax;
        public binaryExpression(kind: SyntaxKind, left: IExpressionSyntax, operatorToken: ISyntaxToken, right: IExpressionSyntax): BinaryExpressionSyntax;
        public conditionalExpression(condition: IExpressionSyntax, questionToken: ISyntaxToken, whenTrue: IExpressionSyntax, colonToken: ISyntaxToken, whenFalse: IExpressionSyntax): ConditionalExpressionSyntax;
        public constructSignature(newKeyword: ISyntaxToken, callSignature: CallSignatureSyntax): ConstructSignatureSyntax;
        public methodSignature(propertyName: ISyntaxToken, questionToken: ISyntaxToken, callSignature: CallSignatureSyntax): MethodSignatureSyntax;
        public indexSignature(openBracketToken: ISyntaxToken, parameter: ParameterSyntax, closeBracketToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): IndexSignatureSyntax;
        public propertySignature(propertyName: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): PropertySignatureSyntax;
        public callSignature(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax): CallSignatureSyntax;
        public parameterList(openParenToken: ISyntaxToken, parameters: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ParameterListSyntax;
        public typeParameterList(lessThanToken: ISyntaxToken, typeParameters: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeParameterListSyntax;
        public typeParameter(identifier: ISyntaxToken, constraint: ConstraintSyntax): TypeParameterSyntax;
        public constraint(extendsKeyword: ISyntaxToken, type: ITypeSyntax): ConstraintSyntax;
        public elseClause(elseKeyword: ISyntaxToken, statement: IStatementSyntax): ElseClauseSyntax;
        public ifStatement(ifKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, elseClause: ElseClauseSyntax): IfStatementSyntax;
        public expressionStatement(expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ExpressionStatementSyntax;
        public constructorDeclaration(constructorKeyword: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): ConstructorDeclarationSyntax;
        public memberFunctionDeclaration(modifiers: ISyntaxList, propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): MemberFunctionDeclarationSyntax;
        public getMemberAccessorDeclaration(modifiers: ISyntaxList, getKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetMemberAccessorDeclarationSyntax;
        public setMemberAccessorDeclaration(modifiers: ISyntaxList, setKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax): SetMemberAccessorDeclarationSyntax;
        public memberVariableDeclaration(modifiers: ISyntaxList, variableDeclarator: VariableDeclaratorSyntax, semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax;
        public throwStatement(throwKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ThrowStatementSyntax;
        public returnStatement(returnKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ReturnStatementSyntax;
        public objectCreationExpression(newKeyword: ISyntaxToken, expression: IExpressionSyntax, argumentList: ArgumentListSyntax): ObjectCreationExpressionSyntax;
        public switchStatement(switchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, openBraceToken: ISyntaxToken, switchClauses: ISyntaxList, closeBraceToken: ISyntaxToken): SwitchStatementSyntax;
        public caseSwitchClause(caseKeyword: ISyntaxToken, expression: IExpressionSyntax, colonToken: ISyntaxToken, statements: ISyntaxList): CaseSwitchClauseSyntax;
        public defaultSwitchClause(defaultKeyword: ISyntaxToken, colonToken: ISyntaxToken, statements: ISyntaxList): DefaultSwitchClauseSyntax;
        public breakStatement(breakKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): BreakStatementSyntax;
        public continueStatement(continueKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ContinueStatementSyntax;
        public forStatement(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, initializer: IExpressionSyntax, firstSemicolonToken: ISyntaxToken, condition: IExpressionSyntax, secondSemicolonToken: ISyntaxToken, incrementor: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForStatementSyntax;
        public forInStatement(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, left: IExpressionSyntax, inKeyword: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForInStatementSyntax;
        public whileStatement(whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WhileStatementSyntax;
        public withStatement(withKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WithStatementSyntax;
        public enumDeclaration(modifiers: ISyntaxList, enumKeyword: ISyntaxToken, identifier: ISyntaxToken, openBraceToken: ISyntaxToken, enumElements: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): EnumDeclarationSyntax;
        public enumElement(propertyName: ISyntaxToken, equalsValueClause: EqualsValueClauseSyntax): EnumElementSyntax;
        public castExpression(lessThanToken: ISyntaxToken, type: ITypeSyntax, greaterThanToken: ISyntaxToken, expression: IUnaryExpressionSyntax): CastExpressionSyntax;
        public objectLiteralExpression(openBraceToken: ISyntaxToken, propertyAssignments: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax;
        public simplePropertyAssignment(propertyName: ISyntaxToken, colonToken: ISyntaxToken, expression: IExpressionSyntax): SimplePropertyAssignmentSyntax;
        public functionPropertyAssignment(propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionPropertyAssignmentSyntax;
        public getAccessorPropertyAssignment(getKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetAccessorPropertyAssignmentSyntax;
        public setAccessorPropertyAssignment(setKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, parameter: ParameterSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): SetAccessorPropertyAssignmentSyntax;
        public functionExpression(functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionExpressionSyntax;
        public emptyStatement(semicolonToken: ISyntaxToken): EmptyStatementSyntax;
        public tryStatement(tryKeyword: ISyntaxToken, block: BlockSyntax, catchClause: CatchClauseSyntax, finallyClause: FinallyClauseSyntax): TryStatementSyntax;
        public catchClause(catchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): CatchClauseSyntax;
        public finallyClause(finallyKeyword: ISyntaxToken, block: BlockSyntax): FinallyClauseSyntax;
        public labeledStatement(identifier: ISyntaxToken, colonToken: ISyntaxToken, statement: IStatementSyntax): LabeledStatementSyntax;
        public doStatement(doKeyword: ISyntaxToken, statement: IStatementSyntax, whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, semicolonToken: ISyntaxToken): DoStatementSyntax;
        public typeOfExpression(typeOfKeyword: ISyntaxToken, expression: IExpressionSyntax): TypeOfExpressionSyntax;
        public deleteExpression(deleteKeyword: ISyntaxToken, expression: IExpressionSyntax): DeleteExpressionSyntax;
        public voidExpression(voidKeyword: ISyntaxToken, expression: IExpressionSyntax): VoidExpressionSyntax;
        public debuggerStatement(debuggerKeyword: ISyntaxToken, semicolonToken: ISyntaxToken): DebuggerStatementSyntax;
    }
    class StrictModeFactory implements IFactory {
        public sourceUnit(moduleElements: ISyntaxList, endOfFileToken: ISyntaxToken): SourceUnitSyntax;
        public externalModuleReference(moduleKeyword: ISyntaxToken, openParenToken: ISyntaxToken, stringLiteral: ISyntaxToken, closeParenToken: ISyntaxToken): ExternalModuleReferenceSyntax;
        public moduleNameModuleReference(moduleName: INameSyntax): ModuleNameModuleReferenceSyntax;
        public importDeclaration(importKeyword: ISyntaxToken, identifier: ISyntaxToken, equalsToken: ISyntaxToken, moduleReference: ModuleReferenceSyntax, semicolonToken: ISyntaxToken): ImportDeclarationSyntax;
        public exportAssignment(exportKeyword: ISyntaxToken, equalsToken: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ExportAssignmentSyntax;
        public classDeclaration(modifiers: ISyntaxList, classKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, openBraceToken: ISyntaxToken, classElements: ISyntaxList, closeBraceToken: ISyntaxToken): ClassDeclarationSyntax;
        public interfaceDeclaration(modifiers: ISyntaxList, interfaceKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, body: ObjectTypeSyntax): InterfaceDeclarationSyntax;
        public heritageClause(extendsOrImplementsKeyword: ISyntaxToken, typeNames: ISeparatedSyntaxList): HeritageClauseSyntax;
        public moduleDeclaration(modifiers: ISyntaxList, moduleKeyword: ISyntaxToken, moduleName: INameSyntax, stringLiteral: ISyntaxToken, openBraceToken: ISyntaxToken, moduleElements: ISyntaxList, closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax;
        public functionDeclaration(modifiers: ISyntaxList, functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): FunctionDeclarationSyntax;
        public variableStatement(modifiers: ISyntaxList, variableDeclaration: VariableDeclarationSyntax, semicolonToken: ISyntaxToken): VariableStatementSyntax;
        public variableDeclaration(varKeyword: ISyntaxToken, variableDeclarators: ISeparatedSyntaxList): VariableDeclarationSyntax;
        public variableDeclarator(identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): VariableDeclaratorSyntax;
        public equalsValueClause(equalsToken: ISyntaxToken, value: IExpressionSyntax): EqualsValueClauseSyntax;
        public prefixUnaryExpression(kind: SyntaxKind, operatorToken: ISyntaxToken, operand: IUnaryExpressionSyntax): PrefixUnaryExpressionSyntax;
        public arrayLiteralExpression(openBracketToken: ISyntaxToken, expressions: ISeparatedSyntaxList, closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax;
        public omittedExpression(): OmittedExpressionSyntax;
        public parenthesizedExpression(openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken): ParenthesizedExpressionSyntax;
        public simpleArrowFunctionExpression(identifier: ISyntaxToken, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): SimpleArrowFunctionExpressionSyntax;
        public parenthesizedArrowFunctionExpression(callSignature: CallSignatureSyntax, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): ParenthesizedArrowFunctionExpressionSyntax;
        public qualifiedName(left: INameSyntax, dotToken: ISyntaxToken, right: ISyntaxToken): QualifiedNameSyntax;
        public typeArgumentList(lessThanToken: ISyntaxToken, typeArguments: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeArgumentListSyntax;
        public constructorType(newKeyword: ISyntaxToken, typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): ConstructorTypeSyntax;
        public functionType(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): FunctionTypeSyntax;
        public objectType(openBraceToken: ISyntaxToken, typeMembers: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectTypeSyntax;
        public arrayType(type: ITypeSyntax, openBracketToken: ISyntaxToken, closeBracketToken: ISyntaxToken): ArrayTypeSyntax;
        public genericType(name: INameSyntax, typeArgumentList: TypeArgumentListSyntax): GenericTypeSyntax;
        public typeAnnotation(colonToken: ISyntaxToken, type: ITypeSyntax): TypeAnnotationSyntax;
        public block(openBraceToken: ISyntaxToken, statements: ISyntaxList, closeBraceToken: ISyntaxToken): BlockSyntax;
        public parameter(dotDotDotToken: ISyntaxToken, publicOrPrivateKeyword: ISyntaxToken, identifier: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): ParameterSyntax;
        public memberAccessExpression(expression: IExpressionSyntax, dotToken: ISyntaxToken, name: ISyntaxToken): MemberAccessExpressionSyntax;
        public postfixUnaryExpression(kind: SyntaxKind, operand: IExpressionSyntax, operatorToken: ISyntaxToken): PostfixUnaryExpressionSyntax;
        public elementAccessExpression(expression: IExpressionSyntax, openBracketToken: ISyntaxToken, argumentExpression: IExpressionSyntax, closeBracketToken: ISyntaxToken): ElementAccessExpressionSyntax;
        public invocationExpression(expression: IExpressionSyntax, argumentList: ArgumentListSyntax): InvocationExpressionSyntax;
        public argumentList(typeArgumentList: TypeArgumentListSyntax, openParenToken: ISyntaxToken, _arguments: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ArgumentListSyntax;
        public binaryExpression(kind: SyntaxKind, left: IExpressionSyntax, operatorToken: ISyntaxToken, right: IExpressionSyntax): BinaryExpressionSyntax;
        public conditionalExpression(condition: IExpressionSyntax, questionToken: ISyntaxToken, whenTrue: IExpressionSyntax, colonToken: ISyntaxToken, whenFalse: IExpressionSyntax): ConditionalExpressionSyntax;
        public constructSignature(newKeyword: ISyntaxToken, callSignature: CallSignatureSyntax): ConstructSignatureSyntax;
        public methodSignature(propertyName: ISyntaxToken, questionToken: ISyntaxToken, callSignature: CallSignatureSyntax): MethodSignatureSyntax;
        public indexSignature(openBracketToken: ISyntaxToken, parameter: ParameterSyntax, closeBracketToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): IndexSignatureSyntax;
        public propertySignature(propertyName: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): PropertySignatureSyntax;
        public callSignature(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax): CallSignatureSyntax;
        public parameterList(openParenToken: ISyntaxToken, parameters: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ParameterListSyntax;
        public typeParameterList(lessThanToken: ISyntaxToken, typeParameters: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeParameterListSyntax;
        public typeParameter(identifier: ISyntaxToken, constraint: ConstraintSyntax): TypeParameterSyntax;
        public constraint(extendsKeyword: ISyntaxToken, type: ITypeSyntax): ConstraintSyntax;
        public elseClause(elseKeyword: ISyntaxToken, statement: IStatementSyntax): ElseClauseSyntax;
        public ifStatement(ifKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, elseClause: ElseClauseSyntax): IfStatementSyntax;
        public expressionStatement(expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ExpressionStatementSyntax;
        public constructorDeclaration(constructorKeyword: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): ConstructorDeclarationSyntax;
        public memberFunctionDeclaration(modifiers: ISyntaxList, propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): MemberFunctionDeclarationSyntax;
        public getMemberAccessorDeclaration(modifiers: ISyntaxList, getKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetMemberAccessorDeclarationSyntax;
        public setMemberAccessorDeclaration(modifiers: ISyntaxList, setKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax): SetMemberAccessorDeclarationSyntax;
        public memberVariableDeclaration(modifiers: ISyntaxList, variableDeclarator: VariableDeclaratorSyntax, semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax;
        public throwStatement(throwKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ThrowStatementSyntax;
        public returnStatement(returnKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ReturnStatementSyntax;
        public objectCreationExpression(newKeyword: ISyntaxToken, expression: IExpressionSyntax, argumentList: ArgumentListSyntax): ObjectCreationExpressionSyntax;
        public switchStatement(switchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, openBraceToken: ISyntaxToken, switchClauses: ISyntaxList, closeBraceToken: ISyntaxToken): SwitchStatementSyntax;
        public caseSwitchClause(caseKeyword: ISyntaxToken, expression: IExpressionSyntax, colonToken: ISyntaxToken, statements: ISyntaxList): CaseSwitchClauseSyntax;
        public defaultSwitchClause(defaultKeyword: ISyntaxToken, colonToken: ISyntaxToken, statements: ISyntaxList): DefaultSwitchClauseSyntax;
        public breakStatement(breakKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): BreakStatementSyntax;
        public continueStatement(continueKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ContinueStatementSyntax;
        public forStatement(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, initializer: IExpressionSyntax, firstSemicolonToken: ISyntaxToken, condition: IExpressionSyntax, secondSemicolonToken: ISyntaxToken, incrementor: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForStatementSyntax;
        public forInStatement(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, left: IExpressionSyntax, inKeyword: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForInStatementSyntax;
        public whileStatement(whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WhileStatementSyntax;
        public withStatement(withKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WithStatementSyntax;
        public enumDeclaration(modifiers: ISyntaxList, enumKeyword: ISyntaxToken, identifier: ISyntaxToken, openBraceToken: ISyntaxToken, enumElements: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): EnumDeclarationSyntax;
        public enumElement(propertyName: ISyntaxToken, equalsValueClause: EqualsValueClauseSyntax): EnumElementSyntax;
        public castExpression(lessThanToken: ISyntaxToken, type: ITypeSyntax, greaterThanToken: ISyntaxToken, expression: IUnaryExpressionSyntax): CastExpressionSyntax;
        public objectLiteralExpression(openBraceToken: ISyntaxToken, propertyAssignments: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax;
        public simplePropertyAssignment(propertyName: ISyntaxToken, colonToken: ISyntaxToken, expression: IExpressionSyntax): SimplePropertyAssignmentSyntax;
        public functionPropertyAssignment(propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionPropertyAssignmentSyntax;
        public getAccessorPropertyAssignment(getKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetAccessorPropertyAssignmentSyntax;
        public setAccessorPropertyAssignment(setKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, parameter: ParameterSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): SetAccessorPropertyAssignmentSyntax;
        public functionExpression(functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionExpressionSyntax;
        public emptyStatement(semicolonToken: ISyntaxToken): EmptyStatementSyntax;
        public tryStatement(tryKeyword: ISyntaxToken, block: BlockSyntax, catchClause: CatchClauseSyntax, finallyClause: FinallyClauseSyntax): TryStatementSyntax;
        public catchClause(catchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): CatchClauseSyntax;
        public finallyClause(finallyKeyword: ISyntaxToken, block: BlockSyntax): FinallyClauseSyntax;
        public labeledStatement(identifier: ISyntaxToken, colonToken: ISyntaxToken, statement: IStatementSyntax): LabeledStatementSyntax;
        public doStatement(doKeyword: ISyntaxToken, statement: IStatementSyntax, whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, semicolonToken: ISyntaxToken): DoStatementSyntax;
        public typeOfExpression(typeOfKeyword: ISyntaxToken, expression: IExpressionSyntax): TypeOfExpressionSyntax;
        public deleteExpression(deleteKeyword: ISyntaxToken, expression: IExpressionSyntax): DeleteExpressionSyntax;
        public voidExpression(voidKeyword: ISyntaxToken, expression: IExpressionSyntax): VoidExpressionSyntax;
        public debuggerStatement(debuggerKeyword: ISyntaxToken, semicolonToken: ISyntaxToken): DebuggerStatementSyntax;
    }
    var normalModeFactory: IFactory;
    var strictModeFactory: IFactory;
}
declare module TypeScript {
    enum SyntaxKind {
        None,
        List,
        SeparatedList,
        TriviaList,
        WhitespaceTrivia,
        NewLineTrivia,
        MultiLineCommentTrivia,
        SingleLineCommentTrivia,
        SkippedTokenTrivia,
        ErrorToken,
        EndOfFileToken,
        IdentifierName,
        RegularExpressionLiteral,
        NumericLiteral,
        StringLiteral,
        BreakKeyword,
        CaseKeyword,
        CatchKeyword,
        ContinueKeyword,
        DebuggerKeyword,
        DefaultKeyword,
        DeleteKeyword,
        DoKeyword,
        ElseKeyword,
        FalseKeyword,
        FinallyKeyword,
        ForKeyword,
        FunctionKeyword,
        IfKeyword,
        InKeyword,
        InstanceOfKeyword,
        NewKeyword,
        NullKeyword,
        ReturnKeyword,
        SwitchKeyword,
        ThisKeyword,
        ThrowKeyword,
        TrueKeyword,
        TryKeyword,
        TypeOfKeyword,
        VarKeyword,
        VoidKeyword,
        WhileKeyword,
        WithKeyword,
        ClassKeyword,
        ConstKeyword,
        EnumKeyword,
        ExportKeyword,
        ExtendsKeyword,
        ImportKeyword,
        SuperKeyword,
        ImplementsKeyword,
        InterfaceKeyword,
        LetKeyword,
        PackageKeyword,
        PrivateKeyword,
        ProtectedKeyword,
        PublicKeyword,
        StaticKeyword,
        YieldKeyword,
        AnyKeyword,
        BooleanKeyword,
        BoolKeyword,
        ConstructorKeyword,
        DeclareKeyword,
        GetKeyword,
        ModuleKeyword,
        NumberKeyword,
        SetKeyword,
        StringKeyword,
        OpenBraceToken,
        CloseBraceToken,
        OpenParenToken,
        CloseParenToken,
        OpenBracketToken,
        CloseBracketToken,
        DotToken,
        DotDotDotToken,
        SemicolonToken,
        CommaToken,
        LessThanToken,
        GreaterThanToken,
        LessThanEqualsToken,
        GreaterThanEqualsToken,
        EqualsEqualsToken,
        EqualsGreaterThanToken,
        ExclamationEqualsToken,
        EqualsEqualsEqualsToken,
        ExclamationEqualsEqualsToken,
        PlusToken,
        MinusToken,
        AsteriskToken,
        PercentToken,
        PlusPlusToken,
        MinusMinusToken,
        LessThanLessThanToken,
        GreaterThanGreaterThanToken,
        GreaterThanGreaterThanGreaterThanToken,
        AmpersandToken,
        BarToken,
        CaretToken,
        ExclamationToken,
        TildeToken,
        AmpersandAmpersandToken,
        BarBarToken,
        QuestionToken,
        ColonToken,
        EqualsToken,
        PlusEqualsToken,
        MinusEqualsToken,
        AsteriskEqualsToken,
        PercentEqualsToken,
        LessThanLessThanEqualsToken,
        GreaterThanGreaterThanEqualsToken,
        GreaterThanGreaterThanGreaterThanEqualsToken,
        AmpersandEqualsToken,
        BarEqualsToken,
        CaretEqualsToken,
        SlashToken,
        SlashEqualsToken,
        SourceUnit,
        QualifiedName,
        ObjectType,
        FunctionType,
        ArrayType,
        ConstructorType,
        GenericType,
        InterfaceDeclaration,
        FunctionDeclaration,
        ModuleDeclaration,
        ClassDeclaration,
        EnumDeclaration,
        ImportDeclaration,
        ExportAssignment,
        MemberFunctionDeclaration,
        MemberVariableDeclaration,
        ConstructorDeclaration,
        GetMemberAccessorDeclaration,
        SetMemberAccessorDeclaration,
        PropertySignature,
        CallSignature,
        ConstructSignature,
        IndexSignature,
        MethodSignature,
        Block,
        IfStatement,
        VariableStatement,
        ExpressionStatement,
        ReturnStatement,
        SwitchStatement,
        BreakStatement,
        ContinueStatement,
        ForStatement,
        ForInStatement,
        EmptyStatement,
        ThrowStatement,
        WhileStatement,
        TryStatement,
        LabeledStatement,
        DoStatement,
        DebuggerStatement,
        WithStatement,
        PlusExpression,
        NegateExpression,
        BitwiseNotExpression,
        LogicalNotExpression,
        PreIncrementExpression,
        PreDecrementExpression,
        DeleteExpression,
        TypeOfExpression,
        VoidExpression,
        CommaExpression,
        AssignmentExpression,
        AddAssignmentExpression,
        SubtractAssignmentExpression,
        MultiplyAssignmentExpression,
        DivideAssignmentExpression,
        ModuloAssignmentExpression,
        AndAssignmentExpression,
        ExclusiveOrAssignmentExpression,
        OrAssignmentExpression,
        LeftShiftAssignmentExpression,
        SignedRightShiftAssignmentExpression,
        UnsignedRightShiftAssignmentExpression,
        ConditionalExpression,
        LogicalOrExpression,
        LogicalAndExpression,
        BitwiseOrExpression,
        BitwiseExclusiveOrExpression,
        BitwiseAndExpression,
        EqualsWithTypeConversionExpression,
        NotEqualsWithTypeConversionExpression,
        EqualsExpression,
        NotEqualsExpression,
        LessThanExpression,
        GreaterThanExpression,
        LessThanOrEqualExpression,
        GreaterThanOrEqualExpression,
        InstanceOfExpression,
        InExpression,
        LeftShiftExpression,
        SignedRightShiftExpression,
        UnsignedRightShiftExpression,
        MultiplyExpression,
        DivideExpression,
        ModuloExpression,
        AddExpression,
        SubtractExpression,
        PostIncrementExpression,
        PostDecrementExpression,
        MemberAccessExpression,
        InvocationExpression,
        ArrayLiteralExpression,
        ObjectLiteralExpression,
        ObjectCreationExpression,
        ParenthesizedExpression,
        ParenthesizedArrowFunctionExpression,
        SimpleArrowFunctionExpression,
        CastExpression,
        ElementAccessExpression,
        FunctionExpression,
        OmittedExpression,
        VariableDeclaration,
        VariableDeclarator,
        ArgumentList,
        ParameterList,
        TypeArgumentList,
        TypeParameterList,
        HeritageClause,
        EqualsValueClause,
        CaseSwitchClause,
        DefaultSwitchClause,
        ElseClause,
        CatchClause,
        FinallyClause,
        TypeParameter,
        Constraint,
        SimplePropertyAssignment,
        GetAccessorPropertyAssignment,
        SetAccessorPropertyAssignment,
        FunctionPropertyAssignment,
        Parameter,
        EnumElement,
        TypeAnnotation,
        ExternalModuleReference,
        ModuleNameModuleReference,
        FirstStandardKeyword,
        LastStandardKeyword,
        FirstFutureReservedKeyword,
        LastFutureReservedKeyword,
        FirstFutureReservedStrictKeyword,
        LastFutureReservedStrictKeyword,
        FirstTypeScriptKeyword,
        LastTypeScriptKeyword,
        FirstKeyword,
        LastKeyword,
        FirstToken,
        LastToken,
        FirstPunctuation,
        LastPunctuation,
        FirstFixedWidth,
        LastFixedWidth,
    }
}
declare module TypeScript.SyntaxFacts {
    function getTokenKind(text: string): SyntaxKind;
    function getText(kind: SyntaxKind): string;
    function isTokenKind(kind: SyntaxKind): boolean;
    function isAnyKeyword(kind: SyntaxKind): boolean;
    function isStandardKeyword(kind: SyntaxKind): boolean;
    function isFutureReservedKeyword(kind: SyntaxKind): boolean;
    function isFutureReservedStrictKeyword(kind: SyntaxKind): boolean;
    function isAnyPunctuation(kind: SyntaxKind): boolean;
    function isPrefixUnaryExpressionOperatorToken(tokenKind: SyntaxKind): boolean;
    function isBinaryExpressionOperatorToken(tokenKind: SyntaxKind): boolean;
    function getPrefixUnaryExpressionFromOperatorToken(tokenKind: SyntaxKind): SyntaxKind;
    function getPostfixUnaryExpressionFromOperatorToken(tokenKind: SyntaxKind): SyntaxKind;
    function getBinaryExpressionFromOperatorToken(tokenKind: SyntaxKind): SyntaxKind;
    function isAnyDivideToken(kind: SyntaxKind): boolean;
    function isAnyDivideOrRegularExpressionToken(kind: SyntaxKind): boolean;
    function isParserGenerated(kind: SyntaxKind): boolean;
    function isAnyBinaryExpression(kind: SyntaxKind): boolean;
}
declare module TypeScript.SyntaxFacts {
    function isDirectivePrologueElement(node: ISyntaxNodeOrToken): boolean;
    function isUseStrictDirective(node: ISyntaxNodeOrToken): boolean;
    function isIdentifierNameOrAnyKeyword(token: ISyntaxToken): boolean;
}
declare module TypeScript {
    interface ISyntaxList extends ISyntaxElement {
        childAt(index: number): ISyntaxNodeOrToken;
        toArray(): ISyntaxNodeOrToken[];
        insertChildrenInto(array: ISyntaxElement[], index: number): void;
    }
}
declare module TypeScript.Syntax {
    class EmptySyntaxList implements ISyntaxList {
        public kind(): SyntaxKind;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public toJSON(key): any[];
        public childCount(): number;
        public childAt(index: number): ISyntaxNodeOrToken;
        public toArray(): ISyntaxNodeOrToken[];
        public collectTextElements(elements: string[]): void;
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public fullWidth(): number;
        public width(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public trailingTrivia(): ISyntaxTriviaList;
        public leadingTriviaWidth(): number;
        public trailingTriviaWidth(): number;
        public fullText(): string;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public findTokenInternal(parent: PositionedElement, position: number, fullStart: number): PositionedToken;
        public insertChildrenInto(array: ISyntaxElement[], index: number): void;
    }
    var emptyList: ISyntaxList;
    function list(nodes: ISyntaxNodeOrToken[]): ISyntaxList;
}
declare module TypeScript {
    class SyntaxNode implements ISyntaxNodeOrToken {
        private _data;
        constructor(parsedInStrictMode: boolean);
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public insertChildrenInto(array: ISyntaxElement[], index: number): void;
        public leadingTrivia(): ISyntaxTriviaList;
        public trailingTrivia(): ISyntaxTriviaList;
        public toJSON(key);
        public accept(visitor: ISyntaxVisitor): any;
        public fullText(): string;
        public collectTextElements(elements: string[]): void;
        public replaceToken(token1: ISyntaxToken, token2: ISyntaxToken): SyntaxNode;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SyntaxNode;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SyntaxNode;
        public hasLeadingTrivia(): boolean;
        public hasTrailingTrivia(): boolean;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public parsedInStrictMode(): boolean;
        public fullWidth(): number;
        private computeData();
        private data();
        public findToken(position: number, includeSkippedTokens?: boolean): PositionedToken;
        private tryGetEndOfFileAt(position);
        private findTokenInternal(parent, position, fullStart);
        public findTokenOnLeft(position: number): PositionedToken;
        public findCompleteTokenOnLeft(position: number, includeSkippedTokens?: boolean): PositionedToken;
        public isModuleElement(): boolean;
        public isClassElement(): boolean;
        public isTypeMember(): boolean;
        public isStatement(): boolean;
        public isSwitchClause(): boolean;
        public structuralEquals(node: SyntaxNode): boolean;
        public width(): number;
        public leadingTriviaWidth(): number;
        public trailingTriviaWidth(): number;
    }
}
declare module TypeScript {
    interface ISyntaxNodeOrToken extends TypeScript.ISyntaxElement {
        withLeadingTrivia(leadingTrivia: TypeScript.ISyntaxTriviaList): TypeScript.ISyntaxNodeOrToken;
        withTrailingTrivia(trailingTrivia: TypeScript.ISyntaxTriviaList): TypeScript.ISyntaxNodeOrToken;
        accept(visitor: TypeScript.ISyntaxVisitor): any;
    }
}
declare module TypeScript {
    class SourceUnitSyntax extends SyntaxNode {
        public moduleElements: ISyntaxList;
        public endOfFileToken: ISyntaxToken;
        constructor(moduleElements: ISyntaxList, endOfFileToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(moduleElements: ISyntaxList, endOfFileToken: ISyntaxToken): SourceUnitSyntax;
        static create(endOfFileToken: ISyntaxToken): SourceUnitSyntax;
        static create1(endOfFileToken: ISyntaxToken): SourceUnitSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SourceUnitSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SourceUnitSyntax;
        public withModuleElements(moduleElements: ISyntaxList): SourceUnitSyntax;
        public withModuleElement(moduleElement: IModuleElementSyntax): SourceUnitSyntax;
        public withEndOfFileToken(endOfFileToken: ISyntaxToken): SourceUnitSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ModuleReferenceSyntax extends SyntaxNode implements IModuleReferenceSyntax {
        constructor(parsedInStrictMode: boolean);
        public isModuleReference(): boolean;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ModuleReferenceSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ModuleReferenceSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ExternalModuleReferenceSyntax extends ModuleReferenceSyntax {
        public moduleKeyword: ISyntaxToken;
        public openParenToken: ISyntaxToken;
        public stringLiteral: ISyntaxToken;
        public closeParenToken: ISyntaxToken;
        constructor(moduleKeyword: ISyntaxToken, openParenToken: ISyntaxToken, stringLiteral: ISyntaxToken, closeParenToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(moduleKeyword: ISyntaxToken, openParenToken: ISyntaxToken, stringLiteral: ISyntaxToken, closeParenToken: ISyntaxToken): ExternalModuleReferenceSyntax;
        static create1(stringLiteral: ISyntaxToken): ExternalModuleReferenceSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ExternalModuleReferenceSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ExternalModuleReferenceSyntax;
        public withModuleKeyword(moduleKeyword: ISyntaxToken): ExternalModuleReferenceSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): ExternalModuleReferenceSyntax;
        public withStringLiteral(stringLiteral: ISyntaxToken): ExternalModuleReferenceSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): ExternalModuleReferenceSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ModuleNameModuleReferenceSyntax extends ModuleReferenceSyntax {
        public moduleName: INameSyntax;
        constructor(moduleName: INameSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(moduleName: INameSyntax): ModuleNameModuleReferenceSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ModuleNameModuleReferenceSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ModuleNameModuleReferenceSyntax;
        public withModuleName(moduleName: INameSyntax): ModuleNameModuleReferenceSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ImportDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public importKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public equalsToken: ISyntaxToken;
        public moduleReference: ModuleReferenceSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(importKeyword: ISyntaxToken, identifier: ISyntaxToken, equalsToken: ISyntaxToken, moduleReference: ModuleReferenceSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isModuleElement(): boolean;
        public update(importKeyword: ISyntaxToken, identifier: ISyntaxToken, equalsToken: ISyntaxToken, moduleReference: ModuleReferenceSyntax, semicolonToken: ISyntaxToken): ImportDeclarationSyntax;
        static create1(identifier: ISyntaxToken, moduleReference: ModuleReferenceSyntax): ImportDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ImportDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ImportDeclarationSyntax;
        public withImportKeyword(importKeyword: ISyntaxToken): ImportDeclarationSyntax;
        public withIdentifier(identifier: ISyntaxToken): ImportDeclarationSyntax;
        public withEqualsToken(equalsToken: ISyntaxToken): ImportDeclarationSyntax;
        public withModuleReference(moduleReference: ModuleReferenceSyntax): ImportDeclarationSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): ImportDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ExportAssignmentSyntax extends SyntaxNode implements IModuleElementSyntax {
        public exportKeyword: ISyntaxToken;
        public equalsToken: ISyntaxToken;
        public identifier: ISyntaxToken;
        public semicolonToken: ISyntaxToken;
        constructor(exportKeyword: ISyntaxToken, equalsToken: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isModuleElement(): boolean;
        public update(exportKeyword: ISyntaxToken, equalsToken: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ExportAssignmentSyntax;
        static create1(identifier: ISyntaxToken): ExportAssignmentSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ExportAssignmentSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ExportAssignmentSyntax;
        public withExportKeyword(exportKeyword: ISyntaxToken): ExportAssignmentSyntax;
        public withEqualsToken(equalsToken: ISyntaxToken): ExportAssignmentSyntax;
        public withIdentifier(identifier: ISyntaxToken): ExportAssignmentSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): ExportAssignmentSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ClassDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public modifiers: ISyntaxList;
        public classKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public typeParameterList: TypeParameterListSyntax;
        public heritageClauses: ISyntaxList;
        public openBraceToken: ISyntaxToken;
        public classElements: ISyntaxList;
        public closeBraceToken: ISyntaxToken;
        constructor(modifiers: ISyntaxList, classKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, openBraceToken: ISyntaxToken, classElements: ISyntaxList, closeBraceToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isModuleElement(): boolean;
        public update(modifiers: ISyntaxList, classKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, openBraceToken: ISyntaxToken, classElements: ISyntaxList, closeBraceToken: ISyntaxToken): ClassDeclarationSyntax;
        static create(classKeyword: ISyntaxToken, identifier: ISyntaxToken, openBraceToken: ISyntaxToken, closeBraceToken: ISyntaxToken): ClassDeclarationSyntax;
        static create1(identifier: ISyntaxToken): ClassDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ClassDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ClassDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): ClassDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): ClassDeclarationSyntax;
        public withClassKeyword(classKeyword: ISyntaxToken): ClassDeclarationSyntax;
        public withIdentifier(identifier: ISyntaxToken): ClassDeclarationSyntax;
        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): ClassDeclarationSyntax;
        public withHeritageClauses(heritageClauses: ISyntaxList): ClassDeclarationSyntax;
        public withHeritageClause(heritageClause: HeritageClauseSyntax): ClassDeclarationSyntax;
        public withOpenBraceToken(openBraceToken: ISyntaxToken): ClassDeclarationSyntax;
        public withClassElements(classElements: ISyntaxList): ClassDeclarationSyntax;
        public withClassElement(classElement: IClassElementSyntax): ClassDeclarationSyntax;
        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ClassDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class InterfaceDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public modifiers: ISyntaxList;
        public interfaceKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public typeParameterList: TypeParameterListSyntax;
        public heritageClauses: ISyntaxList;
        public body: ObjectTypeSyntax;
        constructor(modifiers: ISyntaxList, interfaceKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, body: ObjectTypeSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isModuleElement(): boolean;
        public update(modifiers: ISyntaxList, interfaceKeyword: ISyntaxToken, identifier: ISyntaxToken, typeParameterList: TypeParameterListSyntax, heritageClauses: ISyntaxList, body: ObjectTypeSyntax): InterfaceDeclarationSyntax;
        static create(interfaceKeyword: ISyntaxToken, identifier: ISyntaxToken, body: ObjectTypeSyntax): InterfaceDeclarationSyntax;
        static create1(identifier: ISyntaxToken): InterfaceDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): InterfaceDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): InterfaceDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): InterfaceDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): InterfaceDeclarationSyntax;
        public withInterfaceKeyword(interfaceKeyword: ISyntaxToken): InterfaceDeclarationSyntax;
        public withIdentifier(identifier: ISyntaxToken): InterfaceDeclarationSyntax;
        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): InterfaceDeclarationSyntax;
        public withHeritageClauses(heritageClauses: ISyntaxList): InterfaceDeclarationSyntax;
        public withHeritageClause(heritageClause: HeritageClauseSyntax): InterfaceDeclarationSyntax;
        public withBody(body: ObjectTypeSyntax): InterfaceDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class HeritageClauseSyntax extends SyntaxNode {
        public extendsOrImplementsKeyword: ISyntaxToken;
        public typeNames: ISeparatedSyntaxList;
        constructor(extendsOrImplementsKeyword: ISyntaxToken, typeNames: ISeparatedSyntaxList, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(extendsOrImplementsKeyword: ISyntaxToken, typeNames: ISeparatedSyntaxList): HeritageClauseSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): HeritageClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): HeritageClauseSyntax;
        public withExtendsOrImplementsKeyword(extendsOrImplementsKeyword: ISyntaxToken): HeritageClauseSyntax;
        public withTypeNames(typeNames: ISeparatedSyntaxList): HeritageClauseSyntax;
        public withTypeName(typeName: INameSyntax): HeritageClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ModuleDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public modifiers: ISyntaxList;
        public moduleKeyword: ISyntaxToken;
        public moduleName: INameSyntax;
        public stringLiteral: ISyntaxToken;
        public openBraceToken: ISyntaxToken;
        public moduleElements: ISyntaxList;
        public closeBraceToken: ISyntaxToken;
        constructor(modifiers: ISyntaxList, moduleKeyword: ISyntaxToken, moduleName: INameSyntax, stringLiteral: ISyntaxToken, openBraceToken: ISyntaxToken, moduleElements: ISyntaxList, closeBraceToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isModuleElement(): boolean;
        public update(modifiers: ISyntaxList, moduleKeyword: ISyntaxToken, moduleName: INameSyntax, stringLiteral: ISyntaxToken, openBraceToken: ISyntaxToken, moduleElements: ISyntaxList, closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax;
        static create(moduleKeyword: ISyntaxToken, openBraceToken: ISyntaxToken, closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax;
        static create1(): ModuleDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ModuleDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ModuleDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): ModuleDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): ModuleDeclarationSyntax;
        public withModuleKeyword(moduleKeyword: ISyntaxToken): ModuleDeclarationSyntax;
        public withModuleName(moduleName: INameSyntax): ModuleDeclarationSyntax;
        public withStringLiteral(stringLiteral: ISyntaxToken): ModuleDeclarationSyntax;
        public withOpenBraceToken(openBraceToken: ISyntaxToken): ModuleDeclarationSyntax;
        public withModuleElements(moduleElements: ISyntaxList): ModuleDeclarationSyntax;
        public withModuleElement(moduleElement: IModuleElementSyntax): ModuleDeclarationSyntax;
        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ModuleDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class FunctionDeclarationSyntax extends SyntaxNode implements IStatementSyntax {
        public modifiers: ISyntaxList;
        public functionKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public callSignature: CallSignatureSyntax;
        public block: BlockSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(modifiers: ISyntaxList, functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(modifiers: ISyntaxList, functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): FunctionDeclarationSyntax;
        static create(functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax): FunctionDeclarationSyntax;
        static create1(identifier: ISyntaxToken): FunctionDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): FunctionDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): FunctionDeclarationSyntax;
        public withFunctionKeyword(functionKeyword: ISyntaxToken): FunctionDeclarationSyntax;
        public withIdentifier(identifier: ISyntaxToken): FunctionDeclarationSyntax;
        public withCallSignature(callSignature: CallSignatureSyntax): FunctionDeclarationSyntax;
        public withBlock(block: BlockSyntax): FunctionDeclarationSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): FunctionDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class VariableStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public modifiers: ISyntaxList;
        public variableDeclaration: VariableDeclarationSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(modifiers: ISyntaxList, variableDeclaration: VariableDeclarationSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(modifiers: ISyntaxList, variableDeclaration: VariableDeclarationSyntax, semicolonToken: ISyntaxToken): VariableStatementSyntax;
        static create(variableDeclaration: VariableDeclarationSyntax, semicolonToken: ISyntaxToken): VariableStatementSyntax;
        static create1(variableDeclaration: VariableDeclarationSyntax): VariableStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): VariableStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): VariableStatementSyntax;
        public withModifiers(modifiers: ISyntaxList): VariableStatementSyntax;
        public withModifier(modifier: ISyntaxToken): VariableStatementSyntax;
        public withVariableDeclaration(variableDeclaration: VariableDeclarationSyntax): VariableStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): VariableStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class VariableDeclarationSyntax extends SyntaxNode {
        public varKeyword: ISyntaxToken;
        public variableDeclarators: ISeparatedSyntaxList;
        constructor(varKeyword: ISyntaxToken, variableDeclarators: ISeparatedSyntaxList, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(varKeyword: ISyntaxToken, variableDeclarators: ISeparatedSyntaxList): VariableDeclarationSyntax;
        static create1(variableDeclarators: ISeparatedSyntaxList): VariableDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): VariableDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): VariableDeclarationSyntax;
        public withVarKeyword(varKeyword: ISyntaxToken): VariableDeclarationSyntax;
        public withVariableDeclarators(variableDeclarators: ISeparatedSyntaxList): VariableDeclarationSyntax;
        public withVariableDeclarator(variableDeclarator: VariableDeclaratorSyntax): VariableDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class VariableDeclaratorSyntax extends SyntaxNode {
        public identifier: ISyntaxToken;
        public typeAnnotation: TypeAnnotationSyntax;
        public equalsValueClause: EqualsValueClauseSyntax;
        constructor(identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): VariableDeclaratorSyntax;
        static create(identifier: ISyntaxToken): VariableDeclaratorSyntax;
        static create1(identifier: ISyntaxToken): VariableDeclaratorSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): VariableDeclaratorSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): VariableDeclaratorSyntax;
        public withIdentifier(identifier: ISyntaxToken): VariableDeclaratorSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): VariableDeclaratorSyntax;
        public withEqualsValueClause(equalsValueClause: EqualsValueClauseSyntax): VariableDeclaratorSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class EqualsValueClauseSyntax extends SyntaxNode {
        public equalsToken: ISyntaxToken;
        public value: IExpressionSyntax;
        constructor(equalsToken: ISyntaxToken, value: IExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(equalsToken: ISyntaxToken, value: IExpressionSyntax): EqualsValueClauseSyntax;
        static create1(value: IExpressionSyntax): EqualsValueClauseSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): EqualsValueClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): EqualsValueClauseSyntax;
        public withEqualsToken(equalsToken: ISyntaxToken): EqualsValueClauseSyntax;
        public withValue(value: IExpressionSyntax): EqualsValueClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class PrefixUnaryExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public operatorToken: ISyntaxToken;
        public operand: IUnaryExpressionSyntax;
        private _kind;
        constructor(kind: SyntaxKind, operatorToken: ISyntaxToken, operand: IUnaryExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public kind(): SyntaxKind;
        public update(kind: SyntaxKind, operatorToken: ISyntaxToken, operand: IUnaryExpressionSyntax): PrefixUnaryExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): PrefixUnaryExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): PrefixUnaryExpressionSyntax;
        public withKind(kind: SyntaxKind): PrefixUnaryExpressionSyntax;
        public withOperatorToken(operatorToken: ISyntaxToken): PrefixUnaryExpressionSyntax;
        public withOperand(operand: IUnaryExpressionSyntax): PrefixUnaryExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ArrayLiteralExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public openBracketToken: ISyntaxToken;
        public expressions: ISeparatedSyntaxList;
        public closeBracketToken: ISyntaxToken;
        constructor(openBracketToken: ISyntaxToken, expressions: ISeparatedSyntaxList, closeBracketToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(openBracketToken: ISyntaxToken, expressions: ISeparatedSyntaxList, closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax;
        static create(openBracketToken: ISyntaxToken, closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax;
        static create1(): ArrayLiteralExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ArrayLiteralExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ArrayLiteralExpressionSyntax;
        public withOpenBracketToken(openBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax;
        public withExpressions(expressions: ISeparatedSyntaxList): ArrayLiteralExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): ArrayLiteralExpressionSyntax;
        public withCloseBracketToken(closeBracketToken: ISyntaxToken): ArrayLiteralExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class OmittedExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        constructor(parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isExpression(): boolean;
        public update(): OmittedExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): OmittedExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): OmittedExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ParenthesizedExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public openParenToken: ISyntaxToken;
        public expression: IExpressionSyntax;
        public closeParenToken: ISyntaxToken;
        constructor(openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken): ParenthesizedExpressionSyntax;
        static create1(expression: IExpressionSyntax): ParenthesizedExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParenthesizedExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParenthesizedExpressionSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): ParenthesizedExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): ParenthesizedExpressionSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): ParenthesizedExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ArrowFunctionExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public equalsGreaterThanToken: ISyntaxToken;
        public body: ISyntaxNodeOrToken;
        constructor(equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken, parsedInStrictMode: boolean);
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ArrowFunctionExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ArrowFunctionExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class SimpleArrowFunctionExpressionSyntax extends ArrowFunctionExpressionSyntax {
        public identifier: ISyntaxToken;
        constructor(identifier: ISyntaxToken, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(identifier: ISyntaxToken, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): SimpleArrowFunctionExpressionSyntax;
        static create1(identifier: ISyntaxToken, body: ISyntaxNodeOrToken): SimpleArrowFunctionExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SimpleArrowFunctionExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SimpleArrowFunctionExpressionSyntax;
        public withIdentifier(identifier: ISyntaxToken): SimpleArrowFunctionExpressionSyntax;
        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): SimpleArrowFunctionExpressionSyntax;
        public withBody(body: ISyntaxNodeOrToken): SimpleArrowFunctionExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ParenthesizedArrowFunctionExpressionSyntax extends ArrowFunctionExpressionSyntax {
        public callSignature: CallSignatureSyntax;
        constructor(callSignature: CallSignatureSyntax, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(callSignature: CallSignatureSyntax, equalsGreaterThanToken: ISyntaxToken, body: ISyntaxNodeOrToken): ParenthesizedArrowFunctionExpressionSyntax;
        static create1(body: ISyntaxNodeOrToken): ParenthesizedArrowFunctionExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParenthesizedArrowFunctionExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParenthesizedArrowFunctionExpressionSyntax;
        public withCallSignature(callSignature: CallSignatureSyntax): ParenthesizedArrowFunctionExpressionSyntax;
        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): ParenthesizedArrowFunctionExpressionSyntax;
        public withBody(body: ISyntaxNodeOrToken): ParenthesizedArrowFunctionExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class QualifiedNameSyntax extends SyntaxNode implements INameSyntax {
        public left: INameSyntax;
        public dotToken: ISyntaxToken;
        public right: ISyntaxToken;
        constructor(left: INameSyntax, dotToken: ISyntaxToken, right: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isName(): boolean;
        public isType(): boolean;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(left: INameSyntax, dotToken: ISyntaxToken, right: ISyntaxToken): QualifiedNameSyntax;
        static create1(left: INameSyntax, right: ISyntaxToken): QualifiedNameSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): QualifiedNameSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): QualifiedNameSyntax;
        public withLeft(left: INameSyntax): QualifiedNameSyntax;
        public withDotToken(dotToken: ISyntaxToken): QualifiedNameSyntax;
        public withRight(right: ISyntaxToken): QualifiedNameSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class TypeArgumentListSyntax extends SyntaxNode {
        public lessThanToken: ISyntaxToken;
        public typeArguments: ISeparatedSyntaxList;
        public greaterThanToken: ISyntaxToken;
        constructor(lessThanToken: ISyntaxToken, typeArguments: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(lessThanToken: ISyntaxToken, typeArguments: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeArgumentListSyntax;
        static create(lessThanToken: ISyntaxToken, greaterThanToken: ISyntaxToken): TypeArgumentListSyntax;
        static create1(): TypeArgumentListSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeArgumentListSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeArgumentListSyntax;
        public withLessThanToken(lessThanToken: ISyntaxToken): TypeArgumentListSyntax;
        public withTypeArguments(typeArguments: ISeparatedSyntaxList): TypeArgumentListSyntax;
        public withTypeArgument(typeArgument: ITypeSyntax): TypeArgumentListSyntax;
        public withGreaterThanToken(greaterThanToken: ISyntaxToken): TypeArgumentListSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ConstructorTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public newKeyword: ISyntaxToken;
        public typeParameterList: TypeParameterListSyntax;
        public parameterList: ParameterListSyntax;
        public equalsGreaterThanToken: ISyntaxToken;
        public type: ITypeSyntax;
        constructor(newKeyword: ISyntaxToken, typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isType(): boolean;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(newKeyword: ISyntaxToken, typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): ConstructorTypeSyntax;
        static create(newKeyword: ISyntaxToken, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): ConstructorTypeSyntax;
        static create1(type: ITypeSyntax): ConstructorTypeSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstructorTypeSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstructorTypeSyntax;
        public withNewKeyword(newKeyword: ISyntaxToken): ConstructorTypeSyntax;
        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): ConstructorTypeSyntax;
        public withParameterList(parameterList: ParameterListSyntax): ConstructorTypeSyntax;
        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): ConstructorTypeSyntax;
        public withType(type: ITypeSyntax): ConstructorTypeSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class FunctionTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public typeParameterList: TypeParameterListSyntax;
        public parameterList: ParameterListSyntax;
        public equalsGreaterThanToken: ISyntaxToken;
        public type: ITypeSyntax;
        constructor(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isType(): boolean;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): FunctionTypeSyntax;
        static create(parameterList: ParameterListSyntax, equalsGreaterThanToken: ISyntaxToken, type: ITypeSyntax): FunctionTypeSyntax;
        static create1(type: ITypeSyntax): FunctionTypeSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionTypeSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionTypeSyntax;
        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): FunctionTypeSyntax;
        public withParameterList(parameterList: ParameterListSyntax): FunctionTypeSyntax;
        public withEqualsGreaterThanToken(equalsGreaterThanToken: ISyntaxToken): FunctionTypeSyntax;
        public withType(type: ITypeSyntax): FunctionTypeSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ObjectTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public openBraceToken: ISyntaxToken;
        public typeMembers: ISeparatedSyntaxList;
        public closeBraceToken: ISyntaxToken;
        constructor(openBraceToken: ISyntaxToken, typeMembers: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isType(): boolean;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(openBraceToken: ISyntaxToken, typeMembers: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectTypeSyntax;
        static create(openBraceToken: ISyntaxToken, closeBraceToken: ISyntaxToken): ObjectTypeSyntax;
        static create1(): ObjectTypeSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ObjectTypeSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ObjectTypeSyntax;
        public withOpenBraceToken(openBraceToken: ISyntaxToken): ObjectTypeSyntax;
        public withTypeMembers(typeMembers: ISeparatedSyntaxList): ObjectTypeSyntax;
        public withTypeMember(typeMember: ITypeMemberSyntax): ObjectTypeSyntax;
        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ObjectTypeSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ArrayTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public type: ITypeSyntax;
        public openBracketToken: ISyntaxToken;
        public closeBracketToken: ISyntaxToken;
        constructor(type: ITypeSyntax, openBracketToken: ISyntaxToken, closeBracketToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isType(): boolean;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(type: ITypeSyntax, openBracketToken: ISyntaxToken, closeBracketToken: ISyntaxToken): ArrayTypeSyntax;
        static create1(type: ITypeSyntax): ArrayTypeSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ArrayTypeSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ArrayTypeSyntax;
        public withType(type: ITypeSyntax): ArrayTypeSyntax;
        public withOpenBracketToken(openBracketToken: ISyntaxToken): ArrayTypeSyntax;
        public withCloseBracketToken(closeBracketToken: ISyntaxToken): ArrayTypeSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class GenericTypeSyntax extends SyntaxNode implements ITypeSyntax {
        public name: INameSyntax;
        public typeArgumentList: TypeArgumentListSyntax;
        constructor(name: INameSyntax, typeArgumentList: TypeArgumentListSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isType(): boolean;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(name: INameSyntax, typeArgumentList: TypeArgumentListSyntax): GenericTypeSyntax;
        static create1(name: INameSyntax): GenericTypeSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): GenericTypeSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): GenericTypeSyntax;
        public withName(name: INameSyntax): GenericTypeSyntax;
        public withTypeArgumentList(typeArgumentList: TypeArgumentListSyntax): GenericTypeSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class TypeAnnotationSyntax extends SyntaxNode {
        public colonToken: ISyntaxToken;
        public type: ITypeSyntax;
        constructor(colonToken: ISyntaxToken, type: ITypeSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(colonToken: ISyntaxToken, type: ITypeSyntax): TypeAnnotationSyntax;
        static create1(type: ITypeSyntax): TypeAnnotationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeAnnotationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeAnnotationSyntax;
        public withColonToken(colonToken: ISyntaxToken): TypeAnnotationSyntax;
        public withType(type: ITypeSyntax): TypeAnnotationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class BlockSyntax extends SyntaxNode implements IStatementSyntax {
        public openBraceToken: ISyntaxToken;
        public statements: ISyntaxList;
        public closeBraceToken: ISyntaxToken;
        constructor(openBraceToken: ISyntaxToken, statements: ISyntaxList, closeBraceToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(openBraceToken: ISyntaxToken, statements: ISyntaxList, closeBraceToken: ISyntaxToken): BlockSyntax;
        static create(openBraceToken: ISyntaxToken, closeBraceToken: ISyntaxToken): BlockSyntax;
        static create1(): BlockSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): BlockSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): BlockSyntax;
        public withOpenBraceToken(openBraceToken: ISyntaxToken): BlockSyntax;
        public withStatements(statements: ISyntaxList): BlockSyntax;
        public withStatement(statement: IStatementSyntax): BlockSyntax;
        public withCloseBraceToken(closeBraceToken: ISyntaxToken): BlockSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ParameterSyntax extends SyntaxNode {
        public dotDotDotToken: ISyntaxToken;
        public publicOrPrivateKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public questionToken: ISyntaxToken;
        public typeAnnotation: TypeAnnotationSyntax;
        public equalsValueClause: EqualsValueClauseSyntax;
        constructor(dotDotDotToken: ISyntaxToken, publicOrPrivateKeyword: ISyntaxToken, identifier: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(dotDotDotToken: ISyntaxToken, publicOrPrivateKeyword: ISyntaxToken, identifier: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, equalsValueClause: EqualsValueClauseSyntax): ParameterSyntax;
        static create(identifier: ISyntaxToken): ParameterSyntax;
        static create1(identifier: ISyntaxToken): ParameterSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParameterSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParameterSyntax;
        public withDotDotDotToken(dotDotDotToken: ISyntaxToken): ParameterSyntax;
        public withPublicOrPrivateKeyword(publicOrPrivateKeyword: ISyntaxToken): ParameterSyntax;
        public withIdentifier(identifier: ISyntaxToken): ParameterSyntax;
        public withQuestionToken(questionToken: ISyntaxToken): ParameterSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): ParameterSyntax;
        public withEqualsValueClause(equalsValueClause: EqualsValueClauseSyntax): ParameterSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class MemberAccessExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public expression: IExpressionSyntax;
        public dotToken: ISyntaxToken;
        public name: ISyntaxToken;
        constructor(expression: IExpressionSyntax, dotToken: ISyntaxToken, name: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(expression: IExpressionSyntax, dotToken: ISyntaxToken, name: ISyntaxToken): MemberAccessExpressionSyntax;
        static create1(expression: IExpressionSyntax, name: ISyntaxToken): MemberAccessExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): MemberAccessExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): MemberAccessExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): MemberAccessExpressionSyntax;
        public withDotToken(dotToken: ISyntaxToken): MemberAccessExpressionSyntax;
        public withName(name: ISyntaxToken): MemberAccessExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class PostfixUnaryExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public operand: IExpressionSyntax;
        public operatorToken: ISyntaxToken;
        private _kind;
        constructor(kind: SyntaxKind, operand: IExpressionSyntax, operatorToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public kind(): SyntaxKind;
        public update(kind: SyntaxKind, operand: IExpressionSyntax, operatorToken: ISyntaxToken): PostfixUnaryExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): PostfixUnaryExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): PostfixUnaryExpressionSyntax;
        public withKind(kind: SyntaxKind): PostfixUnaryExpressionSyntax;
        public withOperand(operand: IExpressionSyntax): PostfixUnaryExpressionSyntax;
        public withOperatorToken(operatorToken: ISyntaxToken): PostfixUnaryExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ElementAccessExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public expression: IExpressionSyntax;
        public openBracketToken: ISyntaxToken;
        public argumentExpression: IExpressionSyntax;
        public closeBracketToken: ISyntaxToken;
        constructor(expression: IExpressionSyntax, openBracketToken: ISyntaxToken, argumentExpression: IExpressionSyntax, closeBracketToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(expression: IExpressionSyntax, openBracketToken: ISyntaxToken, argumentExpression: IExpressionSyntax, closeBracketToken: ISyntaxToken): ElementAccessExpressionSyntax;
        static create1(expression: IExpressionSyntax, argumentExpression: IExpressionSyntax): ElementAccessExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ElementAccessExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ElementAccessExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): ElementAccessExpressionSyntax;
        public withOpenBracketToken(openBracketToken: ISyntaxToken): ElementAccessExpressionSyntax;
        public withArgumentExpression(argumentExpression: IExpressionSyntax): ElementAccessExpressionSyntax;
        public withCloseBracketToken(closeBracketToken: ISyntaxToken): ElementAccessExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class InvocationExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public expression: IExpressionSyntax;
        public argumentList: ArgumentListSyntax;
        constructor(expression: IExpressionSyntax, argumentList: ArgumentListSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(expression: IExpressionSyntax, argumentList: ArgumentListSyntax): InvocationExpressionSyntax;
        static create1(expression: IExpressionSyntax): InvocationExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): InvocationExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): InvocationExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): InvocationExpressionSyntax;
        public withArgumentList(argumentList: ArgumentListSyntax): InvocationExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ArgumentListSyntax extends SyntaxNode {
        public typeArgumentList: TypeArgumentListSyntax;
        public openParenToken: ISyntaxToken;
        public arguments: ISeparatedSyntaxList;
        public closeParenToken: ISyntaxToken;
        constructor(typeArgumentList: TypeArgumentListSyntax, openParenToken: ISyntaxToken, arguments: ISeparatedSyntaxList, closeParenToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(typeArgumentList: TypeArgumentListSyntax, openParenToken: ISyntaxToken, _arguments: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ArgumentListSyntax;
        static create(openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken): ArgumentListSyntax;
        static create1(): ArgumentListSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ArgumentListSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ArgumentListSyntax;
        public withTypeArgumentList(typeArgumentList: TypeArgumentListSyntax): ArgumentListSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): ArgumentListSyntax;
        public withArguments(_arguments: ISeparatedSyntaxList): ArgumentListSyntax;
        public withArgument(_argument: IExpressionSyntax): ArgumentListSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): ArgumentListSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class BinaryExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        public left: IExpressionSyntax;
        public operatorToken: ISyntaxToken;
        public right: IExpressionSyntax;
        private _kind;
        constructor(kind: SyntaxKind, left: IExpressionSyntax, operatorToken: ISyntaxToken, right: IExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isExpression(): boolean;
        public kind(): SyntaxKind;
        public update(kind: SyntaxKind, left: IExpressionSyntax, operatorToken: ISyntaxToken, right: IExpressionSyntax): BinaryExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): BinaryExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): BinaryExpressionSyntax;
        public withKind(kind: SyntaxKind): BinaryExpressionSyntax;
        public withLeft(left: IExpressionSyntax): BinaryExpressionSyntax;
        public withOperatorToken(operatorToken: ISyntaxToken): BinaryExpressionSyntax;
        public withRight(right: IExpressionSyntax): BinaryExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ConditionalExpressionSyntax extends SyntaxNode implements IExpressionSyntax {
        public condition: IExpressionSyntax;
        public questionToken: ISyntaxToken;
        public whenTrue: IExpressionSyntax;
        public colonToken: ISyntaxToken;
        public whenFalse: IExpressionSyntax;
        constructor(condition: IExpressionSyntax, questionToken: ISyntaxToken, whenTrue: IExpressionSyntax, colonToken: ISyntaxToken, whenFalse: IExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isExpression(): boolean;
        public update(condition: IExpressionSyntax, questionToken: ISyntaxToken, whenTrue: IExpressionSyntax, colonToken: ISyntaxToken, whenFalse: IExpressionSyntax): ConditionalExpressionSyntax;
        static create1(condition: IExpressionSyntax, whenTrue: IExpressionSyntax, whenFalse: IExpressionSyntax): ConditionalExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConditionalExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConditionalExpressionSyntax;
        public withCondition(condition: IExpressionSyntax): ConditionalExpressionSyntax;
        public withQuestionToken(questionToken: ISyntaxToken): ConditionalExpressionSyntax;
        public withWhenTrue(whenTrue: IExpressionSyntax): ConditionalExpressionSyntax;
        public withColonToken(colonToken: ISyntaxToken): ConditionalExpressionSyntax;
        public withWhenFalse(whenFalse: IExpressionSyntax): ConditionalExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ConstructSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public newKeyword: ISyntaxToken;
        public callSignature: CallSignatureSyntax;
        constructor(newKeyword: ISyntaxToken, callSignature: CallSignatureSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isTypeMember(): boolean;
        public update(newKeyword: ISyntaxToken, callSignature: CallSignatureSyntax): ConstructSignatureSyntax;
        static create1(): ConstructSignatureSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstructSignatureSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstructSignatureSyntax;
        public withNewKeyword(newKeyword: ISyntaxToken): ConstructSignatureSyntax;
        public withCallSignature(callSignature: CallSignatureSyntax): ConstructSignatureSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class MethodSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public propertyName: ISyntaxToken;
        public questionToken: ISyntaxToken;
        public callSignature: CallSignatureSyntax;
        constructor(propertyName: ISyntaxToken, questionToken: ISyntaxToken, callSignature: CallSignatureSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isTypeMember(): boolean;
        public update(propertyName: ISyntaxToken, questionToken: ISyntaxToken, callSignature: CallSignatureSyntax): MethodSignatureSyntax;
        static create(propertyName: ISyntaxToken, callSignature: CallSignatureSyntax): MethodSignatureSyntax;
        static create1(propertyName: ISyntaxToken): MethodSignatureSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): MethodSignatureSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): MethodSignatureSyntax;
        public withPropertyName(propertyName: ISyntaxToken): MethodSignatureSyntax;
        public withQuestionToken(questionToken: ISyntaxToken): MethodSignatureSyntax;
        public withCallSignature(callSignature: CallSignatureSyntax): MethodSignatureSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class IndexSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax, IClassElementSyntax {
        public openBracketToken: ISyntaxToken;
        public parameter: ParameterSyntax;
        public closeBracketToken: ISyntaxToken;
        public typeAnnotation: TypeAnnotationSyntax;
        constructor(openBracketToken: ISyntaxToken, parameter: ParameterSyntax, closeBracketToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isTypeMember(): boolean;
        public isClassElement(): boolean;
        public update(openBracketToken: ISyntaxToken, parameter: ParameterSyntax, closeBracketToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): IndexSignatureSyntax;
        static create(openBracketToken: ISyntaxToken, parameter: ParameterSyntax, closeBracketToken: ISyntaxToken): IndexSignatureSyntax;
        static create1(parameter: ParameterSyntax): IndexSignatureSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): IndexSignatureSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): IndexSignatureSyntax;
        public withOpenBracketToken(openBracketToken: ISyntaxToken): IndexSignatureSyntax;
        public withParameter(parameter: ParameterSyntax): IndexSignatureSyntax;
        public withCloseBracketToken(closeBracketToken: ISyntaxToken): IndexSignatureSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): IndexSignatureSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class PropertySignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public propertyName: ISyntaxToken;
        public questionToken: ISyntaxToken;
        public typeAnnotation: TypeAnnotationSyntax;
        constructor(propertyName: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isTypeMember(): boolean;
        public update(propertyName: ISyntaxToken, questionToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax): PropertySignatureSyntax;
        static create(propertyName: ISyntaxToken): PropertySignatureSyntax;
        static create1(propertyName: ISyntaxToken): PropertySignatureSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): PropertySignatureSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): PropertySignatureSyntax;
        public withPropertyName(propertyName: ISyntaxToken): PropertySignatureSyntax;
        public withQuestionToken(questionToken: ISyntaxToken): PropertySignatureSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): PropertySignatureSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class CallSignatureSyntax extends SyntaxNode implements ITypeMemberSyntax {
        public typeParameterList: TypeParameterListSyntax;
        public parameterList: ParameterListSyntax;
        public typeAnnotation: TypeAnnotationSyntax;
        constructor(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isTypeMember(): boolean;
        public update(typeParameterList: TypeParameterListSyntax, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax): CallSignatureSyntax;
        static create(parameterList: ParameterListSyntax): CallSignatureSyntax;
        static create1(): CallSignatureSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): CallSignatureSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): CallSignatureSyntax;
        public withTypeParameterList(typeParameterList: TypeParameterListSyntax): CallSignatureSyntax;
        public withParameterList(parameterList: ParameterListSyntax): CallSignatureSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): CallSignatureSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ParameterListSyntax extends SyntaxNode {
        public openParenToken: ISyntaxToken;
        public parameters: ISeparatedSyntaxList;
        public closeParenToken: ISyntaxToken;
        constructor(openParenToken: ISyntaxToken, parameters: ISeparatedSyntaxList, closeParenToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(openParenToken: ISyntaxToken, parameters: ISeparatedSyntaxList, closeParenToken: ISyntaxToken): ParameterListSyntax;
        static create(openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken): ParameterListSyntax;
        static create1(): ParameterListSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ParameterListSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ParameterListSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): ParameterListSyntax;
        public withParameters(parameters: ISeparatedSyntaxList): ParameterListSyntax;
        public withParameter(parameter: ParameterSyntax): ParameterListSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): ParameterListSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class TypeParameterListSyntax extends SyntaxNode {
        public lessThanToken: ISyntaxToken;
        public typeParameters: ISeparatedSyntaxList;
        public greaterThanToken: ISyntaxToken;
        constructor(lessThanToken: ISyntaxToken, typeParameters: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(lessThanToken: ISyntaxToken, typeParameters: ISeparatedSyntaxList, greaterThanToken: ISyntaxToken): TypeParameterListSyntax;
        static create(lessThanToken: ISyntaxToken, greaterThanToken: ISyntaxToken): TypeParameterListSyntax;
        static create1(): TypeParameterListSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeParameterListSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeParameterListSyntax;
        public withLessThanToken(lessThanToken: ISyntaxToken): TypeParameterListSyntax;
        public withTypeParameters(typeParameters: ISeparatedSyntaxList): TypeParameterListSyntax;
        public withTypeParameter(typeParameter: TypeParameterSyntax): TypeParameterListSyntax;
        public withGreaterThanToken(greaterThanToken: ISyntaxToken): TypeParameterListSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class TypeParameterSyntax extends SyntaxNode {
        public identifier: ISyntaxToken;
        public constraint: ConstraintSyntax;
        constructor(identifier: ISyntaxToken, constraint: ConstraintSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(identifier: ISyntaxToken, constraint: ConstraintSyntax): TypeParameterSyntax;
        static create(identifier: ISyntaxToken): TypeParameterSyntax;
        static create1(identifier: ISyntaxToken): TypeParameterSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeParameterSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeParameterSyntax;
        public withIdentifier(identifier: ISyntaxToken): TypeParameterSyntax;
        public withConstraint(constraint: ConstraintSyntax): TypeParameterSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ConstraintSyntax extends SyntaxNode {
        public extendsKeyword: ISyntaxToken;
        public type: ITypeSyntax;
        constructor(extendsKeyword: ISyntaxToken, type: ITypeSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(extendsKeyword: ISyntaxToken, type: ITypeSyntax): ConstraintSyntax;
        static create1(type: ITypeSyntax): ConstraintSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstraintSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstraintSyntax;
        public withExtendsKeyword(extendsKeyword: ISyntaxToken): ConstraintSyntax;
        public withType(type: ITypeSyntax): ConstraintSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ElseClauseSyntax extends SyntaxNode {
        public elseKeyword: ISyntaxToken;
        public statement: IStatementSyntax;
        constructor(elseKeyword: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(elseKeyword: ISyntaxToken, statement: IStatementSyntax): ElseClauseSyntax;
        static create1(statement: IStatementSyntax): ElseClauseSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ElseClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ElseClauseSyntax;
        public withElseKeyword(elseKeyword: ISyntaxToken): ElseClauseSyntax;
        public withStatement(statement: IStatementSyntax): ElseClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class IfStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public ifKeyword: ISyntaxToken;
        public openParenToken: ISyntaxToken;
        public condition: IExpressionSyntax;
        public closeParenToken: ISyntaxToken;
        public statement: IStatementSyntax;
        public elseClause: ElseClauseSyntax;
        constructor(ifKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, elseClause: ElseClauseSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(ifKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, elseClause: ElseClauseSyntax): IfStatementSyntax;
        static create(ifKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): IfStatementSyntax;
        static create1(condition: IExpressionSyntax, statement: IStatementSyntax): IfStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): IfStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): IfStatementSyntax;
        public withIfKeyword(ifKeyword: ISyntaxToken): IfStatementSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): IfStatementSyntax;
        public withCondition(condition: IExpressionSyntax): IfStatementSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): IfStatementSyntax;
        public withStatement(statement: IStatementSyntax): IfStatementSyntax;
        public withElseClause(elseClause: ElseClauseSyntax): IfStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ExpressionStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public expression: IExpressionSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(expression: IExpressionSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ExpressionStatementSyntax;
        static create1(expression: IExpressionSyntax): ExpressionStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ExpressionStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ExpressionStatementSyntax;
        public withExpression(expression: IExpressionSyntax): ExpressionStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): ExpressionStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ConstructorDeclarationSyntax extends SyntaxNode implements IClassElementSyntax {
        public constructorKeyword: ISyntaxToken;
        public parameterList: ParameterListSyntax;
        public block: BlockSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(constructorKeyword: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isClassElement(): boolean;
        public update(constructorKeyword: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): ConstructorDeclarationSyntax;
        static create(constructorKeyword: ISyntaxToken, parameterList: ParameterListSyntax): ConstructorDeclarationSyntax;
        static create1(): ConstructorDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ConstructorDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ConstructorDeclarationSyntax;
        public withConstructorKeyword(constructorKeyword: ISyntaxToken): ConstructorDeclarationSyntax;
        public withParameterList(parameterList: ParameterListSyntax): ConstructorDeclarationSyntax;
        public withBlock(block: BlockSyntax): ConstructorDeclarationSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): ConstructorDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class MemberFunctionDeclarationSyntax extends SyntaxNode implements IMemberDeclarationSyntax {
        public modifiers: ISyntaxList;
        public propertyName: ISyntaxToken;
        public callSignature: CallSignatureSyntax;
        public block: BlockSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(modifiers: ISyntaxList, propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isMemberDeclaration(): boolean;
        public isClassElement(): boolean;
        public update(modifiers: ISyntaxList, propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, semicolonToken: ISyntaxToken): MemberFunctionDeclarationSyntax;
        static create(propertyName: ISyntaxToken, callSignature: CallSignatureSyntax): MemberFunctionDeclarationSyntax;
        static create1(propertyName: ISyntaxToken): MemberFunctionDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): MemberFunctionDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): MemberFunctionDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): MemberFunctionDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): MemberFunctionDeclarationSyntax;
        public withPropertyName(propertyName: ISyntaxToken): MemberFunctionDeclarationSyntax;
        public withCallSignature(callSignature: CallSignatureSyntax): MemberFunctionDeclarationSyntax;
        public withBlock(block: BlockSyntax): MemberFunctionDeclarationSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): MemberFunctionDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class MemberAccessorDeclarationSyntax extends SyntaxNode implements IMemberDeclarationSyntax {
        public modifiers: ISyntaxList;
        public propertyName: ISyntaxToken;
        public parameterList: ParameterListSyntax;
        public block: BlockSyntax;
        constructor(modifiers: ISyntaxList, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax, parsedInStrictMode: boolean);
        public isMemberDeclaration(): boolean;
        public isClassElement(): boolean;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): MemberAccessorDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): MemberAccessorDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class GetMemberAccessorDeclarationSyntax extends MemberAccessorDeclarationSyntax {
        public getKeyword: ISyntaxToken;
        public typeAnnotation: TypeAnnotationSyntax;
        constructor(modifiers: ISyntaxList, getKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(modifiers: ISyntaxList, getKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetMemberAccessorDeclarationSyntax;
        static create(getKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax): GetMemberAccessorDeclarationSyntax;
        static create1(propertyName: ISyntaxToken): GetMemberAccessorDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): GetMemberAccessorDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): GetMemberAccessorDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): GetMemberAccessorDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): GetMemberAccessorDeclarationSyntax;
        public withGetKeyword(getKeyword: ISyntaxToken): GetMemberAccessorDeclarationSyntax;
        public withPropertyName(propertyName: ISyntaxToken): GetMemberAccessorDeclarationSyntax;
        public withParameterList(parameterList: ParameterListSyntax): GetMemberAccessorDeclarationSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): GetMemberAccessorDeclarationSyntax;
        public withBlock(block: BlockSyntax): GetMemberAccessorDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class SetMemberAccessorDeclarationSyntax extends MemberAccessorDeclarationSyntax {
        public setKeyword: ISyntaxToken;
        constructor(modifiers: ISyntaxList, setKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(modifiers: ISyntaxList, setKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax): SetMemberAccessorDeclarationSyntax;
        static create(setKeyword: ISyntaxToken, propertyName: ISyntaxToken, parameterList: ParameterListSyntax, block: BlockSyntax): SetMemberAccessorDeclarationSyntax;
        static create1(propertyName: ISyntaxToken): SetMemberAccessorDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SetMemberAccessorDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SetMemberAccessorDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): SetMemberAccessorDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): SetMemberAccessorDeclarationSyntax;
        public withSetKeyword(setKeyword: ISyntaxToken): SetMemberAccessorDeclarationSyntax;
        public withPropertyName(propertyName: ISyntaxToken): SetMemberAccessorDeclarationSyntax;
        public withParameterList(parameterList: ParameterListSyntax): SetMemberAccessorDeclarationSyntax;
        public withBlock(block: BlockSyntax): SetMemberAccessorDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class MemberVariableDeclarationSyntax extends SyntaxNode implements IMemberDeclarationSyntax {
        public modifiers: ISyntaxList;
        public variableDeclarator: VariableDeclaratorSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(modifiers: ISyntaxList, variableDeclarator: VariableDeclaratorSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isMemberDeclaration(): boolean;
        public isClassElement(): boolean;
        public update(modifiers: ISyntaxList, variableDeclarator: VariableDeclaratorSyntax, semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax;
        static create(variableDeclarator: VariableDeclaratorSyntax, semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax;
        static create1(variableDeclarator: VariableDeclaratorSyntax): MemberVariableDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): MemberVariableDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): MemberVariableDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): MemberVariableDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): MemberVariableDeclarationSyntax;
        public withVariableDeclarator(variableDeclarator: VariableDeclaratorSyntax): MemberVariableDeclarationSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): MemberVariableDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ThrowStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public throwKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(throwKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(throwKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ThrowStatementSyntax;
        static create1(expression: IExpressionSyntax): ThrowStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ThrowStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ThrowStatementSyntax;
        public withThrowKeyword(throwKeyword: ISyntaxToken): ThrowStatementSyntax;
        public withExpression(expression: IExpressionSyntax): ThrowStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): ThrowStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ReturnStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public returnKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(returnKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(returnKeyword: ISyntaxToken, expression: IExpressionSyntax, semicolonToken: ISyntaxToken): ReturnStatementSyntax;
        static create(returnKeyword: ISyntaxToken, semicolonToken: ISyntaxToken): ReturnStatementSyntax;
        static create1(): ReturnStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ReturnStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ReturnStatementSyntax;
        public withReturnKeyword(returnKeyword: ISyntaxToken): ReturnStatementSyntax;
        public withExpression(expression: IExpressionSyntax): ReturnStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): ReturnStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ObjectCreationExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public newKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        public argumentList: ArgumentListSyntax;
        constructor(newKeyword: ISyntaxToken, expression: IExpressionSyntax, argumentList: ArgumentListSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(newKeyword: ISyntaxToken, expression: IExpressionSyntax, argumentList: ArgumentListSyntax): ObjectCreationExpressionSyntax;
        static create(newKeyword: ISyntaxToken, expression: IExpressionSyntax): ObjectCreationExpressionSyntax;
        static create1(expression: IExpressionSyntax): ObjectCreationExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ObjectCreationExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ObjectCreationExpressionSyntax;
        public withNewKeyword(newKeyword: ISyntaxToken): ObjectCreationExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): ObjectCreationExpressionSyntax;
        public withArgumentList(argumentList: ArgumentListSyntax): ObjectCreationExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class SwitchStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public switchKeyword: ISyntaxToken;
        public openParenToken: ISyntaxToken;
        public expression: IExpressionSyntax;
        public closeParenToken: ISyntaxToken;
        public openBraceToken: ISyntaxToken;
        public switchClauses: ISyntaxList;
        public closeBraceToken: ISyntaxToken;
        constructor(switchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, openBraceToken: ISyntaxToken, switchClauses: ISyntaxList, closeBraceToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(switchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, openBraceToken: ISyntaxToken, switchClauses: ISyntaxList, closeBraceToken: ISyntaxToken): SwitchStatementSyntax;
        static create(switchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, openBraceToken: ISyntaxToken, closeBraceToken: ISyntaxToken): SwitchStatementSyntax;
        static create1(expression: IExpressionSyntax): SwitchStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SwitchStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SwitchStatementSyntax;
        public withSwitchKeyword(switchKeyword: ISyntaxToken): SwitchStatementSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): SwitchStatementSyntax;
        public withExpression(expression: IExpressionSyntax): SwitchStatementSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): SwitchStatementSyntax;
        public withOpenBraceToken(openBraceToken: ISyntaxToken): SwitchStatementSyntax;
        public withSwitchClauses(switchClauses: ISyntaxList): SwitchStatementSyntax;
        public withSwitchClause(switchClause: SwitchClauseSyntax): SwitchStatementSyntax;
        public withCloseBraceToken(closeBraceToken: ISyntaxToken): SwitchStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class SwitchClauseSyntax extends SyntaxNode implements ISwitchClauseSyntax {
        public colonToken: ISyntaxToken;
        public statements: ISyntaxList;
        constructor(colonToken: ISyntaxToken, statements: ISyntaxList, parsedInStrictMode: boolean);
        public isSwitchClause(): boolean;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SwitchClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SwitchClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class CaseSwitchClauseSyntax extends SwitchClauseSyntax {
        public caseKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        constructor(caseKeyword: ISyntaxToken, expression: IExpressionSyntax, colonToken: ISyntaxToken, statements: ISyntaxList, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(caseKeyword: ISyntaxToken, expression: IExpressionSyntax, colonToken: ISyntaxToken, statements: ISyntaxList): CaseSwitchClauseSyntax;
        static create(caseKeyword: ISyntaxToken, expression: IExpressionSyntax, colonToken: ISyntaxToken): CaseSwitchClauseSyntax;
        static create1(expression: IExpressionSyntax): CaseSwitchClauseSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): CaseSwitchClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): CaseSwitchClauseSyntax;
        public withCaseKeyword(caseKeyword: ISyntaxToken): CaseSwitchClauseSyntax;
        public withExpression(expression: IExpressionSyntax): CaseSwitchClauseSyntax;
        public withColonToken(colonToken: ISyntaxToken): CaseSwitchClauseSyntax;
        public withStatements(statements: ISyntaxList): CaseSwitchClauseSyntax;
        public withStatement(statement: IStatementSyntax): CaseSwitchClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class DefaultSwitchClauseSyntax extends SwitchClauseSyntax {
        public defaultKeyword: ISyntaxToken;
        constructor(defaultKeyword: ISyntaxToken, colonToken: ISyntaxToken, statements: ISyntaxList, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(defaultKeyword: ISyntaxToken, colonToken: ISyntaxToken, statements: ISyntaxList): DefaultSwitchClauseSyntax;
        static create(defaultKeyword: ISyntaxToken, colonToken: ISyntaxToken): DefaultSwitchClauseSyntax;
        static create1(): DefaultSwitchClauseSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): DefaultSwitchClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): DefaultSwitchClauseSyntax;
        public withDefaultKeyword(defaultKeyword: ISyntaxToken): DefaultSwitchClauseSyntax;
        public withColonToken(colonToken: ISyntaxToken): DefaultSwitchClauseSyntax;
        public withStatements(statements: ISyntaxList): DefaultSwitchClauseSyntax;
        public withStatement(statement: IStatementSyntax): DefaultSwitchClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class BreakStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public breakKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public semicolonToken: ISyntaxToken;
        constructor(breakKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(breakKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): BreakStatementSyntax;
        static create(breakKeyword: ISyntaxToken, semicolonToken: ISyntaxToken): BreakStatementSyntax;
        static create1(): BreakStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): BreakStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): BreakStatementSyntax;
        public withBreakKeyword(breakKeyword: ISyntaxToken): BreakStatementSyntax;
        public withIdentifier(identifier: ISyntaxToken): BreakStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): BreakStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ContinueStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public continueKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public semicolonToken: ISyntaxToken;
        constructor(continueKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(continueKeyword: ISyntaxToken, identifier: ISyntaxToken, semicolonToken: ISyntaxToken): ContinueStatementSyntax;
        static create(continueKeyword: ISyntaxToken, semicolonToken: ISyntaxToken): ContinueStatementSyntax;
        static create1(): ContinueStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ContinueStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ContinueStatementSyntax;
        public withContinueKeyword(continueKeyword: ISyntaxToken): ContinueStatementSyntax;
        public withIdentifier(identifier: ISyntaxToken): ContinueStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): ContinueStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class IterationStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public openParenToken: ISyntaxToken;
        public closeParenToken: ISyntaxToken;
        public statement: IStatementSyntax;
        constructor(openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): IterationStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): IterationStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class BaseForStatementSyntax extends IterationStatementSyntax {
        public forKeyword: ISyntaxToken;
        public variableDeclaration: VariableDeclarationSyntax;
        constructor(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public withLeadingTrivia(trivia: ISyntaxTriviaList): BaseForStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): BaseForStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ForStatementSyntax extends BaseForStatementSyntax {
        public initializer: IExpressionSyntax;
        public firstSemicolonToken: ISyntaxToken;
        public condition: IExpressionSyntax;
        public secondSemicolonToken: ISyntaxToken;
        public incrementor: IExpressionSyntax;
        constructor(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, initializer: IExpressionSyntax, firstSemicolonToken: ISyntaxToken, condition: IExpressionSyntax, secondSemicolonToken: ISyntaxToken, incrementor: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, initializer: IExpressionSyntax, firstSemicolonToken: ISyntaxToken, condition: IExpressionSyntax, secondSemicolonToken: ISyntaxToken, incrementor: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForStatementSyntax;
        static create(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, firstSemicolonToken: ISyntaxToken, secondSemicolonToken: ISyntaxToken, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForStatementSyntax;
        static create1(statement: IStatementSyntax): ForStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ForStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ForStatementSyntax;
        public withForKeyword(forKeyword: ISyntaxToken): ForStatementSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): ForStatementSyntax;
        public withVariableDeclaration(variableDeclaration: VariableDeclarationSyntax): ForStatementSyntax;
        public withInitializer(initializer: IExpressionSyntax): ForStatementSyntax;
        public withFirstSemicolonToken(firstSemicolonToken: ISyntaxToken): ForStatementSyntax;
        public withCondition(condition: IExpressionSyntax): ForStatementSyntax;
        public withSecondSemicolonToken(secondSemicolonToken: ISyntaxToken): ForStatementSyntax;
        public withIncrementor(incrementor: IExpressionSyntax): ForStatementSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): ForStatementSyntax;
        public withStatement(statement: IStatementSyntax): ForStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ForInStatementSyntax extends BaseForStatementSyntax {
        public left: IExpressionSyntax;
        public inKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        constructor(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, left: IExpressionSyntax, inKeyword: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, variableDeclaration: VariableDeclarationSyntax, left: IExpressionSyntax, inKeyword: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForInStatementSyntax;
        static create(forKeyword: ISyntaxToken, openParenToken: ISyntaxToken, inKeyword: ISyntaxToken, expression: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): ForInStatementSyntax;
        static create1(expression: IExpressionSyntax, statement: IStatementSyntax): ForInStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ForInStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ForInStatementSyntax;
        public withForKeyword(forKeyword: ISyntaxToken): ForInStatementSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): ForInStatementSyntax;
        public withVariableDeclaration(variableDeclaration: VariableDeclarationSyntax): ForInStatementSyntax;
        public withLeft(left: IExpressionSyntax): ForInStatementSyntax;
        public withInKeyword(inKeyword: ISyntaxToken): ForInStatementSyntax;
        public withExpression(expression: IExpressionSyntax): ForInStatementSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): ForInStatementSyntax;
        public withStatement(statement: IStatementSyntax): ForInStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class WhileStatementSyntax extends IterationStatementSyntax {
        public whileKeyword: ISyntaxToken;
        public condition: IExpressionSyntax;
        constructor(whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WhileStatementSyntax;
        static create1(condition: IExpressionSyntax, statement: IStatementSyntax): WhileStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): WhileStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): WhileStatementSyntax;
        public withWhileKeyword(whileKeyword: ISyntaxToken): WhileStatementSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): WhileStatementSyntax;
        public withCondition(condition: IExpressionSyntax): WhileStatementSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): WhileStatementSyntax;
        public withStatement(statement: IStatementSyntax): WhileStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class WithStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public withKeyword: ISyntaxToken;
        public openParenToken: ISyntaxToken;
        public condition: IExpressionSyntax;
        public closeParenToken: ISyntaxToken;
        public statement: IStatementSyntax;
        constructor(withKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(withKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, statement: IStatementSyntax): WithStatementSyntax;
        static create1(condition: IExpressionSyntax, statement: IStatementSyntax): WithStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): WithStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): WithStatementSyntax;
        public withWithKeyword(withKeyword: ISyntaxToken): WithStatementSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): WithStatementSyntax;
        public withCondition(condition: IExpressionSyntax): WithStatementSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): WithStatementSyntax;
        public withStatement(statement: IStatementSyntax): WithStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class EnumDeclarationSyntax extends SyntaxNode implements IModuleElementSyntax {
        public modifiers: ISyntaxList;
        public enumKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public openBraceToken: ISyntaxToken;
        public enumElements: ISeparatedSyntaxList;
        public closeBraceToken: ISyntaxToken;
        constructor(modifiers: ISyntaxList, enumKeyword: ISyntaxToken, identifier: ISyntaxToken, openBraceToken: ISyntaxToken, enumElements: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isModuleElement(): boolean;
        public update(modifiers: ISyntaxList, enumKeyword: ISyntaxToken, identifier: ISyntaxToken, openBraceToken: ISyntaxToken, enumElements: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): EnumDeclarationSyntax;
        static create(enumKeyword: ISyntaxToken, identifier: ISyntaxToken, openBraceToken: ISyntaxToken, closeBraceToken: ISyntaxToken): EnumDeclarationSyntax;
        static create1(identifier: ISyntaxToken): EnumDeclarationSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): EnumDeclarationSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): EnumDeclarationSyntax;
        public withModifiers(modifiers: ISyntaxList): EnumDeclarationSyntax;
        public withModifier(modifier: ISyntaxToken): EnumDeclarationSyntax;
        public withEnumKeyword(enumKeyword: ISyntaxToken): EnumDeclarationSyntax;
        public withIdentifier(identifier: ISyntaxToken): EnumDeclarationSyntax;
        public withOpenBraceToken(openBraceToken: ISyntaxToken): EnumDeclarationSyntax;
        public withEnumElements(enumElements: ISeparatedSyntaxList): EnumDeclarationSyntax;
        public withEnumElement(enumElement: EnumElementSyntax): EnumDeclarationSyntax;
        public withCloseBraceToken(closeBraceToken: ISyntaxToken): EnumDeclarationSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class EnumElementSyntax extends SyntaxNode {
        public propertyName: ISyntaxToken;
        public equalsValueClause: EqualsValueClauseSyntax;
        constructor(propertyName: ISyntaxToken, equalsValueClause: EqualsValueClauseSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(propertyName: ISyntaxToken, equalsValueClause: EqualsValueClauseSyntax): EnumElementSyntax;
        static create(propertyName: ISyntaxToken): EnumElementSyntax;
        static create1(propertyName: ISyntaxToken): EnumElementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): EnumElementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): EnumElementSyntax;
        public withPropertyName(propertyName: ISyntaxToken): EnumElementSyntax;
        public withEqualsValueClause(equalsValueClause: EqualsValueClauseSyntax): EnumElementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class CastExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public lessThanToken: ISyntaxToken;
        public type: ITypeSyntax;
        public greaterThanToken: ISyntaxToken;
        public expression: IUnaryExpressionSyntax;
        constructor(lessThanToken: ISyntaxToken, type: ITypeSyntax, greaterThanToken: ISyntaxToken, expression: IUnaryExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(lessThanToken: ISyntaxToken, type: ITypeSyntax, greaterThanToken: ISyntaxToken, expression: IUnaryExpressionSyntax): CastExpressionSyntax;
        static create1(type: ITypeSyntax, expression: IUnaryExpressionSyntax): CastExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): CastExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): CastExpressionSyntax;
        public withLessThanToken(lessThanToken: ISyntaxToken): CastExpressionSyntax;
        public withType(type: ITypeSyntax): CastExpressionSyntax;
        public withGreaterThanToken(greaterThanToken: ISyntaxToken): CastExpressionSyntax;
        public withExpression(expression: IUnaryExpressionSyntax): CastExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class ObjectLiteralExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public openBraceToken: ISyntaxToken;
        public propertyAssignments: ISeparatedSyntaxList;
        public closeBraceToken: ISyntaxToken;
        constructor(openBraceToken: ISyntaxToken, propertyAssignments: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(openBraceToken: ISyntaxToken, propertyAssignments: ISeparatedSyntaxList, closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax;
        static create(openBraceToken: ISyntaxToken, closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax;
        static create1(): ObjectLiteralExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): ObjectLiteralExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): ObjectLiteralExpressionSyntax;
        public withOpenBraceToken(openBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax;
        public withPropertyAssignments(propertyAssignments: ISeparatedSyntaxList): ObjectLiteralExpressionSyntax;
        public withPropertyAssignment(propertyAssignment: PropertyAssignmentSyntax): ObjectLiteralExpressionSyntax;
        public withCloseBraceToken(closeBraceToken: ISyntaxToken): ObjectLiteralExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class PropertyAssignmentSyntax extends SyntaxNode {
        public propertyName: ISyntaxToken;
        constructor(propertyName: ISyntaxToken, parsedInStrictMode: boolean);
        public withLeadingTrivia(trivia: ISyntaxTriviaList): PropertyAssignmentSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): PropertyAssignmentSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class SimplePropertyAssignmentSyntax extends PropertyAssignmentSyntax {
        public colonToken: ISyntaxToken;
        public expression: IExpressionSyntax;
        constructor(propertyName: ISyntaxToken, colonToken: ISyntaxToken, expression: IExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(propertyName: ISyntaxToken, colonToken: ISyntaxToken, expression: IExpressionSyntax): SimplePropertyAssignmentSyntax;
        static create1(propertyName: ISyntaxToken, expression: IExpressionSyntax): SimplePropertyAssignmentSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SimplePropertyAssignmentSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SimplePropertyAssignmentSyntax;
        public withPropertyName(propertyName: ISyntaxToken): SimplePropertyAssignmentSyntax;
        public withColonToken(colonToken: ISyntaxToken): SimplePropertyAssignmentSyntax;
        public withExpression(expression: IExpressionSyntax): SimplePropertyAssignmentSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class FunctionPropertyAssignmentSyntax extends PropertyAssignmentSyntax {
        public callSignature: CallSignatureSyntax;
        public block: BlockSyntax;
        constructor(propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(propertyName: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionPropertyAssignmentSyntax;
        static create1(propertyName: ISyntaxToken): FunctionPropertyAssignmentSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionPropertyAssignmentSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionPropertyAssignmentSyntax;
        public withPropertyName(propertyName: ISyntaxToken): FunctionPropertyAssignmentSyntax;
        public withCallSignature(callSignature: CallSignatureSyntax): FunctionPropertyAssignmentSyntax;
        public withBlock(block: BlockSyntax): FunctionPropertyAssignmentSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class AccessorPropertyAssignmentSyntax extends PropertyAssignmentSyntax {
        public openParenToken: ISyntaxToken;
        public closeParenToken: ISyntaxToken;
        public block: BlockSyntax;
        constructor(propertyName: ISyntaxToken, openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, block: BlockSyntax, parsedInStrictMode: boolean);
        public withLeadingTrivia(trivia: ISyntaxTriviaList): AccessorPropertyAssignmentSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): AccessorPropertyAssignmentSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class GetAccessorPropertyAssignmentSyntax extends AccessorPropertyAssignmentSyntax {
        public getKeyword: ISyntaxToken;
        public typeAnnotation: TypeAnnotationSyntax;
        constructor(getKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(getKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, block: BlockSyntax): GetAccessorPropertyAssignmentSyntax;
        static create(getKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, closeParenToken: ISyntaxToken, block: BlockSyntax): GetAccessorPropertyAssignmentSyntax;
        static create1(propertyName: ISyntaxToken): GetAccessorPropertyAssignmentSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): GetAccessorPropertyAssignmentSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): GetAccessorPropertyAssignmentSyntax;
        public withGetKeyword(getKeyword: ISyntaxToken): GetAccessorPropertyAssignmentSyntax;
        public withPropertyName(propertyName: ISyntaxToken): GetAccessorPropertyAssignmentSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): GetAccessorPropertyAssignmentSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): GetAccessorPropertyAssignmentSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): GetAccessorPropertyAssignmentSyntax;
        public withBlock(block: BlockSyntax): GetAccessorPropertyAssignmentSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class SetAccessorPropertyAssignmentSyntax extends AccessorPropertyAssignmentSyntax {
        public setKeyword: ISyntaxToken;
        public parameter: ParameterSyntax;
        constructor(setKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, parameter: ParameterSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(setKeyword: ISyntaxToken, propertyName: ISyntaxToken, openParenToken: ISyntaxToken, parameter: ParameterSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): SetAccessorPropertyAssignmentSyntax;
        static create1(propertyName: ISyntaxToken, parameter: ParameterSyntax): SetAccessorPropertyAssignmentSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): SetAccessorPropertyAssignmentSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): SetAccessorPropertyAssignmentSyntax;
        public withSetKeyword(setKeyword: ISyntaxToken): SetAccessorPropertyAssignmentSyntax;
        public withPropertyName(propertyName: ISyntaxToken): SetAccessorPropertyAssignmentSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): SetAccessorPropertyAssignmentSyntax;
        public withParameter(parameter: ParameterSyntax): SetAccessorPropertyAssignmentSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): SetAccessorPropertyAssignmentSyntax;
        public withBlock(block: BlockSyntax): SetAccessorPropertyAssignmentSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class FunctionExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public functionKeyword: ISyntaxToken;
        public identifier: ISyntaxToken;
        public callSignature: CallSignatureSyntax;
        public block: BlockSyntax;
        constructor(functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(functionKeyword: ISyntaxToken, identifier: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionExpressionSyntax;
        static create(functionKeyword: ISyntaxToken, callSignature: CallSignatureSyntax, block: BlockSyntax): FunctionExpressionSyntax;
        static create1(): FunctionExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): FunctionExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): FunctionExpressionSyntax;
        public withFunctionKeyword(functionKeyword: ISyntaxToken): FunctionExpressionSyntax;
        public withIdentifier(identifier: ISyntaxToken): FunctionExpressionSyntax;
        public withCallSignature(callSignature: CallSignatureSyntax): FunctionExpressionSyntax;
        public withBlock(block: BlockSyntax): FunctionExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class EmptyStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public semicolonToken: ISyntaxToken;
        constructor(semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(semicolonToken: ISyntaxToken): EmptyStatementSyntax;
        static create1(): EmptyStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): EmptyStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): EmptyStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): EmptyStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class TryStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public tryKeyword: ISyntaxToken;
        public block: BlockSyntax;
        public catchClause: CatchClauseSyntax;
        public finallyClause: FinallyClauseSyntax;
        constructor(tryKeyword: ISyntaxToken, block: BlockSyntax, catchClause: CatchClauseSyntax, finallyClause: FinallyClauseSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(tryKeyword: ISyntaxToken, block: BlockSyntax, catchClause: CatchClauseSyntax, finallyClause: FinallyClauseSyntax): TryStatementSyntax;
        static create(tryKeyword: ISyntaxToken, block: BlockSyntax): TryStatementSyntax;
        static create1(): TryStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): TryStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): TryStatementSyntax;
        public withTryKeyword(tryKeyword: ISyntaxToken): TryStatementSyntax;
        public withBlock(block: BlockSyntax): TryStatementSyntax;
        public withCatchClause(catchClause: CatchClauseSyntax): TryStatementSyntax;
        public withFinallyClause(finallyClause: FinallyClauseSyntax): TryStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class CatchClauseSyntax extends SyntaxNode {
        public catchKeyword: ISyntaxToken;
        public openParenToken: ISyntaxToken;
        public identifier: ISyntaxToken;
        public typeAnnotation: TypeAnnotationSyntax;
        public closeParenToken: ISyntaxToken;
        public block: BlockSyntax;
        constructor(catchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(catchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, identifier: ISyntaxToken, typeAnnotation: TypeAnnotationSyntax, closeParenToken: ISyntaxToken, block: BlockSyntax): CatchClauseSyntax;
        static create(catchKeyword: ISyntaxToken, openParenToken: ISyntaxToken, identifier: ISyntaxToken, closeParenToken: ISyntaxToken, block: BlockSyntax): CatchClauseSyntax;
        static create1(identifier: ISyntaxToken): CatchClauseSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): CatchClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): CatchClauseSyntax;
        public withCatchKeyword(catchKeyword: ISyntaxToken): CatchClauseSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): CatchClauseSyntax;
        public withIdentifier(identifier: ISyntaxToken): CatchClauseSyntax;
        public withTypeAnnotation(typeAnnotation: TypeAnnotationSyntax): CatchClauseSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): CatchClauseSyntax;
        public withBlock(block: BlockSyntax): CatchClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class FinallyClauseSyntax extends SyntaxNode {
        public finallyKeyword: ISyntaxToken;
        public block: BlockSyntax;
        constructor(finallyKeyword: ISyntaxToken, block: BlockSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(finallyKeyword: ISyntaxToken, block: BlockSyntax): FinallyClauseSyntax;
        static create1(): FinallyClauseSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): FinallyClauseSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): FinallyClauseSyntax;
        public withFinallyKeyword(finallyKeyword: ISyntaxToken): FinallyClauseSyntax;
        public withBlock(block: BlockSyntax): FinallyClauseSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class LabeledStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public identifier: ISyntaxToken;
        public colonToken: ISyntaxToken;
        public statement: IStatementSyntax;
        constructor(identifier: ISyntaxToken, colonToken: ISyntaxToken, statement: IStatementSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(identifier: ISyntaxToken, colonToken: ISyntaxToken, statement: IStatementSyntax): LabeledStatementSyntax;
        static create1(identifier: ISyntaxToken, statement: IStatementSyntax): LabeledStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): LabeledStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): LabeledStatementSyntax;
        public withIdentifier(identifier: ISyntaxToken): LabeledStatementSyntax;
        public withColonToken(colonToken: ISyntaxToken): LabeledStatementSyntax;
        public withStatement(statement: IStatementSyntax): LabeledStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class DoStatementSyntax extends IterationStatementSyntax {
        public doKeyword: ISyntaxToken;
        public whileKeyword: ISyntaxToken;
        public condition: IExpressionSyntax;
        public semicolonToken: ISyntaxToken;
        constructor(doKeyword: ISyntaxToken, statement: IStatementSyntax, whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public update(doKeyword: ISyntaxToken, statement: IStatementSyntax, whileKeyword: ISyntaxToken, openParenToken: ISyntaxToken, condition: IExpressionSyntax, closeParenToken: ISyntaxToken, semicolonToken: ISyntaxToken): DoStatementSyntax;
        static create1(statement: IStatementSyntax, condition: IExpressionSyntax): DoStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): DoStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): DoStatementSyntax;
        public withDoKeyword(doKeyword: ISyntaxToken): DoStatementSyntax;
        public withStatement(statement: IStatementSyntax): DoStatementSyntax;
        public withWhileKeyword(whileKeyword: ISyntaxToken): DoStatementSyntax;
        public withOpenParenToken(openParenToken: ISyntaxToken): DoStatementSyntax;
        public withCondition(condition: IExpressionSyntax): DoStatementSyntax;
        public withCloseParenToken(closeParenToken: ISyntaxToken): DoStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): DoStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class TypeOfExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public typeOfKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        constructor(typeOfKeyword: ISyntaxToken, expression: IExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(typeOfKeyword: ISyntaxToken, expression: IExpressionSyntax): TypeOfExpressionSyntax;
        static create1(expression: IExpressionSyntax): TypeOfExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): TypeOfExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): TypeOfExpressionSyntax;
        public withTypeOfKeyword(typeOfKeyword: ISyntaxToken): TypeOfExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): TypeOfExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class DeleteExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public deleteKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        constructor(deleteKeyword: ISyntaxToken, expression: IExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(deleteKeyword: ISyntaxToken, expression: IExpressionSyntax): DeleteExpressionSyntax;
        static create1(expression: IExpressionSyntax): DeleteExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): DeleteExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): DeleteExpressionSyntax;
        public withDeleteKeyword(deleteKeyword: ISyntaxToken): DeleteExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): DeleteExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class VoidExpressionSyntax extends SyntaxNode implements IUnaryExpressionSyntax {
        public voidKeyword: ISyntaxToken;
        public expression: IExpressionSyntax;
        constructor(voidKeyword: ISyntaxToken, expression: IExpressionSyntax, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isUnaryExpression(): boolean;
        public isExpression(): boolean;
        public update(voidKeyword: ISyntaxToken, expression: IExpressionSyntax): VoidExpressionSyntax;
        static create1(expression: IExpressionSyntax): VoidExpressionSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): VoidExpressionSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): VoidExpressionSyntax;
        public withVoidKeyword(voidKeyword: ISyntaxToken): VoidExpressionSyntax;
        public withExpression(expression: IExpressionSyntax): VoidExpressionSyntax;
        public isTypeScriptSpecific(): boolean;
    }
    class DebuggerStatementSyntax extends SyntaxNode implements IStatementSyntax {
        public debuggerKeyword: ISyntaxToken;
        public semicolonToken: ISyntaxToken;
        constructor(debuggerKeyword: ISyntaxToken, semicolonToken: ISyntaxToken, parsedInStrictMode: boolean);
        public accept(visitor: ISyntaxVisitor): any;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(slot: number): ISyntaxElement;
        public isStatement(): boolean;
        public isModuleElement(): boolean;
        public update(debuggerKeyword: ISyntaxToken, semicolonToken: ISyntaxToken): DebuggerStatementSyntax;
        static create1(): DebuggerStatementSyntax;
        public withLeadingTrivia(trivia: ISyntaxTriviaList): DebuggerStatementSyntax;
        public withTrailingTrivia(trivia: ISyntaxTriviaList): DebuggerStatementSyntax;
        public withDebuggerKeyword(debuggerKeyword: ISyntaxToken): DebuggerStatementSyntax;
        public withSemicolonToken(semicolonToken: ISyntaxToken): DebuggerStatementSyntax;
        public isTypeScriptSpecific(): boolean;
    }
}
declare module TypeScript {
    class SyntaxRewriter implements ISyntaxVisitor {
        public visitToken(token: ISyntaxToken): ISyntaxToken;
        public visitNode(node: SyntaxNode): SyntaxNode;
        public visitNodeOrToken(node: ISyntaxNodeOrToken): ISyntaxNodeOrToken;
        public visitList(list: ISyntaxList): ISyntaxList;
        public visitSeparatedList(list: ISeparatedSyntaxList): ISeparatedSyntaxList;
        public visitSourceUnit(node: SourceUnitSyntax): any;
        public visitExternalModuleReference(node: ExternalModuleReferenceSyntax): any;
        public visitModuleNameModuleReference(node: ModuleNameModuleReferenceSyntax): any;
        public visitImportDeclaration(node: ImportDeclarationSyntax): any;
        public visitExportAssignment(node: ExportAssignmentSyntax): any;
        public visitClassDeclaration(node: ClassDeclarationSyntax): any;
        public visitInterfaceDeclaration(node: InterfaceDeclarationSyntax): any;
        public visitHeritageClause(node: HeritageClauseSyntax): any;
        public visitModuleDeclaration(node: ModuleDeclarationSyntax): any;
        public visitFunctionDeclaration(node: FunctionDeclarationSyntax): any;
        public visitVariableStatement(node: VariableStatementSyntax): any;
        public visitVariableDeclaration(node: VariableDeclarationSyntax): any;
        public visitVariableDeclarator(node: VariableDeclaratorSyntax): any;
        public visitEqualsValueClause(node: EqualsValueClauseSyntax): any;
        public visitPrefixUnaryExpression(node: PrefixUnaryExpressionSyntax): any;
        public visitArrayLiteralExpression(node: ArrayLiteralExpressionSyntax): any;
        public visitOmittedExpression(node: OmittedExpressionSyntax): any;
        public visitParenthesizedExpression(node: ParenthesizedExpressionSyntax): any;
        public visitSimpleArrowFunctionExpression(node: SimpleArrowFunctionExpressionSyntax): any;
        public visitParenthesizedArrowFunctionExpression(node: ParenthesizedArrowFunctionExpressionSyntax): any;
        public visitQualifiedName(node: QualifiedNameSyntax): any;
        public visitTypeArgumentList(node: TypeArgumentListSyntax): any;
        public visitConstructorType(node: ConstructorTypeSyntax): any;
        public visitFunctionType(node: FunctionTypeSyntax): any;
        public visitObjectType(node: ObjectTypeSyntax): any;
        public visitArrayType(node: ArrayTypeSyntax): any;
        public visitGenericType(node: GenericTypeSyntax): any;
        public visitTypeAnnotation(node: TypeAnnotationSyntax): any;
        public visitBlock(node: BlockSyntax): any;
        public visitParameter(node: ParameterSyntax): any;
        public visitMemberAccessExpression(node: MemberAccessExpressionSyntax): any;
        public visitPostfixUnaryExpression(node: PostfixUnaryExpressionSyntax): any;
        public visitElementAccessExpression(node: ElementAccessExpressionSyntax): any;
        public visitInvocationExpression(node: InvocationExpressionSyntax): any;
        public visitArgumentList(node: ArgumentListSyntax): any;
        public visitBinaryExpression(node: BinaryExpressionSyntax): any;
        public visitConditionalExpression(node: ConditionalExpressionSyntax): any;
        public visitConstructSignature(node: ConstructSignatureSyntax): any;
        public visitMethodSignature(node: MethodSignatureSyntax): any;
        public visitIndexSignature(node: IndexSignatureSyntax): any;
        public visitPropertySignature(node: PropertySignatureSyntax): any;
        public visitCallSignature(node: CallSignatureSyntax): any;
        public visitParameterList(node: ParameterListSyntax): any;
        public visitTypeParameterList(node: TypeParameterListSyntax): any;
        public visitTypeParameter(node: TypeParameterSyntax): any;
        public visitConstraint(node: ConstraintSyntax): any;
        public visitElseClause(node: ElseClauseSyntax): any;
        public visitIfStatement(node: IfStatementSyntax): any;
        public visitExpressionStatement(node: ExpressionStatementSyntax): any;
        public visitConstructorDeclaration(node: ConstructorDeclarationSyntax): any;
        public visitMemberFunctionDeclaration(node: MemberFunctionDeclarationSyntax): any;
        public visitGetMemberAccessorDeclaration(node: GetMemberAccessorDeclarationSyntax): any;
        public visitSetMemberAccessorDeclaration(node: SetMemberAccessorDeclarationSyntax): any;
        public visitMemberVariableDeclaration(node: MemberVariableDeclarationSyntax): any;
        public visitThrowStatement(node: ThrowStatementSyntax): any;
        public visitReturnStatement(node: ReturnStatementSyntax): any;
        public visitObjectCreationExpression(node: ObjectCreationExpressionSyntax): any;
        public visitSwitchStatement(node: SwitchStatementSyntax): any;
        public visitCaseSwitchClause(node: CaseSwitchClauseSyntax): any;
        public visitDefaultSwitchClause(node: DefaultSwitchClauseSyntax): any;
        public visitBreakStatement(node: BreakStatementSyntax): any;
        public visitContinueStatement(node: ContinueStatementSyntax): any;
        public visitForStatement(node: ForStatementSyntax): any;
        public visitForInStatement(node: ForInStatementSyntax): any;
        public visitWhileStatement(node: WhileStatementSyntax): any;
        public visitWithStatement(node: WithStatementSyntax): any;
        public visitEnumDeclaration(node: EnumDeclarationSyntax): any;
        public visitEnumElement(node: EnumElementSyntax): any;
        public visitCastExpression(node: CastExpressionSyntax): any;
        public visitObjectLiteralExpression(node: ObjectLiteralExpressionSyntax): any;
        public visitSimplePropertyAssignment(node: SimplePropertyAssignmentSyntax): any;
        public visitFunctionPropertyAssignment(node: FunctionPropertyAssignmentSyntax): any;
        public visitGetAccessorPropertyAssignment(node: GetAccessorPropertyAssignmentSyntax): any;
        public visitSetAccessorPropertyAssignment(node: SetAccessorPropertyAssignmentSyntax): any;
        public visitFunctionExpression(node: FunctionExpressionSyntax): any;
        public visitEmptyStatement(node: EmptyStatementSyntax): any;
        public visitTryStatement(node: TryStatementSyntax): any;
        public visitCatchClause(node: CatchClauseSyntax): any;
        public visitFinallyClause(node: FinallyClauseSyntax): any;
        public visitLabeledStatement(node: LabeledStatementSyntax): any;
        public visitDoStatement(node: DoStatementSyntax): any;
        public visitTypeOfExpression(node: TypeOfExpressionSyntax): any;
        public visitDeleteExpression(node: DeleteExpressionSyntax): any;
        public visitVoidExpression(node: VoidExpressionSyntax): any;
        public visitDebuggerStatement(node: DebuggerStatementSyntax): any;
    }
}
declare module TypeScript {
    class SyntaxDedenter extends SyntaxRewriter {
        private dedentationAmount;
        private minimumIndent;
        private options;
        private lastTriviaWasNewLine;
        constructor(dedentFirstToken: boolean, dedentationAmount: number, minimumIndent: number, options: FormattingOptions);
        private abort();
        private isAborted();
        public visitToken(token: ISyntaxToken): ISyntaxToken;
        private dedentTriviaList(triviaList);
        private dedentSegment(segment, hasFollowingNewLineTrivia);
        private dedentWhitespace(trivia, hasFollowingNewLineTrivia);
        private dedentMultiLineComment(trivia);
        static dedentNode(node: ISyntaxNode, dedentFirstToken: boolean, dedentAmount: number, minimumIndent: number, options: FormattingOptions): ISyntaxNode;
    }
}
declare module TypeScript {
    class SyntaxIndenter extends SyntaxRewriter {
        private indentationAmount;
        private options;
        private lastTriviaWasNewLine;
        private indentationTrivia;
        constructor(indentFirstToken: boolean, indentationAmount: number, options: FormattingOptions);
        public visitToken(token: ISyntaxToken): ISyntaxToken;
        public indentTriviaList(triviaList: ISyntaxTriviaList): ISyntaxTriviaList;
        private indentSegment(segment);
        private indentWhitespace(trivia, indentThisTrivia, result);
        private indentSingleLineOrSkippedText(trivia, indentThisTrivia, result);
        private indentMultiLineComment(trivia, indentThisTrivia, result);
        static indentNode(node: ISyntaxNode, indentFirstToken: boolean, indentAmount: number, options: FormattingOptions): SyntaxNode;
        static indentNodes(nodes: SyntaxNode[], indentFirstToken: boolean, indentAmount: number, options: FormattingOptions): SyntaxNode[];
    }
}
declare module TypeScript.Syntax {
    class VariableWidthTokenWithNoTrivia implements ISyntaxToken {
        private _sourceText;
        private _fullStart;
        public tokenKind: SyntaxKind;
        private _textOrWidth;
        constructor(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, textOrWidth: any);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        private start();
        private end();
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    class VariableWidthTokenWithLeadingTrivia implements ISyntaxToken {
        private _sourceText;
        private _fullStart;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo;
        private _textOrWidth;
        constructor(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number, textOrWidth: any);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        private start();
        private end();
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    class VariableWidthTokenWithTrailingTrivia implements ISyntaxToken {
        private _sourceText;
        private _fullStart;
        public tokenKind: SyntaxKind;
        private _textOrWidth;
        private _trailingTriviaInfo;
        constructor(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, textOrWidth: any, trailingTriviaInfo: number);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        private start();
        private end();
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    class VariableWidthTokenWithLeadingAndTrailingTrivia implements ISyntaxToken {
        private _sourceText;
        private _fullStart;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo;
        private _textOrWidth;
        private _trailingTriviaInfo;
        constructor(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number, textOrWidth: any, trailingTriviaInfo: number);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        private start();
        private end();
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    class FixedWidthTokenWithNoTrivia implements ISyntaxToken {
        public tokenKind: SyntaxKind;
        constructor(kind: SyntaxKind);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    class FixedWidthTokenWithLeadingTrivia implements ISyntaxToken {
        private _sourceText;
        private _fullStart;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo;
        constructor(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        private start();
        private end();
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    class FixedWidthTokenWithTrailingTrivia implements ISyntaxToken {
        private _sourceText;
        private _fullStart;
        public tokenKind: SyntaxKind;
        private _trailingTriviaInfo;
        constructor(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, trailingTriviaInfo: number);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        private start();
        private end();
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    class FixedWidthTokenWithLeadingAndTrailingTrivia implements ISyntaxToken {
        private _sourceText;
        private _fullStart;
        public tokenKind: SyntaxKind;
        private _leadingTriviaInfo;
        private _trailingTriviaInfo;
        constructor(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number, trailingTriviaInfo: number);
        public clone(): ISyntaxToken;
        public isNode(): boolean;
        public isToken(): boolean;
        public isList(): boolean;
        public isSeparatedList(): boolean;
        public kind(): SyntaxKind;
        public childCount(): number;
        public childAt(index: number): ISyntaxElement;
        public fullWidth(): number;
        private start();
        private end();
        public width(): number;
        public text(): string;
        public fullText(): string;
        public value(): any;
        public valueText(): string;
        public hasLeadingTrivia(): boolean;
        public hasLeadingComment(): boolean;
        public hasLeadingNewLine(): boolean;
        public hasLeadingSkippedText(): boolean;
        public leadingTriviaWidth(): number;
        public leadingTrivia(): ISyntaxTriviaList;
        public hasTrailingTrivia(): boolean;
        public hasTrailingComment(): boolean;
        public hasTrailingNewLine(): boolean;
        public hasTrailingSkippedText(): boolean;
        public trailingTriviaWidth(): number;
        public trailingTrivia(): ISyntaxTriviaList;
        public hasSkippedToken(): boolean;
        public toJSON(key);
        public firstToken(): ISyntaxToken;
        public lastToken(): ISyntaxToken;
        public isTypeScriptSpecific(): boolean;
        public isIncrementallyUnusable(): boolean;
        public accept(visitor: ISyntaxVisitor): any;
        private realize();
        public collectTextElements(elements: string[]): void;
        private findTokenInternal(parent, position, fullStart);
        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
    }
    function fixedWidthToken(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number, trailingTriviaInfo: number): ISyntaxToken;
    function variableWidthToken(sourceText: ISimpleText, fullStart: number, kind: SyntaxKind, leadingTriviaInfo: number, width: number, trailingTriviaInfo: number): ISyntaxToken;
}
declare module TypeScript {
    interface ISyntaxToken extends ISyntaxNodeOrToken, INameSyntax {
        tokenKind: SyntaxKind;
        text(): string;
        value(): any;
        valueText(): string;
        hasLeadingTrivia(): boolean;
        hasLeadingComment(): boolean;
        hasLeadingNewLine(): boolean;
        hasLeadingSkippedText(): boolean;
        hasTrailingTrivia(): boolean;
        hasTrailingComment(): boolean;
        hasTrailingNewLine(): boolean;
        hasTrailingSkippedText(): boolean;
        hasSkippedToken(): boolean;
        leadingTrivia(): ISyntaxTriviaList;
        trailingTrivia(): ISyntaxTriviaList;
        withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken;
        withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken;
        clone(): ISyntaxToken;
    }
    interface ITokenInfo {
        leadingTrivia?: ISyntaxTrivia[];
        text?: string;
        trailingTrivia?: ISyntaxTrivia[];
    }
}
declare module TypeScript.Syntax {
    function realizeToken(token: ISyntaxToken): ISyntaxToken;
    function convertToIdentifierName(token: ISyntaxToken): ISyntaxToken;
    function tokenToJSON(token: ISyntaxToken);
    function value(token: ISyntaxToken): any;
    function valueText(token: ISyntaxToken): string;
    function emptyToken(kind: SyntaxKind): ISyntaxToken;
    function token(kind: SyntaxKind, info?: ITokenInfo): ISyntaxToken;
    function identifier(text: string, info?: ITokenInfo): ISyntaxToken;
}
declare module TypeScript {
    class SyntaxTokenReplacer extends SyntaxRewriter {
        private token1;
        private token2;
        constructor(token1: ISyntaxToken, token2: ISyntaxToken);
        public visitToken(token: ISyntaxToken): ISyntaxToken;
        public visitNode(node: SyntaxNode): SyntaxNode;
        public visitList(list: ISyntaxList): ISyntaxList;
        public visitSeparatedList(list: ISeparatedSyntaxList): ISeparatedSyntaxList;
    }
}
declare module TypeScript {
    interface ISyntaxTrivia {
        kind(): SyntaxKind;
        isWhitespace(): boolean;
        isComment(): boolean;
        isNewLine(): boolean;
        isSkippedToken(): boolean;
        fullWidth(): number;
        fullText(): string;
        skippedToken(): ISyntaxToken;
    }
}
declare module TypeScript.Syntax {
    function trivia(kind: SyntaxKind, text: string): ISyntaxTrivia;
    function skippedTokenTrivia(token: ISyntaxToken): ISyntaxTrivia;
    function spaces(count: number): ISyntaxTrivia;
    function whitespace(text: string): ISyntaxTrivia;
    function multiLineComment(text: string): ISyntaxTrivia;
    function singleLineComment(text: string): ISyntaxTrivia;
    var spaceTrivia: ISyntaxTrivia;
    var lineFeedTrivia: ISyntaxTrivia;
    var carriageReturnTrivia: ISyntaxTrivia;
    var carriageReturnLineFeedTrivia: ISyntaxTrivia;
    function splitMultiLineCommentTriviaIntoMultipleLines(trivia: ISyntaxTrivia): string[];
}
declare module TypeScript {
    interface ISyntaxTriviaList {
        count(): number;
        syntaxTriviaAt(index: number): ISyntaxTrivia;
        fullWidth(): number;
        fullText(): string;
        hasComment(): boolean;
        hasNewLine(): boolean;
        hasSkippedToken(): boolean;
        last(): ISyntaxTrivia;
        toArray(): ISyntaxTrivia[];
        concat(trivia: ISyntaxTriviaList): ISyntaxTriviaList;
        collectTextElements(elements: string[]): void;
    }
}
declare module TypeScript.Syntax {
    var emptyTriviaList: ISyntaxTriviaList;
    function triviaList(trivia: ISyntaxTrivia[]): ISyntaxTriviaList;
    var spaceTriviaList: ISyntaxTriviaList;
}
declare module TypeScript {
    class SyntaxUtilities {
        static isAngleBracket(positionedElement: PositionedElement): boolean;
    }
}
declare module TypeScript {
    interface ISyntaxVisitor {
        visitToken(token: TypeScript.ISyntaxToken): any;
        visitSourceUnit(node: TypeScript.SourceUnitSyntax): any;
        visitExternalModuleReference(node: TypeScript.ExternalModuleReferenceSyntax): any;
        visitModuleNameModuleReference(node: TypeScript.ModuleNameModuleReferenceSyntax): any;
        visitImportDeclaration(node: TypeScript.ImportDeclarationSyntax): any;
        visitExportAssignment(node: TypeScript.ExportAssignmentSyntax): any;
        visitClassDeclaration(node: TypeScript.ClassDeclarationSyntax): any;
        visitInterfaceDeclaration(node: TypeScript.InterfaceDeclarationSyntax): any;
        visitHeritageClause(node: TypeScript.HeritageClauseSyntax): any;
        visitModuleDeclaration(node: TypeScript.ModuleDeclarationSyntax): any;
        visitFunctionDeclaration(node: TypeScript.FunctionDeclarationSyntax): any;
        visitVariableStatement(node: TypeScript.VariableStatementSyntax): any;
        visitVariableDeclaration(node: TypeScript.VariableDeclarationSyntax): any;
        visitVariableDeclarator(node: TypeScript.VariableDeclaratorSyntax): any;
        visitEqualsValueClause(node: TypeScript.EqualsValueClauseSyntax): any;
        visitPrefixUnaryExpression(node: TypeScript.PrefixUnaryExpressionSyntax): any;
        visitArrayLiteralExpression(node: TypeScript.ArrayLiteralExpressionSyntax): any;
        visitOmittedExpression(node: TypeScript.OmittedExpressionSyntax): any;
        visitParenthesizedExpression(node: TypeScript.ParenthesizedExpressionSyntax): any;
        visitSimpleArrowFunctionExpression(node: TypeScript.SimpleArrowFunctionExpressionSyntax): any;
        visitParenthesizedArrowFunctionExpression(node: TypeScript.ParenthesizedArrowFunctionExpressionSyntax): any;
        visitQualifiedName(node: TypeScript.QualifiedNameSyntax): any;
        visitTypeArgumentList(node: TypeScript.TypeArgumentListSyntax): any;
        visitConstructorType(node: TypeScript.ConstructorTypeSyntax): any;
        visitFunctionType(node: TypeScript.FunctionTypeSyntax): any;
        visitObjectType(node: TypeScript.ObjectTypeSyntax): any;
        visitArrayType(node: TypeScript.ArrayTypeSyntax): any;
        visitGenericType(node: TypeScript.GenericTypeSyntax): any;
        visitTypeAnnotation(node: TypeScript.TypeAnnotationSyntax): any;
        visitBlock(node: TypeScript.BlockSyntax): any;
        visitParameter(node: TypeScript.ParameterSyntax): any;
        visitMemberAccessExpression(node: TypeScript.MemberAccessExpressionSyntax): any;
        visitPostfixUnaryExpression(node: TypeScript.PostfixUnaryExpressionSyntax): any;
        visitElementAccessExpression(node: TypeScript.ElementAccessExpressionSyntax): any;
        visitInvocationExpression(node: TypeScript.InvocationExpressionSyntax): any;
        visitArgumentList(node: TypeScript.ArgumentListSyntax): any;
        visitBinaryExpression(node: TypeScript.BinaryExpressionSyntax): any;
        visitConditionalExpression(node: TypeScript.ConditionalExpressionSyntax): any;
        visitConstructSignature(node: TypeScript.ConstructSignatureSyntax): any;
        visitMethodSignature(node: TypeScript.MethodSignatureSyntax): any;
        visitIndexSignature(node: TypeScript.IndexSignatureSyntax): any;
        visitPropertySignature(node: TypeScript.PropertySignatureSyntax): any;
        visitCallSignature(node: TypeScript.CallSignatureSyntax): any;
        visitParameterList(node: TypeScript.ParameterListSyntax): any;
        visitTypeParameterList(node: TypeScript.TypeParameterListSyntax): any;
        visitTypeParameter(node: TypeScript.TypeParameterSyntax): any;
        visitConstraint(node: TypeScript.ConstraintSyntax): any;
        visitElseClause(node: TypeScript.ElseClauseSyntax): any;
        visitIfStatement(node: TypeScript.IfStatementSyntax): any;
        visitExpressionStatement(node: TypeScript.ExpressionStatementSyntax): any;
        visitConstructorDeclaration(node: TypeScript.ConstructorDeclarationSyntax): any;
        visitMemberFunctionDeclaration(node: TypeScript.MemberFunctionDeclarationSyntax): any;
        visitGetMemberAccessorDeclaration(node: TypeScript.GetMemberAccessorDeclarationSyntax): any;
        visitSetMemberAccessorDeclaration(node: TypeScript.SetMemberAccessorDeclarationSyntax): any;
        visitMemberVariableDeclaration(node: TypeScript.MemberVariableDeclarationSyntax): any;
        visitThrowStatement(node: TypeScript.ThrowStatementSyntax): any;
        visitReturnStatement(node: TypeScript.ReturnStatementSyntax): any;
        visitObjectCreationExpression(node: TypeScript.ObjectCreationExpressionSyntax): any;
        visitSwitchStatement(node: TypeScript.SwitchStatementSyntax): any;
        visitCaseSwitchClause(node: TypeScript.CaseSwitchClauseSyntax): any;
        visitDefaultSwitchClause(node: TypeScript.DefaultSwitchClauseSyntax): any;
        visitBreakStatement(node: TypeScript.BreakStatementSyntax): any;
        visitContinueStatement(node: TypeScript.ContinueStatementSyntax): any;
        visitForStatement(node: TypeScript.ForStatementSyntax): any;
        visitForInStatement(node: TypeScript.ForInStatementSyntax): any;
        visitWhileStatement(node: TypeScript.WhileStatementSyntax): any;
        visitWithStatement(node: TypeScript.WithStatementSyntax): any;
        visitEnumDeclaration(node: TypeScript.EnumDeclarationSyntax): any;
        visitEnumElement(node: TypeScript.EnumElementSyntax): any;
        visitCastExpression(node: TypeScript.CastExpressionSyntax): any;
        visitObjectLiteralExpression(node: TypeScript.ObjectLiteralExpressionSyntax): any;
        visitSimplePropertyAssignment(node: TypeScript.SimplePropertyAssignmentSyntax): any;
        visitFunctionPropertyAssignment(node: TypeScript.FunctionPropertyAssignmentSyntax): any;
        visitGetAccessorPropertyAssignment(node: TypeScript.GetAccessorPropertyAssignmentSyntax): any;
        visitSetAccessorPropertyAssignment(node: TypeScript.SetAccessorPropertyAssignmentSyntax): any;
        visitFunctionExpression(node: TypeScript.FunctionExpressionSyntax): any;
        visitEmptyStatement(node: TypeScript.EmptyStatementSyntax): any;
        visitTryStatement(node: TypeScript.TryStatementSyntax): any;
        visitCatchClause(node: TypeScript.CatchClauseSyntax): any;
        visitFinallyClause(node: TypeScript.FinallyClauseSyntax): any;
        visitLabeledStatement(node: TypeScript.LabeledStatementSyntax): any;
        visitDoStatement(node: TypeScript.DoStatementSyntax): any;
        visitTypeOfExpression(node: TypeScript.TypeOfExpressionSyntax): any;
        visitDeleteExpression(node: TypeScript.DeleteExpressionSyntax): any;
        visitVoidExpression(node: TypeScript.VoidExpressionSyntax): any;
        visitDebuggerStatement(node: TypeScript.DebuggerStatementSyntax): any;
    }
    class SyntaxVisitor implements ISyntaxVisitor {
        public defaultVisit(node: ISyntaxNodeOrToken): any;
        public visitToken(token: ISyntaxToken): any;
        public visitSourceUnit(node: SourceUnitSyntax): any;
        public visitExternalModuleReference(node: ExternalModuleReferenceSyntax): any;
        public visitModuleNameModuleReference(node: ModuleNameModuleReferenceSyntax): any;
        public visitImportDeclaration(node: ImportDeclarationSyntax): any;
        public visitExportAssignment(node: ExportAssignmentSyntax): any;
        public visitClassDeclaration(node: ClassDeclarationSyntax): any;
        public visitInterfaceDeclaration(node: InterfaceDeclarationSyntax): any;
        public visitHeritageClause(node: HeritageClauseSyntax): any;
        public visitModuleDeclaration(node: ModuleDeclarationSyntax): any;
        public visitFunctionDeclaration(node: FunctionDeclarationSyntax): any;
        public visitVariableStatement(node: VariableStatementSyntax): any;
        public visitVariableDeclaration(node: VariableDeclarationSyntax): any;
        public visitVariableDeclarator(node: VariableDeclaratorSyntax): any;
        public visitEqualsValueClause(node: EqualsValueClauseSyntax): any;
        public visitPrefixUnaryExpression(node: PrefixUnaryExpressionSyntax): any;
        public visitArrayLiteralExpression(node: ArrayLiteralExpressionSyntax): any;
        public visitOmittedExpression(node: OmittedExpressionSyntax): any;
        public visitParenthesizedExpression(node: ParenthesizedExpressionSyntax): any;
        public visitSimpleArrowFunctionExpression(node: SimpleArrowFunctionExpressionSyntax): any;
        public visitParenthesizedArrowFunctionExpression(node: ParenthesizedArrowFunctionExpressionSyntax): any;
        public visitQualifiedName(node: QualifiedNameSyntax): any;
        public visitTypeArgumentList(node: TypeArgumentListSyntax): any;
        public visitConstructorType(node: ConstructorTypeSyntax): any;
        public visitFunctionType(node: FunctionTypeSyntax): any;
        public visitObjectType(node: ObjectTypeSyntax): any;
        public visitArrayType(node: ArrayTypeSyntax): any;
        public visitGenericType(node: GenericTypeSyntax): any;
        public visitTypeAnnotation(node: TypeAnnotationSyntax): any;
        public visitBlock(node: BlockSyntax): any;
        public visitParameter(node: ParameterSyntax): any;
        public visitMemberAccessExpression(node: MemberAccessExpressionSyntax): any;
        public visitPostfixUnaryExpression(node: PostfixUnaryExpressionSyntax): any;
        public visitElementAccessExpression(node: ElementAccessExpressionSyntax): any;
        public visitInvocationExpression(node: InvocationExpressionSyntax): any;
        public visitArgumentList(node: ArgumentListSyntax): any;
        public visitBinaryExpression(node: BinaryExpressionSyntax): any;
        public visitConditionalExpression(node: ConditionalExpressionSyntax): any;
        public visitConstructSignature(node: ConstructSignatureSyntax): any;
        public visitMethodSignature(node: MethodSignatureSyntax): any;
        public visitIndexSignature(node: IndexSignatureSyntax): any;
        public visitPropertySignature(node: PropertySignatureSyntax): any;
        public visitCallSignature(node: CallSignatureSyntax): any;
        public visitParameterList(node: ParameterListSyntax): any;
        public visitTypeParameterList(node: TypeParameterListSyntax): any;
        public visitTypeParameter(node: TypeParameterSyntax): any;
        public visitConstraint(node: ConstraintSyntax): any;
        public visitElseClause(node: ElseClauseSyntax): any;
        public visitIfStatement(node: IfStatementSyntax): any;
        public visitExpressionStatement(node: ExpressionStatementSyntax): any;
        public visitConstructorDeclaration(node: ConstructorDeclarationSyntax): any;
        public visitMemberFunctionDeclaration(node: MemberFunctionDeclarationSyntax): any;
        public visitGetMemberAccessorDeclaration(node: GetMemberAccessorDeclarationSyntax): any;
        public visitSetMemberAccessorDeclaration(node: SetMemberAccessorDeclarationSyntax): any;
        public visitMemberVariableDeclaration(node: MemberVariableDeclarationSyntax): any;
        public visitThrowStatement(node: ThrowStatementSyntax): any;
        public visitReturnStatement(node: ReturnStatementSyntax): any;
        public visitObjectCreationExpression(node: ObjectCreationExpressionSyntax): any;
        public visitSwitchStatement(node: SwitchStatementSyntax): any;
        public visitCaseSwitchClause(node: CaseSwitchClauseSyntax): any;
        public visitDefaultSwitchClause(node: DefaultSwitchClauseSyntax): any;
        public visitBreakStatement(node: BreakStatementSyntax): any;
        public visitContinueStatement(node: ContinueStatementSyntax): any;
        public visitForStatement(node: ForStatementSyntax): any;
        public visitForInStatement(node: ForInStatementSyntax): any;
        public visitWhileStatement(node: WhileStatementSyntax): any;
        public visitWithStatement(node: WithStatementSyntax): any;
        public visitEnumDeclaration(node: EnumDeclarationSyntax): any;
        public visitEnumElement(node: EnumElementSyntax): any;
        public visitCastExpression(node: CastExpressionSyntax): any;
        public visitObjectLiteralExpression(node: ObjectLiteralExpressionSyntax): any;
        public visitSimplePropertyAssignment(node: SimplePropertyAssignmentSyntax): any;
        public visitFunctionPropertyAssignment(node: FunctionPropertyAssignmentSyntax): any;
        public visitGetAccessorPropertyAssignment(node: GetAccessorPropertyAssignmentSyntax): any;
        public visitSetAccessorPropertyAssignment(node: SetAccessorPropertyAssignmentSyntax): any;
        public visitFunctionExpression(node: FunctionExpressionSyntax): any;
        public visitEmptyStatement(node: EmptyStatementSyntax): any;
        public visitTryStatement(node: TryStatementSyntax): any;
        public visitCatchClause(node: CatchClauseSyntax): any;
        public visitFinallyClause(node: FinallyClauseSyntax): any;
        public visitLabeledStatement(node: LabeledStatementSyntax): any;
        public visitDoStatement(node: DoStatementSyntax): any;
        public visitTypeOfExpression(node: TypeOfExpressionSyntax): any;
        public visitDeleteExpression(node: DeleteExpressionSyntax): any;
        public visitVoidExpression(node: VoidExpressionSyntax): any;
        public visitDebuggerStatement(node: DebuggerStatementSyntax): any;
    }
}
declare module TypeScript {
    class SyntaxWalker implements ISyntaxVisitor {
        public visitToken(token: ISyntaxToken): void;
        public visitNode(node: SyntaxNode): void;
        public visitNodeOrToken(nodeOrToken: ISyntaxNodeOrToken): void;
        private visitOptionalToken(token);
        public visitOptionalNode(node: SyntaxNode): void;
        public visitOptionalNodeOrToken(nodeOrToken: ISyntaxNodeOrToken): void;
        public visitList(list: ISyntaxList): void;
        public visitSeparatedList(list: ISeparatedSyntaxList): void;
        public visitSourceUnit(node: SourceUnitSyntax): void;
        public visitExternalModuleReference(node: ExternalModuleReferenceSyntax): void;
        public visitModuleNameModuleReference(node: ModuleNameModuleReferenceSyntax): void;
        public visitImportDeclaration(node: ImportDeclarationSyntax): void;
        public visitExportAssignment(node: ExportAssignmentSyntax): void;
        public visitClassDeclaration(node: ClassDeclarationSyntax): void;
        public visitInterfaceDeclaration(node: InterfaceDeclarationSyntax): void;
        public visitHeritageClause(node: HeritageClauseSyntax): void;
        public visitModuleDeclaration(node: ModuleDeclarationSyntax): void;
        public visitFunctionDeclaration(node: FunctionDeclarationSyntax): void;
        public visitVariableStatement(node: VariableStatementSyntax): void;
        public visitVariableDeclaration(node: VariableDeclarationSyntax): void;
        public visitVariableDeclarator(node: VariableDeclaratorSyntax): void;
        public visitEqualsValueClause(node: EqualsValueClauseSyntax): void;
        public visitPrefixUnaryExpression(node: PrefixUnaryExpressionSyntax): void;
        public visitArrayLiteralExpression(node: ArrayLiteralExpressionSyntax): void;
        public visitOmittedExpression(node: OmittedExpressionSyntax): void;
        public visitParenthesizedExpression(node: ParenthesizedExpressionSyntax): void;
        public visitSimpleArrowFunctionExpression(node: SimpleArrowFunctionExpressionSyntax): void;
        public visitParenthesizedArrowFunctionExpression(node: ParenthesizedArrowFunctionExpressionSyntax): void;
        public visitQualifiedName(node: QualifiedNameSyntax): void;
        public visitTypeArgumentList(node: TypeArgumentListSyntax): void;
        public visitConstructorType(node: ConstructorTypeSyntax): void;
        public visitFunctionType(node: FunctionTypeSyntax): void;
        public visitObjectType(node: ObjectTypeSyntax): void;
        public visitArrayType(node: ArrayTypeSyntax): void;
        public visitGenericType(node: GenericTypeSyntax): void;
        public visitTypeAnnotation(node: TypeAnnotationSyntax): void;
        public visitBlock(node: BlockSyntax): void;
        public visitParameter(node: ParameterSyntax): void;
        public visitMemberAccessExpression(node: MemberAccessExpressionSyntax): void;
        public visitPostfixUnaryExpression(node: PostfixUnaryExpressionSyntax): void;
        public visitElementAccessExpression(node: ElementAccessExpressionSyntax): void;
        public visitInvocationExpression(node: InvocationExpressionSyntax): void;
        public visitArgumentList(node: ArgumentListSyntax): void;
        public visitBinaryExpression(node: BinaryExpressionSyntax): void;
        public visitConditionalExpression(node: ConditionalExpressionSyntax): void;
        public visitConstructSignature(node: ConstructSignatureSyntax): void;
        public visitMethodSignature(node: MethodSignatureSyntax): void;
        public visitIndexSignature(node: IndexSignatureSyntax): void;
        public visitPropertySignature(node: PropertySignatureSyntax): void;
        public visitCallSignature(node: CallSignatureSyntax): void;
        public visitParameterList(node: ParameterListSyntax): void;
        public visitTypeParameterList(node: TypeParameterListSyntax): void;
        public visitTypeParameter(node: TypeParameterSyntax): void;
        public visitConstraint(node: ConstraintSyntax): void;
        public visitElseClause(node: ElseClauseSyntax): void;
        public visitIfStatement(node: IfStatementSyntax): void;
        public visitExpressionStatement(node: ExpressionStatementSyntax): void;
        public visitConstructorDeclaration(node: ConstructorDeclarationSyntax): void;
        public visitMemberFunctionDeclaration(node: MemberFunctionDeclarationSyntax): void;
        public visitGetMemberAccessorDeclaration(node: GetMemberAccessorDeclarationSyntax): void;
        public visitSetMemberAccessorDeclaration(node: SetMemberAccessorDeclarationSyntax): void;
        public visitMemberVariableDeclaration(node: MemberVariableDeclarationSyntax): void;
        public visitThrowStatement(node: ThrowStatementSyntax): void;
        public visitReturnStatement(node: ReturnStatementSyntax): void;
        public visitObjectCreationExpression(node: ObjectCreationExpressionSyntax): void;
        public visitSwitchStatement(node: SwitchStatementSyntax): void;
        public visitCaseSwitchClause(node: CaseSwitchClauseSyntax): void;
        public visitDefaultSwitchClause(node: DefaultSwitchClauseSyntax): void;
        public visitBreakStatement(node: BreakStatementSyntax): void;
        public visitContinueStatement(node: ContinueStatementSyntax): void;
        public visitForStatement(node: ForStatementSyntax): void;
        public visitForInStatement(node: ForInStatementSyntax): void;
        public visitWhileStatement(node: WhileStatementSyntax): void;
        public visitWithStatement(node: WithStatementSyntax): void;
        public visitEnumDeclaration(node: EnumDeclarationSyntax): void;
        public visitEnumElement(node: EnumElementSyntax): void;
        public visitCastExpression(node: CastExpressionSyntax): void;
        public visitObjectLiteralExpression(node: ObjectLiteralExpressionSyntax): void;
        public visitSimplePropertyAssignment(node: SimplePropertyAssignmentSyntax): void;
        public visitFunctionPropertyAssignment(node: FunctionPropertyAssignmentSyntax): void;
        public visitGetAccessorPropertyAssignment(node: GetAccessorPropertyAssignmentSyntax): void;
        public visitSetAccessorPropertyAssignment(node: SetAccessorPropertyAssignmentSyntax): void;
        public visitFunctionExpression(node: FunctionExpressionSyntax): void;
        public visitEmptyStatement(node: EmptyStatementSyntax): void;
        public visitTryStatement(node: TryStatementSyntax): void;
        public visitCatchClause(node: CatchClauseSyntax): void;
        public visitFinallyClause(node: FinallyClauseSyntax): void;
        public visitLabeledStatement(node: LabeledStatementSyntax): void;
        public visitDoStatement(node: DoStatementSyntax): void;
        public visitTypeOfExpression(node: TypeOfExpressionSyntax): void;
        public visitDeleteExpression(node: DeleteExpressionSyntax): void;
        public visitVoidExpression(node: VoidExpressionSyntax): void;
        public visitDebuggerStatement(node: DebuggerStatementSyntax): void;
    }
}
declare module TypeScript {
    class PositionTrackingWalker extends SyntaxWalker {
        private _position;
        public visitToken(token: ISyntaxToken): void;
        public position(): number;
        public skip(element: ISyntaxElement): void;
    }
}
declare module TypeScript {
    interface ITokenInformation {
        previousToken: ISyntaxToken;
        nextToken: ISyntaxToken;
    }
    class SyntaxInformationMap extends SyntaxWalker {
        private trackParents;
        private trackPreviousToken;
        private tokenToInformation;
        private elementToPosition;
        private _previousToken;
        private _previousTokenInformation;
        private _currentPosition;
        private _elementToParent;
        private _parentStack;
        constructor(trackParents: boolean, trackPreviousToken: boolean);
        static create(node: SyntaxNode, trackParents: boolean, trackPreviousToken: boolean): SyntaxInformationMap;
        public visitNode(node: SyntaxNode): void;
        public visitToken(token: ISyntaxToken): void;
        public parent(element: ISyntaxElement): SyntaxNode;
        public fullStart(element: ISyntaxElement): number;
        public start(element: ISyntaxElement): number;
        public end(element: ISyntaxElement): number;
        public previousToken(token: ISyntaxToken): ISyntaxToken;
        public tokenInformation(token: ISyntaxToken): ITokenInformation;
        public firstTokenInLineContainingToken(token: ISyntaxToken): ISyntaxToken;
        public isFirstTokenInLine(token: ISyntaxToken): boolean;
        private isFirstTokenInLineWorker(information);
    }
}
declare module TypeScript {
    class SyntaxNodeInvariantsChecker extends SyntaxWalker {
        private tokenTable;
        static checkInvariants(node: SyntaxNode): void;
        public visitToken(token: ISyntaxToken): void;
    }
}
declare module TypeScript {
    class DepthLimitedWalker extends PositionTrackingWalker {
        private _depth;
        private _maximumDepth;
        constructor(maximumDepth: number);
        public visitNode(node: SyntaxNode): void;
    }
}
declare module TypeScript.Parser {
    function parse(fileName: string, text: ISimpleText, isDeclaration: boolean, languageVersion?: LanguageVersion, options?: ParseOptions): SyntaxTree;
    function incrementalParse(oldSyntaxTree: SyntaxTree, textChangeRange: TextChangeRange, newText: ISimpleText): SyntaxTree;
}
declare module TypeScript {
    class SyntaxTree {
        private _sourceUnit;
        private _isDeclaration;
        private _parserDiagnostics;
        private _allDiagnostics;
        private _fileName;
        private _lineMap;
        private _languageVersion;
        private _parseOptions;
        constructor(sourceUnit: SourceUnitSyntax, isDeclaration: boolean, diagnostics: Diagnostic[], fileName: string, lineMap: LineMap, languageVersion: LanguageVersion, parseOtions: ParseOptions);
        public toJSON(key);
        public sourceUnit(): SourceUnitSyntax;
        public isDeclaration(): boolean;
        private computeDiagnostics();
        public diagnostics(): Diagnostic[];
        public fileName(): string;
        public lineMap(): LineMap;
        public languageVersion(): LanguageVersion;
        public parseOptions(): ParseOptions;
        public structuralEquals(tree: SyntaxTree): boolean;
    }
}
declare module TypeScript {
}
declare module TypeScript {
    class Unicode {
        static unicodeES3IdentifierStart: number[];
        static unicodeES3IdentifierPart: number[];
        static unicodeES5IdentifierStart: number[];
        static unicodeES5IdentifierPart: number[];
        static lookupInUnicodeMap(code: number, map: number[]): boolean;
        static isIdentifierStart(code: number, languageVersion: LanguageVersion): boolean;
        static isIdentifierPart(code: number, languageVersion: LanguageVersion): boolean;
    }
}
declare module TypeScript {
    function hasFlag(val: number, flag: number): boolean;
    function withoutFlag(val: number, flag: number): number;
    enum ASTFlags {
        None,
        SingleLine,
        OptionalName,
        TypeReference,
        EnumInitializer,
    }
    enum DeclFlags {
        None,
        Exported,
        Private,
        Public,
        Ambient,
        Static,
    }
    enum ModuleFlags {
        None,
        Exported,
        Private,
        Public,
        Ambient,
        Static,
        IsEnum,
        IsWholeFile,
        IsDynamic,
    }
    enum VariableFlags {
        None,
        Exported,
        Private,
        Public,
        Ambient,
        Static,
        Property,
        ClassProperty,
        Constant,
    }
    enum FunctionFlags {
        None,
        Exported,
        Private,
        Public,
        Ambient,
        Static,
        GetAccessor,
        SetAccessor,
        Signature,
        Method,
        CallMember,
        ConstructMember,
        IsFatArrowFunction,
        IndexerMember,
        IsFunctionExpression,
    }
    function ToDeclFlags(functionFlags: FunctionFlags): DeclFlags;
    function ToDeclFlags(varFlags: VariableFlags): DeclFlags;
    function ToDeclFlags(moduleFlags: ModuleFlags): DeclFlags;
    enum TypeRelationshipFlags {
        SuccessfulComparison,
        RequiredPropertyIsMissing,
        IncompatibleSignatures,
        SourceSignatureHasTooManyParameters,
        IncompatibleReturnTypes,
        IncompatiblePropertyTypes,
        IncompatibleParameterTypes,
        InconsistantPropertyAccesibility,
    }
    enum ModuleGenTarget {
        Synchronous,
        Asynchronous,
    }
}
declare module TypeScript {
    enum NodeType {
        None,
        List,
        Script,
        TrueLiteral,
        FalseLiteral,
        StringLiteral,
        RegularExpressionLiteral,
        NumericLiteral,
        NullLiteral,
        TypeParameter,
        GenericType,
        TypeRef,
        FunctionDeclaration,
        ClassDeclaration,
        InterfaceDeclaration,
        ModuleDeclaration,
        ImportDeclaration,
        VariableDeclarator,
        VariableDeclaration,
        Parameter,
        Name,
        ArrayLiteralExpression,
        ObjectLiteralExpression,
        OmittedExpression,
        VoidExpression,
        CommaExpression,
        PlusExpression,
        NegateExpression,
        DeleteExpression,
        ThisExpression,
        SuperExpression,
        InExpression,
        MemberAccessExpression,
        InstanceOfExpression,
        TypeOfExpression,
        ElementAccessExpression,
        InvocationExpression,
        ObjectCreationExpression,
        AssignmentExpression,
        AddAssignmentExpression,
        SubtractAssignmentExpression,
        DivideAssignmentExpression,
        MultiplyAssignmentExpression,
        ModuloAssignmentExpression,
        AndAssignmentExpression,
        ExclusiveOrAssignmentExpression,
        OrAssignmentExpression,
        LeftShiftAssignmentExpression,
        SignedRightShiftAssignmentExpression,
        UnsignedRightShiftAssignmentExpression,
        ConditionalExpression,
        LogicalOrExpression,
        LogicalAndExpression,
        BitwiseOrExpression,
        BitwiseExclusiveOrExpression,
        BitwiseAndExpression,
        EqualsWithTypeConversionExpression,
        NotEqualsWithTypeConversionExpression,
        EqualsExpression,
        NotEqualsExpression,
        LessThanExpression,
        LessThanOrEqualExpression,
        GreaterThanExpression,
        GreaterThanOrEqualExpression,
        AddExpression,
        SubtractExpression,
        MultiplyExpression,
        DivideExpression,
        ModuloExpression,
        LeftShiftExpression,
        SignedRightShiftExpression,
        UnsignedRightShiftExpression,
        BitwiseNotExpression,
        LogicalNotExpression,
        PreIncrementExpression,
        PreDecrementExpression,
        PostIncrementExpression,
        PostDecrementExpression,
        CastExpression,
        ParenthesizedExpression,
        Member,
        Block,
        BreakStatement,
        ContinueStatement,
        DebuggerStatement,
        DoStatement,
        EmptyStatement,
        ExportAssignment,
        ExpressionStatement,
        ForInStatement,
        ForStatement,
        IfStatement,
        LabeledStatement,
        ReturnStatement,
        SwitchStatement,
        ThrowStatement,
        TryStatement,
        VariableStatement,
        WhileStatement,
        WithStatement,
        CaseClause,
        CatchClause,
        Comment,
    }
}
declare module TypeScript {
    class BlockIntrinsics {
        public prototype;
        public toString;
        public toLocaleString;
        public valueOf;
        public hasOwnProperty;
        public propertyIsEnumerable;
        public isPrototypeOf;
        constructor();
    }
    interface IHashTable {
        getAllKeys(): string[];
        add(key: string, data): boolean;
        addOrUpdate(key: string, data): boolean;
        map(fn: (k: string, value: any, context: any) => void, context: any): void;
        every(fn: (k: string, value: any, context: any) => void, context: any): boolean;
        some(fn: (k: string, value: any, context: any) => void, context: any): boolean;
        count(): number;
        lookup(key: string): any;
    }
    class StringHashTable implements IHashTable {
        public itemCount: number;
        public table: any;
        public getAllKeys(): string[];
        public add(key: string, data): boolean;
        public addOrUpdate(key: string, data): boolean;
        public map(fn: (k: string, value: any, context: any) => void, context: any): void;
        public every(fn: (k: string, value: any, context: any) => void, context: any): boolean;
        public some(fn: (k: string, value: any, context: any) => void, context: any): boolean;
        public count(): number;
        public lookup(key: string);
    }
}
declare module TypeScript {
    interface IASTSpan {
        minChar: number;
        limChar: number;
        trailingTriviaWidth: number;
    }
    class ASTSpan implements IASTSpan {
        public minChar: number;
        public limChar: number;
        public trailingTriviaWidth: number;
    }
    var astID: number;
    function structuralEqualsNotIncludingPosition(ast1: AST, ast2: AST): boolean;
    function structuralEqualsIncludingPosition(ast1: AST, ast2: AST): boolean;
    class AST implements IASTSpan {
        public nodeType: NodeType;
        public minChar: number;
        public limChar: number;
        public trailingTriviaWidth: number;
        private _flags;
        public typeCheckPhase: number;
        private astID;
        public passCreated: number;
        public preComments: Comment[];
        public postComments: Comment[];
        private docComments;
        constructor(nodeType: NodeType);
        public shouldEmit(): boolean;
        public isExpression(): boolean;
        public isStatementOrExpression(): boolean;
        public getFlags(): ASTFlags;
        public setFlags(flags: ASTFlags): void;
        public getLength(): number;
        public getID(): number;
        public isDeclaration(): boolean;
        public isStatement(): boolean;
        public emit(emitter: Emitter): void;
        public emitWorker(emitter: Emitter): void;
        public getDocComments(): Comment[];
        public structuralEquals(ast: AST, includingPosition: boolean): boolean;
    }
    class ASTList extends AST {
        public members: AST[];
        constructor();
        public append(ast: AST): ASTList;
        public emit(emitter: Emitter): void;
        public structuralEquals(ast: ASTList, includingPosition: boolean): boolean;
    }
    class Expression extends AST {
        constructor(nodeType: NodeType);
    }
    class Identifier extends Expression {
        public actualText: string;
        public text: string;
        constructor(actualText: string);
        public setText(actualText: string): void;
        public isMissing(): boolean;
        public emit(emitter: Emitter): void;
        public structuralEquals(ast: Identifier, includingPosition: boolean): boolean;
    }
    class MissingIdentifier extends Identifier {
        constructor();
        public isMissing(): boolean;
        public emit(emitter: Emitter): void;
    }
    class LiteralExpression extends Expression {
        constructor(nodeType: NodeType);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean;
    }
    class ThisExpression extends Expression {
        constructor();
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean;
    }
    class SuperExpression extends Expression {
        constructor();
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean;
    }
    class ParenthesizedExpression extends Expression {
        public expression: AST;
        constructor(expression: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean;
    }
    class UnaryExpression extends Expression {
        public operand: AST;
        public castTerm: AST;
        constructor(nodeType: NodeType, operand: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: UnaryExpression, includingPosition: boolean): boolean;
    }
    class CallExpression extends Expression {
        public target: AST;
        public typeArguments: ASTList;
        public arguments: ASTList;
        constructor(nodeType: NodeType, target: AST, typeArguments: ASTList, arguments: ASTList);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: CallExpression, includingPosition: boolean): boolean;
    }
    class BinaryExpression extends Expression {
        public operand1: AST;
        public operand2: AST;
        constructor(nodeType: NodeType, operand1: AST, operand2: AST);
        static getTextForBinaryToken(nodeType: NodeType): string;
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: BinaryExpression, includingPosition: boolean): boolean;
    }
    class ConditionalExpression extends Expression {
        public operand1: AST;
        public operand2: AST;
        public operand3: AST;
        constructor(operand1: AST, operand2: AST, operand3: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ConditionalExpression, includingPosition: boolean): boolean;
    }
    class NumberLiteral extends Expression {
        public value: number;
        public text: string;
        constructor(value: number, text: string);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: NumberLiteral, includingPosition: boolean): boolean;
    }
    class RegexLiteral extends Expression {
        public text: string;
        constructor(text: string);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: RegexLiteral, includingPosition: boolean): boolean;
    }
    class StringLiteral extends Expression {
        public actualText: string;
        public text: string;
        constructor(actualText: string, text: string);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: StringLiteral, includingPosition: boolean): boolean;
    }
    class ImportDeclaration extends AST {
        public id: Identifier;
        public alias: AST;
        public isDynamicImport: boolean;
        public isStatementOrExpression(): boolean;
        constructor(id: Identifier, alias: AST);
        public isDeclaration(): boolean;
        public emit(emitter: Emitter): void;
        public getAliasName(aliasAST?: AST): string;
        public firstAliasedModToString(): string;
        public structuralEquals(ast: ImportDeclaration, includingPosition: boolean): boolean;
    }
    class ExportAssignment extends AST {
        public id: Identifier;
        constructor(id: Identifier);
        public structuralEquals(ast: ExportAssignment, includingPosition: boolean): boolean;
    }
    class BoundDecl extends AST {
        public id: Identifier;
        public init: AST;
        public typeExpr: AST;
        private _varFlags;
        public isDeclaration(): boolean;
        public isStatementOrExpression(): boolean;
        constructor(id: Identifier, nodeType: NodeType);
        public getVarFlags(): VariableFlags;
        public setVarFlags(flags: VariableFlags): void;
        public isProperty(): boolean;
        public structuralEquals(ast: BoundDecl, includingPosition: boolean): boolean;
    }
    class VariableDeclarator extends BoundDecl {
        constructor(id: Identifier);
        public isExported(): boolean;
        public isStatic(): boolean;
        public emit(emitter: Emitter): void;
    }
    class Parameter extends BoundDecl {
        constructor(id: Identifier);
        public isOptional: boolean;
        public isOptionalArg();
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: Parameter, includingPosition: boolean): boolean;
    }
    class FunctionDeclaration extends AST {
        public name: Identifier;
        public block: Block;
        public isConstructor: boolean;
        public typeArguments: ASTList;
        public arguments: ASTList;
        public hint: string;
        private _functionFlags;
        public returnTypeAnnotation: AST;
        public variableArgList: boolean;
        public classDecl: NamedDeclaration;
        public returnStatementsWithExpressions: ReturnStatement[];
        public isDeclaration(): boolean;
        constructor(name: Identifier, block: Block, isConstructor: boolean, typeArguments: ASTList, arguments: ASTList, nodeType: number);
        public getFunctionFlags(): FunctionFlags;
        public setFunctionFlags(flags: FunctionFlags): void;
        public structuralEquals(ast: FunctionDeclaration, includingPosition: boolean): boolean;
        public shouldEmit(): boolean;
        public emit(emitter: Emitter): void;
        public getNameText(): string;
        public isMethod(): boolean;
        public isCallMember(): boolean;
        public isConstructMember(): boolean;
        public isIndexerMember(): boolean;
        public isSpecialFn(): boolean;
        public isAccessor(): boolean;
        public isGetAccessor(): boolean;
        public isSetAccessor(): boolean;
        public isStatic(): boolean;
        public isSignature(): boolean;
    }
    class Script extends AST {
        public moduleElements: ASTList;
        public referencedFiles: IFileReference[];
        public requiresExtendsBlock: boolean;
        public isDeclareFile: boolean;
        public topLevelMod: ModuleDeclaration;
        public containsUnicodeChar: boolean;
        public containsUnicodeCharInComment: boolean;
        constructor();
        public emit(emitter: Emitter): void;
        public structuralEquals(ast: Script, includingPosition: boolean): boolean;
    }
    class NamedDeclaration extends AST {
        public name: Identifier;
        public members: ASTList;
        public isDeclaration(): boolean;
        constructor(nodeType: NodeType, name: Identifier, members: ASTList);
        public structuralEquals(ast: NamedDeclaration, includingPosition: boolean): boolean;
    }
    class ModuleDeclaration extends NamedDeclaration {
        public endingToken: ASTSpan;
        private _moduleFlags;
        public prettyName: string;
        public amdDependencies: string[];
        public containsUnicodeChar: boolean;
        public containsUnicodeCharInComment: boolean;
        constructor(name: Identifier, members: ASTList, endingToken: ASTSpan);
        public getModuleFlags(): ModuleFlags;
        public setModuleFlags(flags: ModuleFlags): void;
        public structuralEquals(ast: ModuleDeclaration, includePosition: boolean): boolean;
        public isEnum(): boolean;
        public isWholeFile(): boolean;
        public shouldEmit(): boolean;
        public emit(emitter: Emitter): void;
    }
    class TypeDeclaration extends NamedDeclaration {
        public typeParameters: ASTList;
        public extendsList: ASTList;
        public implementsList: ASTList;
        private _varFlags;
        constructor(nodeType: NodeType, name: Identifier, typeParameters: ASTList, extendsList: ASTList, implementsList: ASTList, members: ASTList);
        public getVarFlags(): VariableFlags;
        public setVarFlags(flags: VariableFlags): void;
        public structuralEquals(ast: TypeDeclaration, includingPosition: boolean): boolean;
    }
    class ClassDeclaration extends TypeDeclaration {
        public constructorDecl: FunctionDeclaration;
        public endingToken: ASTSpan;
        constructor(name: Identifier, typeParameters: ASTList, members: ASTList, extendsList: ASTList, implementsList: ASTList);
        public shouldEmit(): boolean;
        public emit(emitter: Emitter): void;
    }
    class InterfaceDeclaration extends TypeDeclaration {
        constructor(name: Identifier, typeParameters: ASTList, members: ASTList, extendsList: ASTList, implementsList: ASTList);
        public shouldEmit(): boolean;
    }
    class Statement extends AST {
        constructor(nodeType: NodeType);
        public isStatement(): boolean;
        public isStatementOrExpression(): boolean;
    }
    class ThrowStatement extends Statement {
        public expression: Expression;
        constructor(expression: Expression);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ThrowStatement, includingPosition: boolean): boolean;
    }
    class ExpressionStatement extends Statement {
        public expression: AST;
        constructor(expression: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ExpressionStatement, includingPosition: boolean): boolean;
    }
    class LabeledStatement extends Statement {
        public identifier: Identifier;
        public statement: AST;
        constructor(identifier: Identifier, statement: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: LabeledStatement, includingPosition: boolean): boolean;
    }
    class VariableDeclaration extends AST {
        public declarators: ASTList;
        constructor(declarators: ASTList);
        public emit(emitter: Emitter): void;
        public structuralEquals(ast: VariableDeclaration, includingPosition: boolean): boolean;
    }
    class VariableStatement extends Statement {
        public declaration: VariableDeclaration;
        constructor(declaration: VariableDeclaration);
        public shouldEmit(): boolean;
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: VariableStatement, includingPosition: boolean): boolean;
    }
    class Block extends Statement {
        public statements: ASTList;
        public closeBraceSpan: IASTSpan;
        constructor(statements: ASTList);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: Block, includingPosition: boolean): boolean;
    }
    class Jump extends Statement {
        public target: string;
        public hasExplicitTarget(): string;
        public resolvedTarget: Statement;
        constructor(nodeType: NodeType);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: Jump, includingPosition: boolean): boolean;
    }
    class WhileStatement extends Statement {
        public cond: AST;
        public body: AST;
        constructor(cond: AST, body: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: WhileStatement, includingPosition: boolean): boolean;
    }
    class DoStatement extends Statement {
        public body: AST;
        public cond: AST;
        public whileSpan: ASTSpan;
        constructor(body: AST, cond: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: DoStatement, includingPosition: boolean): boolean;
    }
    class IfStatement extends Statement {
        public cond: AST;
        public thenBod: AST;
        public elseBod: AST;
        public statement: ASTSpan;
        constructor(cond: AST, thenBod: AST, elseBod: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: IfStatement, includingPosition: boolean): boolean;
    }
    class ReturnStatement extends Statement {
        public returnExpression: AST;
        constructor(returnExpression: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ReturnStatement, includingPosition: boolean): boolean;
    }
    class ForInStatement extends Statement {
        public lval: AST;
        public obj: AST;
        public body: AST;
        constructor(lval: AST, obj: AST, body: AST);
        public statement: ASTSpan;
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ForInStatement, includingPosition: boolean): boolean;
    }
    class ForStatement extends Statement {
        public init: AST;
        public cond: AST;
        public incr: AST;
        public body: AST;
        constructor(init: AST, cond: AST, incr: AST, body: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: ForStatement, includingPosition: boolean): boolean;
    }
    class WithStatement extends Statement {
        public expr: AST;
        public body: AST;
        constructor(expr: AST, body: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: WithStatement, includingPosition: boolean): boolean;
    }
    class SwitchStatement extends Statement {
        public val: AST;
        public caseList: ASTList;
        public defaultCase: CaseClause;
        public statement: ASTSpan;
        constructor(val: AST);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: SwitchStatement, includingPosition: boolean): boolean;
    }
    class CaseClause extends AST {
        public expr: AST;
        public body: ASTList;
        public colonSpan: ASTSpan;
        constructor();
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: CaseClause, includingPosition: boolean): boolean;
    }
    class TypeParameter extends AST {
        public name: Identifier;
        public constraint: AST;
        constructor(name: Identifier, constraint: AST);
        public structuralEquals(ast: TypeParameter, includingPosition: boolean): boolean;
    }
    class GenericType extends AST {
        public name: AST;
        public typeArguments: ASTList;
        constructor(name: AST, typeArguments: ASTList);
        public emit(emitter: Emitter): void;
        public structuralEquals(ast: GenericType, includingPosition: boolean): boolean;
    }
    class TypeReference extends AST {
        public term: AST;
        public arrayCount: number;
        constructor(term: AST, arrayCount: number);
        public emit(emitter: Emitter): void;
        public structuralEquals(ast: TypeReference, includingPosition: boolean): boolean;
    }
    class TryStatement extends Statement {
        public tryBody: Block;
        public catchClause: CatchClause;
        public finallyBody: Block;
        constructor(tryBody: Block, catchClause: CatchClause, finallyBody: Block);
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: TryStatement, includingPosition: boolean): boolean;
    }
    class CatchClause extends AST {
        public param: VariableDeclarator;
        public body: Block;
        constructor(param: VariableDeclarator, body: Block);
        public statement: ASTSpan;
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: CatchClause, includingPosition: boolean): boolean;
    }
    class DebuggerStatement extends Statement {
        constructor();
        public emitWorker(emitter: Emitter): void;
    }
    class OmittedExpression extends Expression {
        constructor();
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: CatchClause, includingPosition: boolean): boolean;
    }
    class EmptyStatement extends Statement {
        constructor();
        public emitWorker(emitter: Emitter): void;
        public structuralEquals(ast: CatchClause, includingPosition: boolean): boolean;
    }
    class Comment extends AST {
        public content: string;
        public isBlockComment: boolean;
        public endsLine;
        public text: string[];
        public minLine: number;
        public limLine: number;
        private docCommentText;
        constructor(content: string, isBlockComment: boolean, endsLine);
        public structuralEquals(ast: Comment, includingPosition: boolean): boolean;
        public getText(): string[];
        public isDocComment(): boolean;
        public getDocCommentTextValue(): string;
        static consumeLeadingSpace(line: string, startIndex: number, maxSpacesToRemove?: number): number;
        static isSpaceChar(line: string, index: number): boolean;
        static cleanDocCommentLine(line: string, jsDocStyleComment: boolean, jsDocLineSpaceToRemove?: number): {
            minChar: number;
            limChar: number;
            jsDocSpacesRemoved: number;
        };
        static cleanJSDocComment(content: string, spacesToRemove?: number): string;
        static getDocCommentText(comments: Comment[]): string;
        static getParameterDocCommentText(param: string, fncDocComments: Comment[]): string;
    }
}
declare module TypeScript {
    interface IAstWalker {
        walk(ast: AST, parent: AST): AST;
        options: AstWalkOptions;
        state: any;
    }
    class AstWalkOptions {
        public goChildren: boolean;
    }
    interface IAstWalkCallback {
        (ast: AST, parent: AST, walker: IAstWalker): AST;
    }
    interface IAstWalkChildren {
        (preAst: AST, parent: AST, walker: IAstWalker): void;
    }
    class AstWalkerFactory {
        private childrenWalkers;
        constructor();
        public walk(ast: AST, pre: IAstWalkCallback, post?: IAstWalkCallback, options?: AstWalkOptions, state?: any): AST;
        public getWalker(pre: IAstWalkCallback, post?: IAstWalkCallback, options?: AstWalkOptions, state?: any): IAstWalker;
        private getSlowWalker(pre, post?, options?, state?);
        private initChildrenWalkers();
    }
    function getAstWalkerFactory(): AstWalkerFactory;
}
declare module TypeScript.AstWalkerWithDetailCallback {
    interface AstWalkerDetailCallback {
        EmptyCallback? (pre, ast: TypeScript.AST): boolean;
        EmptyExprCallback? (pre, ast: TypeScript.AST): boolean;
        TrueCallback? (pre, ast: TypeScript.AST): boolean;
        FalseCallback? (pre, ast: TypeScript.AST): boolean;
        ThisCallback? (pre, ast: TypeScript.AST): boolean;
        SuperCallback? (pre, ast: TypeScript.AST): boolean;
        QStringCallback? (pre, ast: TypeScript.AST): boolean;
        RegexCallback? (pre, ast: TypeScript.AST): boolean;
        NullCallback? (pre, ast: TypeScript.AST): boolean;
        ArrayLitCallback? (pre, ast: TypeScript.AST): boolean;
        ObjectLitCallback? (pre, ast: TypeScript.AST): boolean;
        VoidCallback? (pre, ast: TypeScript.AST): boolean;
        CommaCallback? (pre, ast: TypeScript.AST): boolean;
        PosCallback? (pre, ast: TypeScript.AST): boolean;
        NegCallback? (pre, ast: TypeScript.AST): boolean;
        DeleteCallback? (pre, ast: TypeScript.AST): boolean;
        AwaitCallback? (pre, ast: TypeScript.AST): boolean;
        InCallback? (pre, ast: TypeScript.AST): boolean;
        DotCallback? (pre, ast: TypeScript.AST): boolean;
        FromCallback? (pre, ast: TypeScript.AST): boolean;
        IsCallback? (pre, ast: TypeScript.AST): boolean;
        InstOfCallback? (pre, ast: TypeScript.AST): boolean;
        TypeofCallback? (pre, ast: TypeScript.AST): boolean;
        NumberLitCallback? (pre, ast: TypeScript.AST): boolean;
        NameCallback? (pre, identifierAst: TypeScript.Identifier): boolean;
        TypeRefCallback? (pre, ast: TypeScript.AST): boolean;
        IndexCallback? (pre, ast: TypeScript.AST): boolean;
        CallCallback? (pre, ast: TypeScript.AST): boolean;
        NewCallback? (pre, ast: TypeScript.AST): boolean;
        AsgCallback? (pre, ast: TypeScript.AST): boolean;
        AsgAddCallback? (pre, ast: TypeScript.AST): boolean;
        AsgSubCallback? (pre, ast: TypeScript.AST): boolean;
        AsgDivCallback? (pre, ast: TypeScript.AST): boolean;
        AsgMulCallback? (pre, ast: TypeScript.AST): boolean;
        AsgModCallback? (pre, ast: TypeScript.AST): boolean;
        AsgAndCallback? (pre, ast: TypeScript.AST): boolean;
        AsgXorCallback? (pre, ast: TypeScript.AST): boolean;
        AsgOrCallback? (pre, ast: TypeScript.AST): boolean;
        AsgLshCallback? (pre, ast: TypeScript.AST): boolean;
        AsgRshCallback? (pre, ast: TypeScript.AST): boolean;
        AsgRs2Callback? (pre, ast: TypeScript.AST): boolean;
        QMarkCallback? (pre, ast: TypeScript.AST): boolean;
        LogOrCallback? (pre, ast: TypeScript.AST): boolean;
        LogAndCallback? (pre, ast: TypeScript.AST): boolean;
        OrCallback? (pre, ast: TypeScript.AST): boolean;
        XorCallback? (pre, ast: TypeScript.AST): boolean;
        AndCallback? (pre, ast: TypeScript.AST): boolean;
        EqCallback? (pre, ast: TypeScript.AST): boolean;
        NeCallback? (pre, ast: TypeScript.AST): boolean;
        EqvCallback? (pre, ast: TypeScript.AST): boolean;
        NEqvCallback? (pre, ast: TypeScript.AST): boolean;
        LtCallback? (pre, ast: TypeScript.AST): boolean;
        LeCallback? (pre, ast: TypeScript.AST): boolean;
        GtCallback? (pre, ast: TypeScript.AST): boolean;
        GeCallback? (pre, ast: TypeScript.AST): boolean;
        AddCallback? (pre, ast: TypeScript.AST): boolean;
        SubCallback? (pre, ast: TypeScript.AST): boolean;
        MulCallback? (pre, ast: TypeScript.AST): boolean;
        DivCallback? (pre, ast: TypeScript.AST): boolean;
        ModCallback? (pre, ast: TypeScript.AST): boolean;
        LshCallback? (pre, ast: TypeScript.AST): boolean;
        RshCallback? (pre, ast: TypeScript.AST): boolean;
        Rs2Callback? (pre, ast: TypeScript.AST): boolean;
        NotCallback? (pre, ast: TypeScript.AST): boolean;
        LogNotCallback? (pre, ast: TypeScript.AST): boolean;
        IncPreCallback? (pre, ast: TypeScript.AST): boolean;
        DecPreCallback? (pre, ast: TypeScript.AST): boolean;
        IncPostCallback? (pre, ast: TypeScript.AST): boolean;
        DecPostCallback? (pre, ast: TypeScript.AST): boolean;
        TypeAssertionCallback? (pre, ast: TypeScript.AST): boolean;
        FunctionDeclarationCallback? (pre, funcDecl: TypeScript.FunctionDeclaration): boolean;
        MemberCallback? (pre, ast: TypeScript.AST): boolean;
        VariableDeclaratorCallback? (pre, varDecl: TypeScript.VariableDeclarator): boolean;
        VariableDeclarationCallback? (pre, varDecl: TypeScript.VariableDeclaration): boolean;
        ArgDeclCallback? (pre, ast: TypeScript.AST): boolean;
        ReturnCallback? (pre, ast: TypeScript.AST): boolean;
        BreakCallback? (pre, ast: TypeScript.AST): boolean;
        ContinueCallback? (pre, ast: TypeScript.AST): boolean;
        ThrowCallback? (pre, ast: TypeScript.AST): boolean;
        ForCallback? (pre, ast: TypeScript.AST): boolean;
        ForInCallback? (pre, ast: TypeScript.AST): boolean;
        IfCallback? (pre, ast: TypeScript.AST): boolean;
        WhileCallback? (pre, ast: TypeScript.AST): boolean;
        DoCallback? (pre, ast: TypeScript.AST): boolean;
        BlockCallback? (pre, block: TypeScript.Block): boolean;
        CaseCallback? (pre, ast: TypeScript.AST): boolean;
        SwitchCallback? (pre, ast: TypeScript.AST): boolean;
        TryCallback? (pre, ast: TypeScript.AST): boolean;
        TryCatchCallback? (pre, ast: TypeScript.AST): boolean;
        TryFinallyCallback? (pre, ast: TypeScript.AST): boolean;
        FinallyCallback? (pre, ast: TypeScript.AST): boolean;
        CatchCallback? (pre, ast: TypeScript.AST): boolean;
        ListCallback? (pre, astList: TypeScript.ASTList): boolean;
        ScriptCallback? (pre, script: TypeScript.Script): boolean;
        ClassDeclarationCallback? (pre, ast: TypeScript.AST): boolean;
        InterfaceDeclarationCallback? (pre, interfaceDecl: TypeScript.InterfaceDeclaration): boolean;
        ModuleDeclarationCallback? (pre, moduleDecl: TypeScript.ModuleDeclaration): boolean;
        ImportDeclarationCallback? (pre, ast: TypeScript.AST): boolean;
        ExportAssignmentCallback? (pre, ast: TypeScript.AST): boolean;
        WithCallback? (pre, ast: TypeScript.AST): boolean;
        LabelCallback? (pre, labelAST: TypeScript.AST): boolean;
        LabeledStatementCallback? (pre, ast: TypeScript.AST): boolean;
        VariableStatementCallback? (pre, ast: TypeScript.AST): boolean;
        ErrorCallback? (pre, ast: TypeScript.AST): boolean;
        CommentCallback? (pre, ast: TypeScript.AST): boolean;
        DebuggerCallback? (pre, ast: TypeScript.AST): boolean;
        DefaultCallback? (pre, ast: TypeScript.AST): boolean;
    }
    function walk(script: Script, callback: AstWalkerDetailCallback): void;
}
declare module TypeScript {
    function max(a: number, b: number): number;
    function min(a: number, b: number): number;
    class AstPath {
        public asts: AST[];
        public top: number;
        static reverseIndexOf(items: any[], index: number): any;
        public clone(): AstPath;
        public pop(): AST;
        public push(ast: AST): void;
        public up(): void;
        public down(): void;
        public nodeType(): NodeType;
        public ast(): AST;
        public parent(): AST;
        public count(): number;
        public get(index: number): AST;
        public isNameOfClass(): boolean;
        public isNameOfInterface(): boolean;
        public isNameOfArgument(): boolean;
        public isNameOfVariable(): boolean;
        public isNameOfModule(): boolean;
        public isNameOfFunction(): boolean;
        public isBodyOfFunction(): boolean;
        public isArgumentListOfFunction(): boolean;
        public isTargetOfCall(): boolean;
        public isTargetOfNew(): boolean;
        public isInClassImplementsList(): boolean;
        public isInInterfaceExtendsList(): boolean;
        public isMemberOfMemberAccessExpression(): boolean;
        public isCallExpression(): boolean;
        public isCallExpressionTarget(): boolean;
        public isDeclaration(): boolean;
        private isMemberOfList(list, item);
    }
    function isValidAstNode(ast: IASTSpan): boolean;
    class AstPathContext {
        public path: AstPath;
    }
    enum GetAstPathOptions {
        Default,
        EdgeInclusive,
        DontPruneSearchBasedOnPosition,
    }
    function getAstPathToPosition(script: AST, pos: number, useTrailingTriviaAsLimChar?: boolean, options?: GetAstPathOptions): AstPath;
    function walkAST(ast: AST, callback: (path: AstPath, walker: IAstWalker) => void): void;
}
declare module TypeScript {
    class Base64VLQFormat {
        static encode(inValue: number): string;
        static decode(inString: string): {
            value: number;
            rest: string;
        };
    }
}
declare module TypeScript {
    class SourceMapPosition {
        public sourceLine: number;
        public sourceColumn: number;
        public emittedLine: number;
        public emittedColumn: number;
    }
    class SourceMapping {
        public start: SourceMapPosition;
        public end: SourceMapPosition;
        public nameIndex: number;
        public childMappings: SourceMapping[];
    }
    class SourceMapper {
        public sourceMapFileName: string;
        public jsFile: ITextWriter;
        public sourceMapOut: ITextWriter;
        static MapFileExtension: string;
        public sourceMappings: SourceMapping[];
        public currentMappings: SourceMapping[][];
        public names: string[];
        public currentNameIndex: number[];
        public jsFileName: string;
        public tsFileName: string;
        constructor(tsFileName: string, jsFileName: string, sourceMapFileName: string, jsFile: ITextWriter, sourceMapOut: ITextWriter, emitFullPathOfSourceMap: boolean);
        static emitSourceMapping(allSourceMappers: SourceMapper[]): void;
    }
}
declare module TypeScript {
    enum EmitContainer {
        Prog,
        Module,
        DynamicModule,
        Class,
        Constructor,
        Function,
        Args,
        Interface,
    }
    class EmitState {
        public column: number;
        public line: number;
        public container: EmitContainer;
        constructor();
    }
    class EmitOptions {
        public compilationSettings: CompilationSettings;
        public ioHost: EmitterIOHost;
        public outputMany: boolean;
        public commonDirectoryPath: string;
        constructor(compilationSettings: CompilationSettings);
        public mapOutputFileName(fileName: string, extensionChanger: (fname: string, wholeFileNameReplaced: boolean) => string): string;
    }
    class Indenter {
        static indentStep: number;
        static indentStepString: string;
        static indentStrings: string[];
        public indentAmt: number;
        public increaseIndent(): void;
        public decreaseIndent(): void;
        public getIndent(): string;
    }
    interface BoundDeclInfo {
        boundDecl: BoundDecl;
        pullDecl: PullDecl;
    }
    class Emitter {
        public emittingFileName: string;
        public outfile: ITextWriter;
        public emitOptions: EmitOptions;
        private semanticInfoChain;
        public globalThisCapturePrologueEmitted: boolean;
        public extendsPrologueEmitted: boolean;
        public thisClassNode: ClassDeclaration;
        public thisFunctionDeclaration: FunctionDeclaration;
        public moduleName: string;
        public emitState: EmitState;
        public indenter: Indenter;
        public modAliasId: string;
        public firstModAlias: string;
        public allSourceMappers: SourceMapper[];
        public sourceMapper: SourceMapper;
        public captureThisStmtString: string;
        public varListCountStack: number[];
        private pullTypeChecker;
        private declStack;
        private resolvingContext;
        public document: Document;
        constructor(emittingFileName: string, outfile: ITextWriter, emitOptions: EmitOptions, semanticInfoChain: SemanticInfoChain);
        private pushDecl(decl);
        private popDecl(decl);
        private getEnclosingDecl();
        private setTypeCheckerUnit(fileName);
        public setDocument(document: Document): void;
        public importStatementShouldBeEmitted(importDeclAST: ImportDeclaration, unitPath?: string): boolean;
        public setSourceMappings(mapper: SourceMapper): void;
        public writeToOutput(s: string): void;
        public writeToOutputTrimmable(s: string): void;
        public writeLineToOutput(s: string): void;
        public writeCaptureThisStatement(ast: AST): void;
        public setInVarBlock(count: number): void;
        public setContainer(c: number): number;
        private getIndentString();
        public emitIndent(): void;
        public emitCommentInPlace(comment: Comment): void;
        public emitComments(ast: AST, pre: boolean): void;
        public emitObjectLiteral(objectLiteral: UnaryExpression): void;
        public emitArrayLiteral(arrayLiteral: UnaryExpression): void;
        public emitNew(target: AST, args: ASTList): void;
        public getVarDeclFromIdentifier(boundDeclInfo: BoundDeclInfo): BoundDeclInfo;
        private getConstantValue(boundDeclInfo);
        public getConstantDecl(dotExpr: BinaryExpression): BoundDeclInfo;
        public tryEmitConstant(dotExpr: BinaryExpression): boolean;
        public emitCall(callNode: CallExpression, target: AST, args: ASTList): void;
        public emitInnerFunction(funcDecl: FunctionDeclaration, printName: boolean, includePreComments?: boolean): void;
        private emitDefaultValueAssignments(funcDecl);
        private emitRestParameterInitializer(funcDecl);
        public getModuleImportAndDependencyList(moduleDecl: ModuleDeclaration): {
            importList: string;
            dependencyList: string;
        };
        public shouldCaptureThis(ast: AST): boolean;
        public emitModule(moduleDecl: ModuleDeclaration): void;
        public emitIndex(operand1: AST, operand2: AST): void;
        public emitFunction(funcDecl: FunctionDeclaration): void;
        public emitAmbientVarDecl(varDecl: VariableDeclarator): void;
        public varListCount(): number;
        public emitVarDeclVar(): boolean;
        public onEmitVar(): void;
        public emitVariableDeclaration(declaration: VariableDeclaration): void;
        public emitVariableDeclarator(varDecl: VariableDeclarator): void;
        private symbolIsUsedInItsEnclosingContainer(symbol, dynamic?);
        public emitName(name: Identifier, addThis: boolean): void;
        public recordSourceMappingNameStart(name: string): void;
        public recordSourceMappingNameEnd(): void;
        public recordSourceMappingStart(ast: IASTSpan): void;
        public recordSourceMappingEnd(ast: IASTSpan): void;
        public emitSourceMapsAndClose(): void;
        private emitParameterPropertyAndMemberVariableAssignments();
        public emitCommaSeparatedList(list: ASTList, startLine?: boolean): void;
        public emitModuleElements(list: ASTList): void;
        private isDirectivePrologueElement(node);
        public emitSpaceBetweenConstructs(node1: AST, node2: AST): void;
        public emitScriptElements(script: Script, requiresExtendsBlock: boolean): void;
        public emitConstructorStatements(funcDecl: FunctionDeclaration): void;
        public emitJavascript(ast: AST, startLine: boolean): void;
        public emitPropertyAccessor(funcDecl: FunctionDeclaration, className: string, isProto: boolean): void;
        public emitPrototypeMember(funcDecl: FunctionDeclaration, className: string): void;
        public emitClass(classDecl: ClassDeclaration): void;
        private emitClassMembers(classDecl);
        public emitPrologue(script: Script, requiresExtendsBlock: boolean): void;
        public emitSuperReference(): void;
        public emitSuperCall(callEx: CallExpression): boolean;
        public emitThis(): void;
        public emitBlockOrStatement(node: AST): void;
        static throwEmitterError(e: Error): void;
        static handleEmitterError(fileName: string, e: Error): IDiagnostic[];
        private createFile(fileName, useUTF8);
    }
}
declare module TypeScript {
    class MemberName {
        public prefix: string;
        public suffix: string;
        public isString(): boolean;
        public isArray(): boolean;
        public isMarker(): boolean;
        public toString(): string;
        static memberNameToString(memberName: MemberName, markerInfo?: number[]): string;
        static create(text: string): MemberName;
        static create(entry: MemberName, prefix: string, suffix: string): MemberName;
    }
    class MemberNameString extends MemberName {
        public text: string;
        constructor(text: string);
        public isString(): boolean;
    }
    class MemberNameArray extends MemberName {
        public delim: string;
        public entries: MemberName[];
        public isArray(): boolean;
        public add(entry: MemberName): void;
        public addAll(entries: MemberName[]): void;
        constructor();
    }
}
declare module TypeScript {
    function stripQuotes(str: string): string;
    function isSingleQuoted(str: string): boolean;
    function isQuoted(str: string): boolean;
    function quoteStr(str: string): string;
    function swapQuotes(str: string): string;
    function switchToForwardSlashes(path: string): string;
    function trimModName(modName: string): string;
    function getDeclareFilePath(fname: string): string;
    function isJSFile(fname: string): boolean;
    function isTSFile(fname: string): boolean;
    function isDTSFile(fname: string): boolean;
    function getPrettyName(modPath: string, quote?: boolean, treatAsFileName?: boolean);
    function getPathComponents(path: string): string[];
    function getRelativePathToFixedPath(fixedModFilePath: string, absoluteModPath: string): string;
    function quoteBaseName(modPath: string): string;
    function changePathToDTS(modPath: string): string;
    function isRelative(path: string): boolean;
    function isRooted(path: string): boolean;
    function getRootFilePath(outFname: string): string;
    function filePathComponents(fullPath: string): string[];
    function filePath(fullPath: string): string;
    function normalizePath(path: string): string;
}
declare module TypeScript {
    interface IResolvedFile {
        content: string;
        path: string;
    }
    class SourceUnit implements IScriptSnapshot, IResolvedFile {
        public path: string;
        public content: string;
        public referencedFiles: IFileReference[];
        private lineStarts;
        constructor(path: string, content: string);
        public getText(start: number, end: number): string;
        public getLength(): number;
        public getLineStartPositions(): number[];
        public getTextChangeRangeSinceVersion(scriptVersion: number): TextChangeRange;
    }
    interface IFileReference extends ILineAndCharacter {
        path: string;
        isResident: boolean;
        position: number;
        length: number;
    }
    interface IFileSystemObject {
        resolvePath(path: string): string;
        readFile(path: string): string;
        findFile(rootPath: string, partialFilePath: string): IResolvedFile;
        dirName(path: string): string;
    }
    class CompilationEnvironment {
        public compilationSettings: CompilationSettings;
        public ioHost: IFileSystemObject;
        constructor(compilationSettings: CompilationSettings, ioHost: IFileSystemObject);
        public code: SourceUnit[];
        public inputFileNameToOutputFileName: StringHashTable;
        public getSourceUnit(path: string): SourceUnit;
    }
    interface IResolutionDispatcher {
        errorReporter: IDignosticsReporter;
        postResolution(path: string, source: IScriptSnapshot): void;
    }
    interface ICodeResolver {
        resolveCode(referencePath: string, rootPath: string, performSearch: boolean, state: IResolutionDispatcher): void;
    }
    interface IResolverHost {
        resolveCompilationEnvironment(preEnvironment: CompilationEnvironment, resolver: ICodeResolver, traceDependencies: boolean): CompilationEnvironment;
    }
    class CodeResolver implements ICodeResolver {
        public environment: CompilationEnvironment;
        public visited: any;
        constructor(environment: CompilationEnvironment);
        public resolveCode(referencePath: string, parentPath: string, performSearch: boolean, resolutionDispatcher: IResolutionDispatcher): boolean;
    }
}
declare module TypeScript {
    class CompilationSettings {
        public propagateConstants: boolean;
        public minWhitespace: boolean;
        public emitComments: boolean;
        public watch: boolean;
        public exec: boolean;
        public resolve: boolean;
        public disallowBool: boolean;
        public useDefaultLib: boolean;
        public codeGenTarget: LanguageVersion;
        public moduleGenTarget: ModuleGenTarget;
        public outputOption: string;
        public mapSourceFiles: boolean;
        public emitFullSourceMapPath: boolean;
        public generateDeclarationFiles: boolean;
        public useCaseSensitiveFileResolution: boolean;
        public gatherDiagnostics: boolean;
        public updateTC: boolean;
    }
    interface IPreProcessedFileInfo {
        settings: CompilationSettings;
        referencedFiles: IFileReference[];
        importedFiles: IFileReference[];
        isLibFile: boolean;
    }
    function getImplicitImport(comment: string): boolean;
    function getReferencedFiles(fileName: string, sourceText: IScriptSnapshot): IFileReference[];
    function preProcessFile(fileName: string, sourceText: IScriptSnapshot, settings?: CompilationSettings, readImportFiles?: boolean): IPreProcessedFileInfo;
}
declare module TypeScript {
    class DeclFileWriter {
        private declFile;
        public onNewLine: boolean;
        constructor(declFile: ITextWriter);
        public Write(s: string): void;
        public WriteLine(s: string): void;
        public Close(): void;
    }
    class DeclarationEmitter implements AstWalkerWithDetailCallback.AstWalkerDetailCallback {
        private emittingFileName;
        private semanticInfoChain;
        public emitOptions: EmitOptions;
        public fileName: string;
        private declFile;
        private indenter;
        private declarationContainerStack;
        private isDottedModuleName;
        private dottedModuleEmit;
        private ignoreCallbackAst;
        private singleDeclFile;
        private varListCount;
        constructor(emittingFileName: string, isUTF8: boolean, semanticInfoChain: SemanticInfoChain, emitOptions: EmitOptions);
        public widenType(type: PullTypeSymbol): PullTypeSymbol;
        public close(): void;
        private createFile(fileName, useUTF8);
        public emitDeclarations(script: Script): void;
        public getAstDeclarationContainer(): AST;
        private emitDottedModuleName();
        private getIndentString(declIndent?);
        private emitIndent();
        private canEmitSignature(declFlags, canEmitGlobalAmbientDecl?, useDeclarationContainerTop?);
        private canEmitPrePostAstSignature(declFlags, astWithPrePostCallback, preCallback);
        private getDeclFlagsString(declFlags, typeString);
        private emitDeclFlags(declFlags, typeString);
        private canEmitTypeAnnotationSignature(declFlag?);
        private pushDeclarationContainer(ast);
        private popDeclarationContainer(ast);
        public emitTypeNamesMember(memberName: MemberName, emitIndent?: boolean): void;
        private emitTypeSignature(type);
        private emitComment(comment);
        private emitDeclarationComments(ast, endLine?);
        public writeDeclarationComments(declComments: Comment[], endLine?: boolean): void;
        public emitTypeOfBoundDecl(boundDecl: BoundDecl): void;
        public VariableDeclaratorCallback(pre: boolean, varDecl: VariableDeclarator): boolean;
        public BlockCallback(pre: boolean, block: Block): boolean;
        public VariableStatementCallback(pre: boolean, variableDeclaration: VariableDeclaration): boolean;
        public VariableDeclarationCallback(pre: boolean, variableDeclaration: VariableDeclaration): boolean;
        private emitArgDecl(argDecl, funcDecl);
        public isOverloadedCallSignature(funcDecl: FunctionDeclaration): boolean;
        public FunctionDeclarationCallback(pre: boolean, funcDecl: FunctionDeclaration): boolean;
        public emitBaseExpression(bases: ASTList, index: number): void;
        private emitBaseList(typeDecl, useExtendsList);
        private emitAccessorDeclarationComments(funcDecl);
        public emitPropertyAccessorSignature(funcDecl: FunctionDeclaration): boolean;
        private emitClassMembersFromConstructorDefinition(funcDecl);
        public ClassDeclarationCallback(pre: boolean, classDecl: ClassDeclaration): boolean;
        private emitTypeParameters(typeParams, funcSignature?);
        public InterfaceDeclarationCallback(pre: boolean, interfaceDecl: InterfaceDeclaration): boolean;
        public ImportDeclarationCallback(pre: boolean, importDecl: ImportDeclaration): boolean;
        private emitEnumSignature(moduleDecl);
        public ModuleDeclarationCallback(pre: boolean, moduleDecl: ModuleDeclaration): boolean;
        public ScriptCallback(pre: boolean, script: Script): boolean;
        public DefaultCallback(pre: boolean, ast: AST): boolean;
    }
}
declare module TypeScript {
    class DataMap {
        public map: any;
        public link(id: string, data: any): void;
        public unlink(id: string): void;
        public read(id: string);
        public flush(): void;
        public unpatch();
    }
    class PatchedDataMap extends DataMap {
        public parent: DataMap;
        public diffs: any;
        constructor(parent: DataMap);
        public link(id: string, data: any): void;
        public unlink(id: string): void;
        public read(id: string);
        public flush(): void;
        public unpatch(): DataMap;
    }
}
declare module TypeScript {
    enum PullElementFlags {
        None,
        Exported,
        Private,
        Public,
        Ambient,
        Static,
        GetAccessor,
        SetAccessor,
        Optional,
        Call,
        Constructor,
        Index,
        Signature,
        Enum,
        FatArrow,
        ClassConstructorVariable,
        InitializedModule,
        InitializedDynamicModule,
        MustCaptureThis,
        Constant,
        ExpressionElement,
        DeclaredInAWithBlock,
        ImplicitVariable,
        SomeInitializedModule,
    }
    enum PullElementKind {
        None,
        Script,
        Global,
        Primitive,
        Container,
        Class,
        Interface,
        DynamicModule,
        Enum,
        Array,
        TypeAlias,
        ObjectLiteral,
        Variable,
        Parameter,
        Property,
        TypeParameter,
        Function,
        ConstructorMethod,
        Method,
        FunctionExpression,
        GetAccessor,
        SetAccessor,
        CallSignature,
        ConstructSignature,
        IndexSignature,
        ObjectType,
        FunctionType,
        ConstructorType,
        EnumMember,
        ErrorType,
        Expression,
        WithBlock,
        CatchBlock,
        All,
        SomeFunction,
        SomeValue,
        SomeType,
        SomeContainer,
        SomeBlock,
        SomeSignature,
        SomeAccessor,
        SomeLHS,
    }
    enum SymbolLinkKind {
        TypedAs,
        ContextuallyTypedAs,
        ProvidesInferredType,
        ArrayType,
        ArrayOf,
        PublicMember,
        PrivateMember,
        ConstructorMethod,
        Aliases,
        ContainedBy,
        Extends,
        Implements,
        Parameter,
        ReturnType,
        CallSignature,
        ConstructSignature,
        IndexSignature,
        TypeParameter,
        TypeArgument,
        TypeParameterSpecializedTo,
        SpecializedTo,
        TypeConstraint,
        ContributesToExpression,
        GetterFunction,
        SetterFunction,
    }
}
declare module TypeScript {
    var pullDeclID: number;
    var lastBoundPullDeclId: number;
    class PullDecl {
        private declType;
        private declName;
        private declDisplayName;
        private symbol;
        private declGroups;
        private signatureSymbol;
        private specializingSignatureSymbol;
        private childDecls;
        private typeParameters;
        public childDeclTypeCache: any;
        public childDeclValueCache: any;
        public childDeclTypeParameterCache: any;
        private declID;
        private declFlags;
        private span;
        private scriptName;
        private diagnostics;
        private parentDecl;
        private synthesizedValDecl;
        constructor(declName: string, displayName: string, declType: PullElementKind, declFlags: PullElementFlags, span: TextSpan, scriptName: string);
        public getDeclID(): number;
        public getName(): string;
        public getKind(): PullElementKind;
        public getDisplayName(): string;
        public setSymbol(symbol: PullSymbol): void;
        public getSymbol(): PullSymbol;
        public setSignatureSymbol(signature: PullSignatureSymbol): void;
        public getSignatureSymbol(): PullSignatureSymbol;
        public setSpecializingSignatureSymbol(signature: PullSignatureSymbol): void;
        public getSpecializingSignatureSymbol(): PullSignatureSymbol;
        public getFlags(): PullElementFlags;
        public setFlags(flags: PullElementFlags): void;
        public getSpan(): TextSpan;
        public setSpan(span: TextSpan): void;
        public getScriptName(): string;
        public setValueDecl(valDecl: PullDecl): void;
        public getValueDecl(): PullDecl;
        public isEqual(other: PullDecl): boolean;
        public getParentDecl(): PullDecl;
        public setParentDecl(parentDecl: PullDecl): void;
        public addDiagnostic(diagnostic: IDiagnostic): void;
        public getDiagnostics(): IDiagnostic[];
        public setErrors(diagnostics: Diagnostic[]): void;
        public resetErrors(): void;
        private getChildDeclCache(declKind);
        public addChildDecl(childDecl: PullDecl): void;
        public searchChildDecls(declName: string, isType: boolean): PullDecl[];
        public getChildDecls(): PullDecl[];
        public getTypeParameters(): PullDecl[];
        public addVariableDeclToGroup(decl: PullDecl): void;
        public getVariableDeclGroups(): PullDecl[][];
    }
    class PullFunctionExpressionDecl extends PullDecl {
        private functionExpressionName;
        constructor(expressionName: string, declFlags: PullElementFlags, span: TextSpan, scriptName: string);
        public getFunctionExpressionName(): string;
    }
    class PullDeclGroup {
        public name: string;
        private _decls;
        constructor(name: string);
        public addDecl(decl: PullDecl): void;
        public getDecls(): PullDecl[];
    }
}
declare module TypeScript {
    var pullSymbolID: number;
    var lastBoundPullSymbolID: number;
    var globalTyvarID: number;
    class PullSymbol {
        private pullSymbolID;
        private outgoingLinks;
        private incomingLinks;
        private declarations;
        private name;
        private cachedPathIDs;
        private declKind;
        private cachedContainerLink;
        private cachedTypeLink;
        private hasBeenResolved;
        private isOptional;
        private inResolution;
        private isSynthesized;
        private isBound;
        private rebindingID;
        private isVarArg;
        private isSpecialized;
        private isBeingSpecialized;
        public typeChangeUpdateVersion: number;
        public addUpdateVersion: number;
        public removeUpdateVersion: number;
        public docComments: string;
        public isPrinting: boolean;
        public getSymbolID(): number;
        public isType(): boolean;
        public isSignature(): boolean;
        public isArray(): boolean;
        public isPrimitive(): boolean;
        public isAccessor(): boolean;
        constructor(name: string, declKind: PullElementKind);
        public isAlias(): boolean;
        public isContainer(): boolean;
        public getName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public getDisplayName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public getKind(): PullElementKind;
        public setKind(declType: PullElementKind): void;
        public setIsOptional(): void;
        public getIsOptional(): boolean;
        public getIsVarArg(): boolean;
        public setIsVarArg(): void;
        public setIsSynthesized(): void;
        public getIsSynthesized(): boolean;
        public setIsSpecialized(): void;
        public getIsSpecialized(): boolean;
        public currentlyBeingSpecialized(): boolean;
        public setIsBeingSpecialized(): void;
        public setIsBound(rebindingID: number): void;
        public getRebindingID(): number;
        public getIsBound(): boolean;
        public addCacheID(cacheID: string): void;
        public invalidateCachedIDs(cache: any): void;
        public addDeclaration(decl: PullDecl): void;
        public getDeclarations(): PullDecl[];
        public removeDeclaration(decl: PullDecl): void;
        public updateDeclarations(map: (item: PullDecl, context: any) => void, context: any): void;
        public addOutgoingLink(linkTo: PullSymbol, kind: SymbolLinkKind): PullSymbolLink;
        public findOutgoingLinks(p: (psl: PullSymbolLink) => boolean): PullSymbolLink[];
        public findIncomingLinks(p: (psl: PullSymbolLink) => boolean): PullSymbolLink[];
        public removeOutgoingLink(link: PullSymbolLink): void;
        public updateOutgoingLinks(map: (item: PullSymbolLink, context: any) => void, context: any): void;
        public updateIncomingLinks(map: (item: PullSymbolLink, context: any) => void, context: any): void;
        public removeAllLinks(): void;
        public setContainer(containerSymbol: PullTypeSymbol): void;
        public getContainer(): PullTypeSymbol;
        public unsetContainer(): void;
        public setType(typeRef: PullTypeSymbol): void;
        public getType(): PullTypeSymbol;
        public unsetType(): void;
        public isTyped(): boolean;
        public setResolved(): void;
        public isResolved(): boolean;
        public startResolving(): void;
        public isResolving(): boolean;
        public setUnresolved(): void;
        public invalidate(): void;
        public hasFlag(flag: PullElementFlags): boolean;
        public allDeclsHaveFlag(flag: PullElementFlags): boolean;
        public pathToRoot(): PullSymbol[];
        public findCommonAncestorPath(b: PullSymbol): PullSymbol[];
        public toString(useConstraintInName?: boolean): string;
        private getPrettyNameInScope(scopeSymbol?);
        public getNamePartForFullName(scopeSymbol: PullSymbol): string;
        public fullName(scopeSymbol?: PullSymbol): string;
        public getScopedName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public getScopedNameEx(scopeSymbol?: PullSymbol, useConstraintInName?: boolean, getPrettyTypeName?: boolean): MemberName;
        public getTypeName(scopeSymbol?: PullSymbol, getPrettyTypeName?: boolean): string;
        public getTypeNameEx(scopeSymbol?: PullSymbol, getPrettyTypeName?: boolean): MemberName;
        private getTypeNameForFunctionSignature(prefix, scopeSymbol?, getPrettyTypeName?);
        public getNameAndTypeName(scopeSymbol?: PullSymbol): string;
        public getNameAndTypeNameEx(scopeSymbol?: PullSymbol): MemberName;
        static getTypeParameterString(typars: PullTypeSymbol[], scopeSymbol?: PullSymbol): string;
        static getIsExternallyVisible(symbol: PullSymbol, fromIsExternallyVisibleSymbol: PullSymbol, inIsExternallyVisibleSymbols: PullSymbol[]): boolean;
        public isExternallyVisible(inIsExternallyVisibleSymbols?: PullSymbol[]): boolean;
    }
    class PullExpressionSymbol extends PullSymbol {
        public contributingSymbols: PullSymbol[];
        constructor();
        public addContributingSymbol(symbol: PullSymbol): void;
        public getContributingSymbols(): PullSymbol[];
    }
    class PullSignatureSymbol extends PullSymbol {
        private parameterLinks;
        private typeParameterLinks;
        private returnTypeLink;
        private hasOptionalParam;
        private nonOptionalParamCount;
        private hasVarArgs;
        private specializationCache;
        private memberTypeParameterNameCache;
        private hasAGenericParameter;
        private stringConstantOverload;
        constructor(kind: PullElementKind);
        public isDefinition(): boolean;
        public hasVariableParamList(): boolean;
        public setHasVariableParamList(): void;
        public setHasGenericParameter(): void;
        public hasGenericParameter(): boolean;
        public isGeneric(): boolean;
        public addParameter(parameter: PullSymbol, isOptional?: boolean): void;
        public addSpecialization(signature: PullSignatureSymbol, typeArguments: PullTypeSymbol[]): void;
        public getSpecialization(typeArguments): PullSignatureSymbol;
        public addTypeParameter(parameter: PullTypeParameterSymbol): void;
        public getNonOptionalParameterCount(): number;
        public setReturnType(returnType: PullTypeSymbol): void;
        public getParameters(): PullSymbol[];
        public getTypeParameters(): PullTypeParameterSymbol[];
        public findTypeParameter(name: string): PullTypeParameterSymbol;
        public removeParameter(parameterSymbol: PullSymbol): void;
        public mimicSignature(signature: PullSignatureSymbol): void;
        public getReturnType(): PullTypeSymbol;
        public invalidate(): void;
        public isStringConstantOverloadSignature(): boolean;
        static getSignatureTypeMemberName(candidateSignature: PullSignatureSymbol, signatures: PullSignatureSymbol[], scopeSymbol: PullSymbol): MemberNameArray;
        static getSignaturesTypeNameEx(signatures: PullSignatureSymbol[], prefix: string, shortform: boolean, brackets: boolean, scopeSymbol?: PullSymbol, getPrettyTypeName?: boolean, candidateSignature?: PullSignatureSymbol): MemberName[];
        public toString(useConstraintInName?: boolean): string;
        public getSignatureTypeNameEx(prefix: string, shortform: boolean, brackets: boolean, scopeSymbol?: PullSymbol, getParamMarkerInfo?: boolean): MemberNameArray;
    }
    class PullTypeSymbol extends PullSymbol {
        private memberLinks;
        private typeParameterLinks;
        private specializationLinks;
        private containedByLinks;
        private memberNameCache;
        private memberTypeNameCache;
        private memberTypeParameterNameCache;
        private containedMemberCache;
        private typeArguments;
        private specializedTypeCache;
        private memberCache;
        private implementedTypeLinks;
        private extendedTypeLinks;
        private callSignatureLinks;
        private constructSignatureLinks;
        private indexSignatureLinks;
        private arrayType;
        private hasGenericSignature;
        private hasGenericMember;
        private knownBaseTypeCount;
        public getKnownBaseTypeCount(): number;
        public resetKnownBaseTypeCount(): void;
        public incrementKnownBaseCount(): void;
        private invalidatedSpecializations;
        private associatedContainerTypeSymbol;
        public isType(): boolean;
        public isClass(): boolean;
        public hasMembers(): boolean;
        public isFunction(): boolean;
        public isConstructor(): boolean;
        public isTypeParameter(): boolean;
        public isTypeVariable(): boolean;
        public isError(): boolean;
        public setHasGenericSignature(): void;
        public getHasGenericSignature(): boolean;
        public setHasGenericMember(): void;
        public getHasGenericMember(): boolean;
        public setAssociatedContainerType(type: PullTypeSymbol): void;
        public getAssociatedContainerType(): PullTypeSymbol;
        public getType(): PullTypeSymbol;
        public getArrayType(): PullTypeSymbol;
        public getElementType(): PullTypeSymbol;
        public setArrayType(arrayType: PullTypeSymbol): void;
        public addContainedByLink(containedByLink: PullSymbolLink): void;
        public findContainedMember(name: string): PullSymbol;
        public addMember(memberSymbol: PullSymbol, linkKind: SymbolLinkKind, doNotChangeContainer?: boolean): void;
        public removeMember(memberSymbol: PullSymbol): void;
        public getMembers(): PullSymbol[];
        public getTypeParameters(): PullTypeParameterSymbol[];
        public isGeneric(): boolean;
        public isFixed(): boolean;
        public addSpecialization(specializedVersionOfThisType: PullTypeSymbol, substitutingTypes: PullTypeSymbol[]): void;
        public getSpecialization(substitutingTypes: PullTypeSymbol[]): PullTypeSymbol;
        public getKnownSpecializations(): PullTypeSymbol[];
        public invalidateSpecializations(): void;
        public removeSpecialization(specializationType: PullTypeSymbol): void;
        public getTypeArguments(): PullTypeSymbol[];
        public setTypeArguments(typeArgs: PullTypeSymbol[]): void;
        public addCallSignature(callSignature: PullSignatureSymbol): void;
        public addCallSignatures(callSignatures: PullSignatureSymbol[]): void;
        public addConstructSignature(constructSignature: PullSignatureSymbol): void;
        public addConstructSignatures(constructSignatures: PullSignatureSymbol[]): void;
        public addIndexSignature(indexSignature: PullSignatureSymbol): void;
        public addIndexSignatures(indexSignatures: PullSignatureSymbol[]): void;
        public hasOwnCallSignatures(): boolean;
        public getCallSignatures(): PullSignatureSymbol[];
        public hasOwnConstructSignatures(): boolean;
        public getConstructSignatures(): PullSignatureSymbol[];
        public hasOwnIndexSignatures(): boolean;
        public getIndexSignatures(): PullSignatureSymbol[];
        public removeCallSignature(signature: PullSignatureSymbol, invalidate?: boolean): void;
        public recomputeCallSignatures(): void;
        public removeConstructSignature(signature: PullSignatureSymbol, invalidate?: boolean): void;
        public recomputeConstructSignatures(): void;
        public removeIndexSignature(signature: PullSignatureSymbol, invalidate?: boolean): void;
        public recomputeIndexSignatures(): void;
        public addImplementedType(interfaceType: PullTypeSymbol): void;
        public getImplementedTypes(): PullTypeSymbol[];
        public removeImplementedType(implementedType: PullTypeSymbol): void;
        public addExtendedType(extendedType: PullTypeSymbol): void;
        public getExtendedTypes(): PullTypeSymbol[];
        public hasBase(potentialBase: PullTypeSymbol): boolean;
        public isValidBaseKind(baseType: PullTypeSymbol, isExtendedType: boolean): boolean;
        public removeExtendedType(extendedType: PullTypeSymbol): void;
        public findMember(name: string, lookInParent?: boolean): PullSymbol;
        public findNestedType(name: string, kind?: PullElementKind): PullTypeSymbol;
        private populateMemberCache();
        private populateMemberTypeCache();
        public getAllMembers(searchDeclKind: PullElementKind, includePrivate: boolean): PullSymbol[];
        public findTypeParameter(name: string): PullTypeParameterSymbol;
        public cleanTypeParameters(): void;
        public setResolved(): void;
        public invalidate(): void;
        public getNamePartForFullName(scopeSymbol: PullSymbol): string;
        public getScopedName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public isNamedTypeSymbol(): boolean;
        public toString(useConstraintInName?: boolean): string;
        public getScopedNameEx(scopeSymbol?: PullSymbol, useConstraintInName?: boolean, getPrettyTypeName?: boolean): MemberName;
        public hasOnlyOverloadCallSignatures(): boolean;
        public getMemberTypeNameEx(topLevel: boolean, scopeSymbol?: PullSymbol, getPrettyTypeName?: boolean): MemberName;
        public isExternallyVisible(inIsExternallyVisibleSymbols?: PullSymbol[]): boolean;
        public setType(type: PullTypeSymbol): void;
    }
    class PullPrimitiveTypeSymbol extends PullTypeSymbol {
        constructor(name: string);
        public isResolved(): boolean;
        public isStringConstant(): boolean;
        public isFixed(): boolean;
        public invalidate(): void;
    }
    class PullStringConstantTypeSymbol extends PullPrimitiveTypeSymbol {
        constructor(name: string);
        public isStringConstant(): boolean;
    }
    class PullErrorTypeSymbol extends PullPrimitiveTypeSymbol {
        public diagnostic: Diagnostic;
        public delegateType: PullTypeSymbol;
        constructor(diagnostic: Diagnostic, delegateType: PullTypeSymbol);
        public isError(): boolean;
        public getDiagnostic(): Diagnostic;
        public getName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public getDisplayName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public toString(): string;
        public isResolved(): boolean;
    }
    class PullClassTypeSymbol extends PullTypeSymbol {
        private constructorMethod;
        private hasDefaultConstructor;
        constructor(name: string);
        public isClass(): boolean;
        public setHasDefaultConstructor(hasOne?: boolean): void;
        public getHasDefaultConstructor(): boolean;
        public getConstructorMethod(): PullSymbol;
        public setConstructorMethod(constructorMethod: PullSymbol): void;
        public invalidate(): void;
    }
    class PullContainerTypeSymbol extends PullTypeSymbol {
        public instanceSymbol: PullSymbol;
        constructor(name: string, kind?: PullElementKind);
        public isContainer(): boolean;
        public setInstanceSymbol(symbol: PullSymbol): void;
        public getInstanceSymbol(): PullSymbol;
        public invalidate(): void;
        private findAliasedType(decls);
        public getAliasedSymbol(scopeSymbol: PullSymbol): PullSymbol;
        public getName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public getDisplayName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
    }
    class PullTypeAliasSymbol extends PullTypeSymbol {
        private typeAliasLink;
        private isUsedAsValue;
        private typeUsedExternally;
        constructor(name: string);
        public isAlias(): boolean;
        public isContainer(): boolean;
        public setAliasedType(type: PullTypeSymbol): void;
        public getType(): PullTypeSymbol;
        public setType(type: PullTypeSymbol): void;
        public setIsUsedAsValue(): void;
        public getIsUsedAsValue(): boolean;
        public setIsTypeUsedExternally(): void;
        public getTypeUsedExternally(): boolean;
        public getMembers(): PullSymbol[];
        public getCallSignatures(): PullSignatureSymbol[];
        public getConstructSignatures(): PullSignatureSymbol[];
        public getIndexSignatures(): PullSignatureSymbol[];
        public findMember(name: string): PullSymbol;
        public findNestedType(name: string): PullTypeSymbol;
        public getAllMembers(searchDeclKind: PullElementKind, includePrivate: boolean): PullSymbol[];
        public invalidate(): void;
    }
    class PullDefinitionSignatureSymbol extends PullSignatureSymbol {
        public isDefinition(): boolean;
    }
    class PullFunctionTypeSymbol extends PullTypeSymbol {
        private definitionSignature;
        constructor();
        public isFunction(): boolean;
        public invalidate(): void;
        public addSignature(signature: PullSignatureSymbol): void;
        public getDefinitionSignature(): PullDefinitionSignatureSymbol;
    }
    class PullConstructorTypeSymbol extends PullTypeSymbol {
        private definitionSignature;
        constructor();
        public isFunction(): boolean;
        public isConstructor(): boolean;
        public invalidate(): void;
        public addSignature(signature: PullSignatureSymbol): void;
        public addTypeParameter(typeParameter: PullTypeParameterSymbol, doNotChangeContainer?: boolean): void;
        public getDefinitionSignature(): PullDefinitionSignatureSymbol;
    }
    class PullTypeParameterSymbol extends PullTypeSymbol {
        private constraintLink;
        constructor(name: string);
        public isTypeParameter(): boolean;
        public isFixed(): boolean;
        public setConstraint(constraintType: PullTypeSymbol): void;
        public getConstraint(): PullTypeSymbol;
        public isGeneric(): boolean;
        public fullName(scopeSymbol?: PullSymbol): string;
        public getName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public getDisplayName(scopeSymbol?: PullSymbol, useConstraintInName?: boolean): string;
        public isExternallyVisible(inIsExternallyVisibleSymbols?: PullSymbol[]): boolean;
    }
    class PullTypeVariableSymbol extends PullTypeParameterSymbol {
        constructor(name: string);
        private tyvarID;
        public isTypeParameter(): boolean;
        public isTypeVariable(): boolean;
    }
    class PullAccessorSymbol extends PullSymbol {
        private getterSymbolLink;
        private setterSymbolLink;
        constructor(name: string);
        public isAccessor(): boolean;
        public setSetter(setter: PullSymbol): void;
        public getSetter(): PullSymbol;
        public removeSetter(): void;
        public setGetter(getter: PullSymbol): void;
        public getGetter(): PullSymbol;
        public removeGetter(): void;
        public invalidate(): void;
    }
    class PullArrayTypeSymbol extends PullTypeSymbol {
        private elementType;
        public isArray(): boolean;
        public getElementType(): PullTypeSymbol;
        public isGeneric(): boolean;
        constructor();
        public setElementType(type: PullTypeSymbol): void;
        public getScopedNameEx(scopeSymbol?: PullSymbol, useConstraintInName?: boolean, getPrettyTypeName?: boolean): MemberName;
        public getMemberTypeNameEx(topLevel: boolean, scopeSymbol?: PullSymbol, getPrettyTypeName?: boolean): MemberName;
    }
    function specializeToArrayType(typeToReplace: PullTypeSymbol, typeToSpecializeTo: PullTypeSymbol, resolver: PullTypeResolver, context: PullTypeResolutionContext): PullTypeSymbol;
    function typeWrapsTypeParameter(type: PullTypeSymbol, typeParameter: PullTypeParameterSymbol): boolean;
    var nSpecializationsCreated: number;
    function specializeType(typeToSpecialize: PullTypeSymbol, typeArguments: PullTypeSymbol[], resolver: PullTypeResolver, enclosingDecl: PullDecl, context: PullTypeResolutionContext, ast?: AST): PullTypeSymbol;
    function specializeSignature(signature: PullSignatureSymbol, skipLocalTypeParameters: boolean, typeReplacementMap: any, typeArguments: PullTypeSymbol[], resolver: PullTypeResolver, enclosingDecl: PullDecl, context: PullTypeResolutionContext, ast?: AST): PullSignatureSymbol;
    function getIDForTypeSubstitutions(types: PullTypeSymbol[]): string;
}
declare module TypeScript {
    class PullSymbolBindingContext {
        public semanticInfoChain: SemanticInfoChain;
        public scriptName: string;
        private parentChain;
        private declPath;
        public semanticInfo: SemanticInfo;
        public reBindingAfterChange: boolean;
        public startingDeclForRebind: number;
        constructor(semanticInfoChain: SemanticInfoChain, scriptName: string);
        public getParent(n?: number): PullTypeSymbol;
        public getDeclPath(): string[];
        public pushParent(parentDecl: PullTypeSymbol): void;
        public popParent(): void;
    }
    var time_in_findSymbol: number;
    function findSymbolInContext(name: string, declKind: PullElementKind, context: PullSymbolBindingContext, typeLookupPath: string[]): PullSymbol;
}
declare module TypeScript {
    class CandidateInferenceInfo {
        public typeParameter: PullTypeParameterSymbol;
        public isFixed: boolean;
        public inferenceCandidates: PullTypeSymbol[];
        public addCandidate(candidate: PullTypeSymbol): void;
    }
    class ArgumentInferenceContext {
        public inferenceCache: any;
        public candidateCache: any;
        public alreadyRelatingTypes(objectType: PullTypeSymbol, parameterType: PullTypeSymbol): boolean;
        public getInferenceInfo(param: PullTypeParameterSymbol): CandidateInferenceInfo;
        public addCandidateForInference(param: PullTypeParameterSymbol, candidate: PullTypeSymbol, fix: boolean): void;
        public getInferenceCandidates(): any[];
        public inferArgumentTypes(resolver: PullTypeResolver, context: PullTypeResolutionContext): {
            results: {
                param: PullTypeParameterSymbol;
                type: PullTypeSymbol;
            }[];
            unfit: boolean;
        };
    }
    class PullContextualTypeContext {
        public contextualType: PullTypeSymbol;
        public provisional: boolean;
        public substitutions: any;
        public provisionallyTypedSymbols: PullSymbol[];
        public provisionalDiagnostic: Diagnostic[];
        constructor(contextualType: PullTypeSymbol, provisional: boolean, substitutions: any);
        public recordProvisionallyTypedSymbol(symbol: PullSymbol): void;
        public invalidateProvisionallyTypedSymbols(): void;
        public postDiagnostic(error: Diagnostic): void;
        public hadProvisionalErrors(): boolean;
    }
    class PullTypeResolutionContext {
        public emitting: boolean;
        private contextStack;
        private typeSpecializationStack;
        private genericASTResolutionStack;
        public resolvingTypeReference: boolean;
        public resolveAggressively: boolean;
        public searchTypeSpace: boolean;
        public canUseTypeSymbol: boolean;
        public specializingToAny: boolean;
        public isResolvingClassExtendedType: boolean;
        constructor(emitting?: boolean);
        public pushContextualType(type: PullTypeSymbol, provisional: boolean, substitutions: any): void;
        public popContextualType(): PullContextualTypeContext;
        public findSubstitution(type: PullTypeSymbol): PullTypeSymbol;
        public getContextualType(): PullTypeSymbol;
        public inProvisionalResolution(): boolean;
        public inSpecialization: boolean;
        public suppressErrors: boolean;
        private inBaseTypeResolution;
        public isInBaseTypeResolution(): boolean;
        public startBaseTypeResolution(): boolean;
        public doneBaseTypeResolution(wasInBaseTypeResolution: boolean): void;
        public setTypeInContext(symbol: PullSymbol, type: PullTypeSymbol): void;
        public pushTypeSpecializationCache(cache): void;
        public popTypeSpecializationCache(): void;
        public findSpecializationForType(type: PullTypeSymbol): PullTypeSymbol;
        public postError(fileName: string, offset: number, length: number, diagnosticKey: string, arguments: any[], enclosingDecl: PullDecl, addToDecl?: boolean): Diagnostic;
        public startResolvingTypeArguments(ast: AST): void;
        public isResolvingTypeArguments(ast: AST): boolean;
        public doneResolvingTypeArguments(): void;
    }
}
declare module TypeScript {
    interface IPullTypeCollection {
        getLength(): number;
        setTypeAtIndex(index: number, type: PullTypeSymbol): void;
        getTypeAtIndex(index: number): PullTypeSymbol;
    }
    interface IPullResolutionData {
        actuals: PullTypeSymbol[];
        exactCandidates: PullSignatureSymbol[];
        conversionCandidates: PullSignatureSymbol[];
        id: number;
    }
    class PullResolutionDataCache {
        public cacheSize: number;
        public rdCache: IPullResolutionData[];
        public nextUp: number;
        constructor();
        public getResolutionData(): IPullResolutionData;
        public returnResolutionData(rd: IPullResolutionData): void;
    }
    interface PullApplicableSignature {
        signature: PullSignatureSymbol;
        hadProvisionalErrors: boolean;
    }
    class PullAdditionalCallResolutionData {
        public targetSymbol: PullSymbol;
        public targetTypeSymbol: PullTypeSymbol;
        public resolvedSignatures: PullSignatureSymbol[];
        public candidateSignature: PullSignatureSymbol;
        public actualParametersContextTypeSymbols: PullTypeSymbol[];
    }
    class PullTypeResolver {
        private compilationSettings;
        public semanticInfoChain: SemanticInfoChain;
        private unitPath;
        private cachedArrayInterfaceType;
        private cachedNumberInterfaceType;
        private cachedStringInterfaceType;
        private cachedBooleanInterfaceType;
        private cachedObjectInterfaceType;
        private cachedFunctionInterfaceType;
        private cachedIArgumentsInterfaceType;
        private cachedRegExpInterfaceType;
        private cachedFunctionArgumentsSymbol;
        private assignableCache;
        private subtypeCache;
        private identicalCache;
        private resolutionDataCache;
        private currentUnit;
        constructor(compilationSettings: CompilationSettings, semanticInfoChain: SemanticInfoChain, unitPath: string);
        public getUnitPath(): string;
        public setUnitPath(unitPath: string): void;
        public getDeclForAST(ast: AST, unitPath?: string): PullDecl;
        public getSymbolForAST(ast: AST, context: PullTypeResolutionContext, unitPath?: string): PullSymbol;
        public setSymbolForAST(ast: AST, symbol: PullSymbol, context: PullTypeResolutionContext, unitPath?: string): void;
        public getASTForSymbol(symbol: PullSymbol, unitPath?: string): AST;
        public getASTForDecl(decl: PullDecl): AST;
        public getCachedArrayType(): PullTypeSymbol;
        public getNewErrorTypeSymbol(diagnostic: Diagnostic): PullErrorTypeSymbol;
        public getPathToDecl(decl: PullDecl): PullDecl[];
        public getEnclosingDecl(decl: PullDecl): PullDecl;
        public findSymbolForPath(pathToName: string[], enclosingDecl: PullDecl, declKind: PullElementKind): PullSymbol;
        public getSymbolFromDeclPath(symbolName: string, declPath: PullDecl[], declSearchKind: PullElementKind): PullSymbol;
        public getVisibleSymbolsFromDeclPath(declPath: PullDecl[], declSearchKind: PullElementKind): PullSymbol[];
        private addSymbolsFromDecls(decls, declSearchKind, symbols);
        public getVisibleSymbols(enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol[];
        public getVisibleContextSymbols(enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol[];
        public getVisibleMembersFromExpression(expression: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol[];
        public isAnyOrEquivalent(type: PullTypeSymbol): boolean;
        public isNumberOrEquivalent(type: PullTypeSymbol): boolean;
        public isTypeArgumentOrWrapper(type: PullTypeSymbol);
        public findTypeSymbolForDynamicModule(idText: string, currentFileName: string, search: (id: string) => PullTypeSymbol): PullTypeSymbol;
        public resolveDeclaration(declAST: AST, context: PullTypeResolutionContext, enclosingDecl?: PullDecl): PullSymbol;
        public resolveDeclaredSymbol(symbol: PullSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveModuleDeclaration(ast: ModuleDeclaration, context: PullTypeResolutionContext): PullTypeSymbol;
        private resolveReferenceTypeDeclaration(typeDeclAST, context);
        public resolveClassDeclaration(classDeclAST: ClassDeclaration, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveInterfaceDeclaration(interfaceDeclAST: TypeDeclaration, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveImportDeclaration(importStatementAST: ImportDeclaration, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveFunctionTypeSignature(funcDeclAST: FunctionDeclaration, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveFunctionTypeSignatureParameter(argDeclAST: Parameter, contextParam: PullSymbol, signature: PullSignatureSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): void;
        public resolveFunctionExpressionParameter(argDeclAST: Parameter, contextParam: PullSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): void;
        public resolveInterfaceTypeReference(interfaceDeclAST: NamedDeclaration, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveTypeReference(typeRef: TypeReference, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveVariableDeclaration(varDecl: BoundDecl, context: PullTypeResolutionContext, enclosingDecl?: PullDecl): PullSymbol;
        public resolveTypeParameterDeclaration(typeParameterAST: TypeParameter, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveFunctionBodyReturnTypes(funcDeclAST: FunctionDeclaration, signature: PullSignatureSymbol, useContextualType: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): void;
        public resolveFunctionDeclaration(funcDeclAST: FunctionDeclaration, context: PullTypeResolutionContext): PullSymbol;
        public resolveGetAccessorDeclaration(funcDeclAST: FunctionDeclaration, context: PullTypeResolutionContext): PullSymbol;
        public resolveSetAccessorDeclaration(funcDeclAST: FunctionDeclaration, context: PullTypeResolutionContext): PullSymbol;
        public resolveAST(ast: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveStatementOrExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        private isNameOrMemberAccessExpression(ast);
        public resolveNameSymbol(nameSymbol: PullSymbol, context: PullTypeResolutionContext): PullSymbol;
        public resolveNameExpression(nameAST: Identifier, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveDottedNameExpression(dottedNameAST: BinaryExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveTypeNameExpression(nameAST: Identifier, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveGenericTypeReference(genericTypeAST: GenericType, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveDottedTypeNameExpression(dottedNameAST: BinaryExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveFunctionExpression(funcDeclAST: FunctionDeclaration, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveThisExpression(ast: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveSuperExpression(ast: AST, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveObjectLiteralExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveArrayLiteralExpression(expressionAST: AST, inContextuallyTypedAssignment, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveIndexExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveBitwiseOperator(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveArithmeticExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveLogicalOrExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveLogicalAndExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveConditionalExpression(trinex: ConditionalExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveParenthesizedExpression(ast: ParenthesizedExpression, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveExpressionStatement(ast: ExpressionStatement, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveCallExpression(callEx: CallExpression, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext, additionalResults?: PullAdditionalCallResolutionData): PullSymbol;
        public resolveNewExpression(callEx: CallExpression, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext, additionalResults?: PullAdditionalCallResolutionData): PullSymbol;
        public resolveTypeAssertionExpression(expressionAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public resolveAssignmentStatement(statementAST: AST, inContextuallyTypedAssignment: boolean, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSymbol;
        public resolveBoundDecls(decl: PullDecl, context: PullTypeResolutionContext): void;
        public mergeOrdered(a: PullTypeSymbol, b: PullTypeSymbol, acceptVoid: boolean, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): PullTypeSymbol;
        public widenType(type: PullTypeSymbol): PullTypeSymbol;
        public isNullOrUndefinedType(type: PullTypeSymbol): boolean;
        public findBestCommonType(initialType: PullTypeSymbol, targetType: PullTypeSymbol, collection: IPullTypeCollection, acceptVoid: boolean, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): PullTypeSymbol;
        public typesAreIdentical(t1: PullTypeSymbol, t2: PullTypeSymbol, val?: AST);
        public signatureGroupsAreIdentical(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[]): boolean;
        public signaturesAreIdentical(s1: PullSignatureSymbol, s2: PullSignatureSymbol): boolean;
        public substituteUpperBoundForType(type: PullTypeSymbol);
        public symbolsShareDeclaration(symbol1: PullSymbol, symbol2: PullSymbol): boolean;
        public sourceIsSubtypeOfTarget(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public sourceMembersAreSubtypeOfTargetMembers(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public sourcePropertyIsSubtypeOfTargetProperty(source: PullTypeSymbol, target: PullTypeSymbol, sourceProp: PullSymbol, targetProp: PullSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public sourceCallSignaturesAreSubtypeOfTargetCallSignatures(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public sourceConstructSignaturesAreSubtypeOfTargetConstructSignatures(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public sourceIndexSignaturesAreSubtypeOfTargetIndexSignatures(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public typeIsSubtypeOfFunction(source: PullTypeSymbol, context): boolean;
        public signatureGroupIsSubtypeOfTarget(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[], context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public signatureIsSubtypeOfTarget(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public sourceIsAssignableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public signatureGroupIsAssignableToTarget(sg1: PullSignatureSymbol[], sg2: PullSignatureSymbol[], context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public signatureIsAssignableToTarget(s1: PullSignatureSymbol, s2: PullSignatureSymbol, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public sourceIsRelatableToTarget(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean;
        public sourceMembersAreRelatableToTargetMembers(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean;
        public sourcePropertyIsRelatableToTargetProperty(source: PullTypeSymbol, target: PullTypeSymbol, sourceProp: PullSymbol, targetProp: PullSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean;
        public sourceCallSignaturesAreRelatableToTargetCallSignatures(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean;
        public sourceConstructSignaturesAreRelatableToTargetConstructSignatures(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean;
        public sourceIndexSignaturesAreRelatableToTargetIndexSignatures(source: PullTypeSymbol, target: PullTypeSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): boolean;
        public signatureGroupIsRelatableToTarget(sourceSG: PullSignatureSymbol[], targetSG: PullSignatureSymbol[], assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public signatureIsRelatableToTarget(sourceSig: PullSignatureSymbol, targetSig: PullSignatureSymbol, assignableTo: boolean, comparisonCache: any, context: PullTypeResolutionContext, comparisonInfo?: TypeComparisonInfo): boolean;
        public resolveOverloads(application: AST, group: PullSignatureSymbol[], enclosingDecl: PullDecl, haveTypeArgumentsAtCallSite: boolean, context: PullTypeResolutionContext): PullSignatureSymbol;
        private getLastIdentifierInTarget(callEx);
        public getCandidateSignatures(signature: PullSignatureSymbol, actuals: PullTypeSymbol[], args: ASTList, exactCandidates: PullSignatureSymbol[], conversionCandidates: PullSignatureSymbol[], enclosingDecl: PullDecl, context: PullTypeResolutionContext, comparisonInfo: TypeComparisonInfo): void;
        public getApplicableSignaturesFromCandidates(candidateSignatures: PullSignatureSymbol[], args: ASTList, comparisonInfo: TypeComparisonInfo, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullApplicableSignature[];
        public findMostApplicableSignature(signatures: PullApplicableSignature[], args: ASTList, enclosingDecl: PullDecl, context: PullTypeResolutionContext): {
            sig: PullSignatureSymbol;
            ambiguous: boolean;
        };
        public canApplyContextualTypeToFunction(candidateType: PullTypeSymbol, funcDecl: FunctionDeclaration, beStringent: boolean): boolean;
        public inferArgumentTypesForSignature(signature: PullSignatureSymbol, args: ASTList, comparisonInfo: TypeComparisonInfo, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol[];
        public relateTypeToTypeParameters(expressionType: PullTypeSymbol, parameterType: PullTypeSymbol, shouldFix: boolean, argContext: ArgumentInferenceContext, enclosingDecl: PullDecl, context: PullTypeResolutionContext): void;
        public relateFunctionSignatureToTypeParameters(expressionSignature: PullSignatureSymbol, parameterSignature: PullSignatureSymbol, argContext: ArgumentInferenceContext, enclosingDecl: PullDecl, context: PullTypeResolutionContext): void;
        public relateObjectTypeToTypeParameters(objectType: PullTypeSymbol, parameterType: PullTypeSymbol, shouldFix: boolean, argContext: ArgumentInferenceContext, enclosingDecl: PullDecl, context: PullTypeResolutionContext): void;
        public relateArrayTypeToTypeParameters(argArrayType: PullTypeSymbol, parameterArrayType: PullTypeSymbol, shouldFix: boolean, argContext: ArgumentInferenceContext, enclosingDecl: PullDecl, context: PullTypeResolutionContext): void;
        public specializeTypeToAny(typeToSpecialize: PullTypeSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullTypeSymbol;
        public specializeSignatureToAny(signatureToSpecialize: PullSignatureSymbol, enclosingDecl: PullDecl, context: PullTypeResolutionContext): PullSignatureSymbol;
    }
}
declare module TypeScript {
    class TypeComparisonInfo {
        public onlyCaptureFirstError: boolean;
        public flags: TypeRelationshipFlags;
        public message: string;
        public stringConstantVal: AST;
        private indent;
        constructor(sourceComparisonInfo?: TypeComparisonInfo);
        private indentString();
        public addMessage(message): void;
        public setMessage(message): void;
    }
    class PullTypeCheckContext {
        public compiler: TypeScriptCompiler;
        public script: Script;
        public scriptName: string;
        public enclosingDeclStack: PullDecl[];
        public enclosingDeclReturnStack: boolean[];
        public semanticInfo: SemanticInfo;
        public inSuperConstructorCall: boolean;
        public inSuperConstructorTarget: boolean;
        public seenSuperConstructorCall: boolean;
        public inConstructorArguments: boolean;
        constructor(compiler: TypeScriptCompiler, script: Script, scriptName: string);
        public pushEnclosingDecl(decl: PullDecl): void;
        public popEnclosingDecl(): void;
        public getEnclosingDecl(kind?: PullElementKind): PullDecl;
        public getEnclosingNonLambdaDecl(): PullDecl;
        public getEnclosingClassDecl(): PullDecl;
        public getEnclosingDeclHasReturn(): boolean;
        public setEnclosingDeclHasReturn(): boolean;
    }
    class PullTypeChecker {
        private compilationSettings;
        public semanticInfoChain: SemanticInfoChain;
        static globalPullTypeCheckPhase: number;
        public resolver: PullTypeResolver;
        private context;
        constructor(compilationSettings: CompilationSettings, semanticInfoChain: SemanticInfoChain);
        public setUnit(unitPath: string): void;
        private getScriptDecl(fileName);
        private checkForResolutionError(typeSymbol, decl);
        private postError(offset, length, fileName, diagnosticKey, arguments, enclosingDecl);
        private validateVariableDeclarationGroups(enclosingDecl, typeCheckContext);
        private typeCheckAST(ast, typeCheckContext, inContextuallyTypedAssignment?);
        public typeCheckScript(script: Script, scriptName: string, compiler: TypeScriptCompiler): void;
        private typeCheckList(list, typeCheckContext);
        private typeCheckBoundDecl(ast, typeCheckContext);
        private typeCheckFunction(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment?);
        private typeCheckFunctionOverloads(funcDecl, typeCheckContext);
        private typeCheckAccessor(ast, typeCheckContext, inContextuallyTypedAssignment?);
        private typeCheckConstructor(funcDeclAST, typeCheckContext, inContextuallyTypedAssignment);
        private typeCheckIndexer(ast, typeCheckContext, inContextuallyTypedAssignment?);
        private typeCheckIfTypeMemberPropertyOkToOverride(typeSymbol, extendedType, typeMember, extendedTypeMember, comparisonInfo);
        private typeCheckIfTypeExtendsType(typeDecl, typeSymbol, extendedType, typeCheckContext);
        private typeCheckIfClassImplementsType(classDecl, classSymbol, implementedType, typeCheckContext);
        private typeCheckBase(typeDeclAst, typeSymbol, baseDeclAST, isExtendedType, typeCheckContext);
        private typeCheckBases(typeDeclAst, typeSymbol, typeCheckContext);
        private typeCheckClass(ast, typeCheckContext);
        private typeCheckInterface(ast, typeCheckContext);
        private typeCheckModule(ast, typeCheckContext);
        private checkAssignability(ast, source, target, typeCheckContext);
        private isValidLHS(ast, expressionSymbol, isEnumInitializer);
        private typeCheckAssignment(binaryExpression, typeCheckContext);
        private typeCheckGenericType(ast, typeCheckContext);
        private typeCheckObjectLiteral(ast, typeCheckContext, inContextuallyTypedAssignment?);
        private typeCheckArrayLiteral(ast, typeCheckContext, inContextuallyTypedAssignment?);
        private enclosingClassIsDerived(typeCheckContext);
        private isSuperCallNode(node);
        private getFirstStatementFromFunctionDeclAST(funcDeclAST);
        private superCallMustBeFirstStatementInConstructor(enclosingConstructor, enclosingClass);
        private checkForThisCaptureInArrowFunction(thisExpressionAST, typeCheckContext);
        private typeCheckThisExpression(thisExpressionAST, typeCheckContext);
        private typeCheckSuper(ast, typeCheckContext);
        private typeCheckCallExpression(callExpression, typeCheckContext);
        private typeCheckObjectCreationExpression(callExpression, typeCheckContext);
        private typeCheckTypeAssertion(ast, typeCheckContext);
        private typeCheckLogicalOperation(ast, typeCheckContext);
        private typeCheckLogicalAndOrExpression(ast, typeCheckContext);
        private typeCheckCommaExpression(ast, typeCheckContext);
        private typeCheckBinaryAdditionOperation(binaryExpression, typeCheckContext);
        private typeCheckBinaryArithmeticOperation(binaryExpression, typeCheckContext);
        private typeCheckLogicalNotExpression(unaryExpression, typeCheckContext, inContextuallyTypedAssignment);
        private typeCheckUnaryArithmeticOperation(unaryExpression, typeCheckContext, inContextuallyTypedAssignment);
        private typeCheckElementAccessExpression(binaryExpression, typeCheckContext);
        private typeCheckTypeOf(ast, typeCheckContext);
        private typeCheckTypeReference(ast, typeCheckContext);
        private typeCheckConditionalExpression(conditionalExpression, typeCheckContext);
        private typeCheckThrowStatement(throwStatement, typeCheckContext);
        private typeCheckDeleteExpression(unaryExpression, typeCheckContext);
        private typeCheckVoidExpression(unaryExpression, typeCheckContext);
        private typeCheckRegExpExpression(ast, typeCheckContext);
        private typeCheckForStatement(forStatement, typeCheckContext);
        private typeCheckForInStatement(ast, typeCheckContext);
        private typeCheckInExpression(binaryExpression, typeCheckContext);
        private typeCheckInstanceOfExpression(binaryExpression, typeCheckContext);
        private typeCheckParenthesizedExpression(parenthesizedExpression, typeCheckContext);
        private typeCheckWhileStatement(whileStatement, typeCheckContext);
        private typeCheckDoStatement(doStatement, typeCheckContext);
        private typeCheckIfStatement(ifStatement, typeCheckContext);
        private typeCheckBlock(block, typeCheckContext);
        private typeCheckVariableDeclaration(variableDeclaration, typeCheckContext);
        private typeCheckVariableStatement(variableStatement, typeCheckContext);
        private typeCheckWithStatement(withStatement, typeCheckContext);
        private typeCheckTryStatement(tryStatement, typeCheckContext);
        private typeCheckCatchClause(catchClause, typeCheckContext);
        private typeCheckReturnStatement(returnAST, typeCheckContext);
        private typeCheckNameExpression(ast, typeCheckContext);
        private typeCheckMemberAccessExpression(memberAccessExpression, typeCheckContext);
        private typeCheckSwitchStatement(switchStatement, typeCheckContext);
        private typeCheckExpressionStatement(ast, typeCheckContext, inContextuallyTypedAssignment);
        private typeCheckCaseClause(caseClause, typeCheckContext);
        private typeCheckLabeledStatement(labeledStatement, typeCheckContext);
        private checkTypePrivacy(declSymbol, typeSymbol, privacyErrorReporter);
        private checkTypePrivacyOfSignatures(declSymbol, signatures, privacyErrorReporter);
        private baseListPrivacyErrorReporter(declAST, declSymbol, baseAst, isExtendedType, typeSymbol, typeCheckContext);
        private variablePrivacyErrorReporter(declSymbol, typeSymbol, typeCheckContext);
        private checkFunctionTypePrivacy(funcDeclAST, inContextuallyTypedAssignment, typeCheckContext);
        private functionArgumentTypePrivacyErrorReporter(declAST, argIndex, paramSymbol, typeSymbol, typeCheckContext);
        private functionReturnTypePrivacyErrorReporter(declAST, funcReturnType, typeSymbol, typeCheckContext);
    }
}
declare module TypeScript {
    enum PullDeclEdit {
        NoChanges,
        DeclAdded,
        DeclRemoved,
        DeclChanged,
    }
    class PullDeclDiff {
        public oldDecl: PullDecl;
        public newDecl: PullDecl;
        public kind: PullDeclEdit;
        constructor(oldDecl: PullDecl, newDecl: PullDecl, kind: PullDeclEdit);
    }
    class PullDeclDiffer {
        private oldSemanticInfo;
        private newSemanticInfo;
        private differences;
        constructor(oldSemanticInfo: SemanticInfo, newSemanticInfo: SemanticInfo);
        static diffDecls(oldDecl: PullDecl, oldSemanticInfo: SemanticInfo, newDecl: PullDecl, newSemanticInfo: SemanticInfo): PullDeclDiff[];
        private diff(oldDecl, newDecl);
        private static emptyDeclArray;
        private diff1(oldDecl, newDecl, oldAST, newAST, oldNameToDecls, newNameToDecls);
        private isEquivalent(oldAST, newAST);
        private importDeclarationIsEquivalent(decl1, decl2);
        private typeDeclarationIsEquivalent(decl1, decl2);
        private classDeclarationIsEquivalent(decl1, decl2);
        private interfaceDeclarationIsEquivalent(decl1, decl2);
        private typeParameterIsEquivalent(decl1, decl2);
        private boundDeclarationIsEquivalent(decl1, decl2);
        private argumentDeclarationIsEquivalent(decl1, decl2);
        private variableDeclarationIsEquivalent(decl1, decl2);
        private functionDeclarationIsEquivalent(decl1, decl2);
        private catchClauseIsEquivalent(decl1, decl2);
        private withStatementIsEquivalent(decl1, decl2);
        private scriptIsEquivalent(decl1, decl2);
        private moduleDeclarationIsEquivalent(decl1, decl2);
    }
}
declare module TypeScript {
    var declCacheHit: number;
    var declCacheMiss: number;
    var symbolCacheHit: number;
    var symbolCacheMiss: number;
    class SemanticInfo {
        private compilationUnitPath;
        private topLevelDecls;
        private astDeclMap;
        private declASTMap;
        private syntaxElementDeclMap;
        private declSyntaxElementMap;
        private declSymbolMap;
        private astSymbolMap;
        private symbolASTMap;
        private syntaxElementSymbolMap;
        private symbolSyntaxElementMap;
        private dynamicModuleImports;
        private properties;
        private hasBeenTypeChecked;
        constructor(compilationUnitPath: string);
        public addTopLevelDecl(decl: PullDecl): void;
        public setTypeChecked(): void;
        public getTypeChecked(): boolean;
        public invalidate(): void;
        public getTopLevelDecls(): PullDecl[];
        public getPath(): string;
        public getDeclForAST(ast: AST): PullDecl;
        public setDeclForAST(ast: AST, decl: PullDecl): void;
        private getDeclKey(decl);
        public getASTForDecl(decl: PullDecl): AST;
        public setASTForDecl(decl: PullDecl, ast: AST): void;
        public setSymbolForAST(ast: AST, symbol: PullSymbol): void;
        public getSymbolForAST(ast: AST): PullSymbol;
        public getASTForSymbol(symbol: PullSymbol): AST;
        public getSyntaxElementForDecl(decl: PullDecl): ISyntaxElement;
        public setSyntaxElementForDecl(decl: PullDecl, syntaxElement: ISyntaxElement): void;
        public getDeclForSyntaxElement(syntaxElement: ISyntaxElement): PullDecl;
        public setDeclForSyntaxElement(syntaxElement: ISyntaxElement, decl: PullDecl): void;
        public getSyntaxElementForSymbol(symbol: PullSymbol): ISyntaxElement;
        public getSymbolForSyntaxElement(syntaxElement: ISyntaxElement): PullSymbol;
        public setSymbolForSyntaxElement(syntaxElement: ISyntaxElement, symbol: PullSymbol): void;
        public addDynamicModuleImport(importSymbol: PullTypeAliasSymbol): void;
        public getDynamicModuleImports(): PullTypeAliasSymbol[];
        public getDiagnostics(semanticErrors: IDiagnostic[]): void;
        public getProperties(): SemanticInfoProperties;
    }
    class SemanticInfoProperties {
        public unitContainsBool: boolean;
    }
    class SemanticInfoChain {
        public units: SemanticInfo[];
        private declCache;
        private symbolCache;
        private unitCache;
        public anyTypeSymbol: PullTypeSymbol;
        public booleanTypeSymbol: PullTypeSymbol;
        public numberTypeSymbol: PullTypeSymbol;
        public stringTypeSymbol: PullTypeSymbol;
        public nullTypeSymbol: PullTypeSymbol;
        public undefinedTypeSymbol: PullTypeSymbol;
        public elementTypeSymbol: PullTypeSymbol;
        public voidTypeSymbol: PullTypeSymbol;
        public addPrimitive(name: string, globalDecl: PullDecl): PullPrimitiveTypeSymbol;
        constructor();
        public addUnit(unit: SemanticInfo): void;
        public getUnit(compilationUnitPath: string): SemanticInfo;
        public updateUnit(oldUnit: SemanticInfo, newUnit: SemanticInfo): void;
        private collectAllTopLevelDecls();
        private getDeclPathCacheID(declPath, declKind);
        public findDecls(declPath: string[], declKind: PullElementKind): PullDecl[];
        public findSymbol(declPath: string[], declType: PullElementKind): PullSymbol;
        public update(compilationUnitPath: string): void;
        public invalidateUnit(compilationUnitPath: string): void;
        public getDeclForAST(ast: AST, unitPath: string): PullDecl;
        public getASTForDecl(decl: PullDecl): AST;
        public getSymbolForAST(ast: AST, unitPath: string): PullSymbol;
        public getASTForSymbol(symbol: PullSymbol, unitPath: string): AST;
        public setSymbolForAST(ast: AST, typeSymbol: PullSymbol, unitPath: string): void;
        public removeSymbolFromCache(symbol: PullSymbol): void;
        public postDiagnostics(): IDiagnostic[];
    }
}
declare module TypeScript {
    class DeclCollectionContext {
        public semanticInfo: SemanticInfo;
        public scriptName: string;
        public parentChain: PullDecl[];
        constructor(semanticInfo: SemanticInfo, scriptName?: string);
        public getParent(): PullDecl;
        public pushParent(parentDecl: PullDecl): void;
        public popParent(): void;
        public foundValueDecl: boolean;
    }
    function preCollectImportDecls(ast: AST, parentAST: AST, context: DeclCollectionContext): boolean;
    function preCollectModuleDecls(ast: AST, parentAST: AST, context: DeclCollectionContext): boolean;
    function preCollectClassDecls(classDecl: ClassDeclaration, parentAST: AST, context: DeclCollectionContext): boolean;
    function createObjectTypeDeclaration(interfaceDecl: InterfaceDeclaration, context: DeclCollectionContext): boolean;
    function preCollectInterfaceDecls(interfaceDecl: InterfaceDeclaration, parentAST: AST, context: DeclCollectionContext): boolean;
    function preCollectParameterDecl(argDecl: Parameter, parentAST: AST, context: DeclCollectionContext): boolean;
    function preCollectTypeParameterDecl(typeParameterDecl: TypeParameter, parentAST: AST, context: DeclCollectionContext): boolean;
    function createPropertySignature(propertyDecl: VariableDeclarator, context: DeclCollectionContext): boolean;
    function createMemberVariableDeclaration(memberDecl: VariableDeclarator, context: DeclCollectionContext): boolean;
    function createVariableDeclaration(varDecl: VariableDeclarator, context: DeclCollectionContext): boolean;
    function preCollectVarDecls(ast: AST, parentAST: AST, context: DeclCollectionContext): boolean;
    function createFunctionTypeDeclaration(functionTypeDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createConstructorTypeDeclaration(constructorTypeDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createFunctionDeclaration(funcDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createFunctionExpressionDeclaration(functionExpressionDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createMemberFunctionDeclaration(memberFunctionDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createIndexSignatureDeclaration(indexSignatureDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createCallSignatureDeclaration(callSignatureDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createConstructSignatureDeclaration(constructSignatureDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createClassConstructorDeclaration(constructorDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createGetAccessorDeclaration(getAccessorDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function createSetAccessorDeclaration(setAccessorDeclAST: FunctionDeclaration, context: DeclCollectionContext): boolean;
    function preCollectCatchDecls(ast: AST, parentAST: AST, context: DeclCollectionContext): boolean;
    function preCollectWithDecls(ast: AST, parentAST: AST, context: DeclCollectionContext): boolean;
    function preCollectFuncDecls(ast: AST, parentAST: AST, context: DeclCollectionContext): boolean;
    function preCollectDecls(ast: AST, parentAST: AST, walker: IAstWalker): AST;
    function postCollectDecls(ast: AST, parentAST: AST, walker: IAstWalker): AST;
}
declare module TypeScript {
    var globalBindingPhase: number;
    class PullSymbolBinder {
        private compilationSettings;
        public semanticInfoChain: SemanticInfoChain;
        private parentChain;
        private parentDeclChain;
        private declPath;
        private bindingPhase;
        private staticClassMembers;
        private functionTypeParameterCache;
        private findTypeParameterInCache(name);
        private addTypeParameterToCache(typeParameter);
        private resetTypeParameterCache();
        public semanticInfo: SemanticInfo;
        public reBindingAfterChange: boolean;
        public startingDeclForRebind: number;
        public startingSymbolForRebind: number;
        constructor(compilationSettings: CompilationSettings, semanticInfoChain: SemanticInfoChain);
        public setUnit(fileName: string): void;
        public getParent(returnInstanceType?: boolean): PullTypeSymbol;
        public getParentDecl(): PullDecl;
        public getDeclPath(): string[];
        public pushParent(parentType: PullTypeSymbol, parentDecl: PullDecl): void;
        public popParent(): void;
        public findSymbolInContext(name: string, declKind: PullElementKind, typeLookupPath: string[]): PullSymbol;
        public symbolIsRedeclaration(sym: PullSymbol): boolean;
        public bindModuleDeclarationToPullSymbol(moduleContainerDecl: PullDecl): void;
        public bindImportDeclaration(importDeclaration: PullDecl): void;
        public bindEnumDeclarationToPullSymbol(enumDeclaration: PullDecl): void;
        private cleanInterfaceSignatures(interfaceSymbol);
        private cleanClassSignatures(classSymbol);
        public bindClassDeclarationToPullSymbol(classDecl: PullDecl): void;
        public bindInterfaceDeclarationToPullSymbol(interfaceDecl: PullDecl): void;
        public bindObjectTypeDeclarationToPullSymbol(objectDecl: PullDecl): void;
        public bindConstructorTypeDeclarationToPullSymbol(constructorTypeDeclaration: PullDecl): void;
        public bindVariableDeclarationToPullSymbol(variableDeclaration: PullDecl): void;
        public bindPropertyDeclarationToPullSymbol(propertyDeclaration: PullDecl): void;
        public bindParameterSymbols(funcDecl: FunctionDeclaration, funcType: PullTypeSymbol, signatureSymbol: PullSignatureSymbol): void;
        public bindFunctionDeclarationToPullSymbol(functionDeclaration: PullDecl): void;
        public bindFunctionExpressionToPullSymbol(functionExpressionDeclaration: PullDecl): void;
        public bindFunctionTypeDeclarationToPullSymbol(functionTypeDeclaration: PullDecl): void;
        public bindMethodDeclarationToPullSymbol(methodDeclaration: PullDecl): void;
        public bindConstructorDeclarationToPullSymbol(constructorDeclaration: PullDecl): void;
        public bindConstructSignatureDeclarationToPullSymbol(constructSignatureDeclaration: PullDecl): void;
        public bindCallSignatureDeclarationToPullSymbol(callSignatureDeclaration: PullDecl): void;
        public bindIndexSignatureDeclarationToPullSymbol(indexSignatureDeclaration: PullDecl): void;
        public bindGetAccessorDeclarationToPullSymbol(getAccessorDeclaration: PullDecl): void;
        public bindSetAccessorDeclarationToPullSymbol(setAccessorDeclaration: PullDecl): void;
        public bindCatchBlockPullSymbols(catchBlockDecl: PullDecl): void;
        public bindWithBlockPullSymbols(withBlockDecl: PullDecl): void;
        public bindDeclToPullSymbol(decl: PullDecl, rebind?: boolean): void;
        public bindDeclsForUnit(filePath: string, rebind?: boolean): void;
    }
}
declare module TypeScript {
    var linkID: number;
    class IListItem {
        public value: any;
        public next: IListItem;
        public prev: IListItem;
        constructor(value: any);
    }
    class LinkList {
        public head: IListItem;
        public last: IListItem;
        public length: number;
        public addItem(item: any): void;
        public find(p: (rn: any) => boolean): any[];
        public remove(p: (item: any) => boolean): void;
        public update(map: (item: any, context: any) => void, context: any): void;
    }
    class PullSymbolLink {
        public start: PullSymbol;
        public end: PullSymbol;
        public kind: SymbolLinkKind;
        public id: number;
        public data: any;
        constructor(start: PullSymbol, end: PullSymbol, kind: SymbolLinkKind);
    }
    enum GraphUpdateKind {
        NoUpdate,
        SymbolRemoved,
        SymbolAdded,
        TypeChanged,
    }
    class PullSymbolUpdate {
        public updateKind: GraphUpdateKind;
        public symbolToUpdate: PullSymbol;
        public updater: PullSymbolGraphUpdater;
        constructor(updateKind: GraphUpdateKind, symbolToUpdate: PullSymbol, updater: PullSymbolGraphUpdater);
    }
    var updateVersion: number;
    class PullSymbolGraphUpdater {
        public semanticInfoChain: SemanticInfoChain;
        constructor(semanticInfoChain: SemanticInfoChain);
        public removeDecl(declToRemove: PullDecl): void;
        public addDecl(declToAdd: PullDecl): void;
        public removeSymbol(symbolToRemove: PullSymbol): void;
        public addSymbol(symbolToAdd: PullSymbol): void;
        public invalidateType(symbolWhoseTypeChanged: PullSymbol): void;
        public invalidateUnitsForSymbol(symbol: PullSymbol): void;
    }
    function propagateRemovalToOutgoingLinks(link: PullSymbolLink, update: PullSymbolUpdate): void;
    function propagateRemovalToIncomingLinks(link: PullSymbolLink, update: PullSymbolUpdate): void;
    function propagateAdditionToOutgoingLinks(link: PullSymbolLink, update: PullSymbolUpdate): void;
    function propagateAdditionToIncomingLinks(link: PullSymbolLink, update: PullSymbolUpdate): void;
    function propagateChangedTypeToOutgoingLinks(link: PullSymbolLink, update: PullSymbolUpdate): void;
    function propagateChangedTypeToIncomingLinks(link: PullSymbolLink, update: PullSymbolUpdate): void;
}
declare module TypeScript {
    function getDiagnosticsFromEnclosingDecl(enclosingDecl: PullDecl, errors: IDiagnostic[]): void;
}
declare module TypeScript.PullHelpers {
    interface SignatureInfoForFuncDecl {
        signature: PullSignatureSymbol;
        allSignatures: PullSignatureSymbol[];
    }
    function getSignatureForFuncDecl(funcDecl: FunctionDeclaration, semanticInfo: SemanticInfo): {
        signature: PullSignatureSymbol;
        allSignatures: PullSignatureSymbol[];
    };
    function getAccessorSymbol(getterOrSetter: FunctionDeclaration, semanticInfoChain: SemanticInfoChain, unitPath: string): PullAccessorSymbol;
    function getGetterAndSetterFunction(funcDecl: FunctionDeclaration, semanticInfoChain: SemanticInfoChain, unitPath: string): {
        getter: FunctionDeclaration;
        setter: FunctionDeclaration;
    };
}
declare module TypeScript {
    class SyntaxPositionMap {
        private position;
        private elementToPosition;
        constructor(node: SyntaxNode);
        private process(element);
        static create(node: SyntaxNode): SyntaxPositionMap;
        public fullStart(element: ISyntaxElement): number;
        public start(element: ISyntaxElement): number;
        public end(element: ISyntaxElement): number;
        public fullEnd(element: ISyntaxElement): number;
    }
    class SyntaxTreeToAstVisitor implements ISyntaxVisitor {
        private syntaxPositionMap;
        private fileName;
        private lineMap;
        private compilationSettings;
        static checkPositions: boolean;
        private position;
        private requiresExtendsBlock;
        private previousTokenTrailingComments;
        private isParsingDeclareFile;
        private isParsingAmbientModule;
        private static protoString;
        private static protoSubstitutionString;
        constructor(syntaxPositionMap: SyntaxPositionMap, fileName: string, lineMap: LineMap, compilationSettings: CompilationSettings);
        static visit(syntaxTree: SyntaxTree, fileName: string, compilationSettings: CompilationSettings): Script;
        private assertElementAtPosition(element);
        private movePast(element);
        private moveTo(element1, element2);
        private applyDelta(ast, delta);
        private setSpan(span, fullStart, element);
        private setSpan1(span, fullStart, element);
        private setSpanExplicit(span, start, end);
        private identifierFromToken(token, isOptional, useValueText);
        private getAST(element);
        private setAST(element, ast);
        public visitSyntaxList(list: ISyntaxList): ASTList;
        public visitSeparatedSyntaxList(list: ISeparatedSyntaxList): ASTList;
        private createRef(text, minChar);
        private convertComment(trivia, commentStartPosition, hasTrailingNewLine);
        private convertComments(triviaList, commentStartPosition);
        private mergeComments(comments1, comments2);
        private convertTokenLeadingComments(token, commentStartPosition);
        private convertTokenTrailingComments(token, commentStartPosition);
        private convertNodeLeadingComments(node, nodeStart);
        private convertNodeTrailingComments(node, nodeStart);
        private containsToken(list, kind);
        public visitToken(token: ISyntaxToken): Expression;
        private hasTopLevelImportOrExport(node);
        public visitSourceUnit(node: SourceUnitSyntax): Script;
        public visitExternalModuleReference(node: ExternalModuleReferenceSyntax): any;
        public visitModuleNameModuleReference(node: ModuleNameModuleReferenceSyntax): any;
        public visitClassDeclaration(node: ClassDeclarationSyntax): ClassDeclaration;
        public visitInterfaceDeclaration(node: InterfaceDeclarationSyntax): InterfaceDeclaration;
        public visitHeritageClause(node: HeritageClauseSyntax): ASTList;
        private getModuleNames(node);
        private getModuleNamesHelper(name, result);
        public visitModuleDeclaration(node: ModuleDeclarationSyntax): ModuleDeclaration;
        private hasDotDotDotParameter(parameters);
        public visitFunctionDeclaration(node: FunctionDeclarationSyntax): FunctionDeclaration;
        public visitEnumDeclaration(node: EnumDeclarationSyntax): ModuleDeclaration;
        public visitEnumElement(node: EnumElementSyntax): void;
        public visitImportDeclaration(node: ImportDeclarationSyntax): ImportDeclaration;
        public visitExportAssignment(node: ExportAssignmentSyntax): ExportAssignment;
        public visitVariableStatement(node: VariableStatementSyntax): VariableStatement;
        public visitVariableDeclaration(node: VariableDeclarationSyntax): VariableDeclaration;
        public visitVariableDeclarator(node: VariableDeclaratorSyntax): VariableDeclarator;
        public visitEqualsValueClause(node: EqualsValueClauseSyntax): Expression;
        private getUnaryExpressionNodeType(kind);
        public visitPrefixUnaryExpression(node: PrefixUnaryExpressionSyntax): UnaryExpression;
        private isOnSingleLine(start, end);
        public visitArrayLiteralExpression(node: ArrayLiteralExpressionSyntax): UnaryExpression;
        public visitOmittedExpression(node: OmittedExpressionSyntax): OmittedExpression;
        public visitParenthesizedExpression(node: ParenthesizedExpressionSyntax): ParenthesizedExpression;
        private getArrowFunctionStatements(body);
        public visitSimpleArrowFunctionExpression(node: SimpleArrowFunctionExpressionSyntax): FunctionDeclaration;
        public visitParenthesizedArrowFunctionExpression(node: ParenthesizedArrowFunctionExpressionSyntax): FunctionDeclaration;
        public visitType(type: ITypeSyntax): TypeReference;
        public visitQualifiedName(node: QualifiedNameSyntax): TypeReference;
        public visitTypeArgumentList(node: TypeArgumentListSyntax): ASTList;
        public visitConstructorType(node: ConstructorTypeSyntax): TypeReference;
        public visitFunctionType(node: FunctionTypeSyntax): TypeReference;
        public visitObjectType(node: ObjectTypeSyntax): TypeReference;
        public visitArrayType(node: ArrayTypeSyntax): TypeReference;
        public visitGenericType(node: GenericTypeSyntax): TypeReference;
        public visitTypeAnnotation(node: TypeAnnotationSyntax): TypeReference;
        public visitBlock(node: BlockSyntax): Block;
        public visitParameter(node: ParameterSyntax): Parameter;
        public visitMemberAccessExpression(node: MemberAccessExpressionSyntax): BinaryExpression;
        public visitPostfixUnaryExpression(node: PostfixUnaryExpressionSyntax): UnaryExpression;
        public visitElementAccessExpression(node: ElementAccessExpressionSyntax): BinaryExpression;
        private convertArgumentListArguments(node);
        public visitInvocationExpression(node: InvocationExpressionSyntax): CallExpression;
        public visitArgumentList(node: ArgumentListSyntax): ASTList;
        private getBinaryExpressionNodeType(node);
        public visitBinaryExpression(node: BinaryExpressionSyntax): BinaryExpression;
        public visitConditionalExpression(node: ConditionalExpressionSyntax): ConditionalExpression;
        public visitConstructSignature(node: ConstructSignatureSyntax): FunctionDeclaration;
        public visitMethodSignature(node: MethodSignatureSyntax): FunctionDeclaration;
        public visitIndexSignature(node: IndexSignatureSyntax): FunctionDeclaration;
        public visitPropertySignature(node: PropertySignatureSyntax): VariableDeclarator;
        public visitParameterList(node: ParameterListSyntax): ASTList;
        public visitCallSignature(node: CallSignatureSyntax): FunctionDeclaration;
        public visitTypeParameterList(node: TypeParameterListSyntax): ASTList;
        public visitTypeParameter(node: TypeParameterSyntax): TypeParameter;
        public visitConstraint(node: ConstraintSyntax): TypeReference;
        public visitIfStatement(node: IfStatementSyntax): IfStatement;
        public visitElseClause(node: ElseClauseSyntax): Statement;
        public visitExpressionStatement(node: ExpressionStatementSyntax): ExpressionStatement;
        public visitConstructorDeclaration(node: ConstructorDeclarationSyntax): FunctionDeclaration;
        public visitMemberFunctionDeclaration(node: MemberFunctionDeclarationSyntax): FunctionDeclaration;
        public visitMemberAccessorDeclaration(node: MemberAccessorDeclarationSyntax, typeAnnotation: TypeAnnotationSyntax): FunctionDeclaration;
        public visitGetMemberAccessorDeclaration(node: GetMemberAccessorDeclarationSyntax): FunctionDeclaration;
        public visitSetMemberAccessorDeclaration(node: SetMemberAccessorDeclarationSyntax): FunctionDeclaration;
        public visitMemberVariableDeclaration(node: MemberVariableDeclarationSyntax): VariableDeclarator;
        public visitThrowStatement(node: ThrowStatementSyntax): ThrowStatement;
        public visitReturnStatement(node: ReturnStatementSyntax): ReturnStatement;
        public visitObjectCreationExpression(node: ObjectCreationExpressionSyntax): CallExpression;
        public visitSwitchStatement(node: SwitchStatementSyntax): SwitchStatement;
        public visitCaseSwitchClause(node: CaseSwitchClauseSyntax): CaseClause;
        public visitDefaultSwitchClause(node: DefaultSwitchClauseSyntax): CaseClause;
        public visitBreakStatement(node: BreakStatementSyntax): Jump;
        public visitContinueStatement(node: ContinueStatementSyntax): Jump;
        public visitForStatement(node: ForStatementSyntax): ForStatement;
        public visitForInStatement(node: ForInStatementSyntax): ForInStatement;
        public visitWhileStatement(node: WhileStatementSyntax): WhileStatement;
        public visitWithStatement(node: WithStatementSyntax): WithStatement;
        public visitCastExpression(node: CastExpressionSyntax): UnaryExpression;
        public visitObjectLiteralExpression(node: ObjectLiteralExpressionSyntax): UnaryExpression;
        public visitSimplePropertyAssignment(node: SimplePropertyAssignmentSyntax): BinaryExpression;
        public visitFunctionPropertyAssignment(node: FunctionPropertyAssignmentSyntax): BinaryExpression;
        public visitGetAccessorPropertyAssignment(node: GetAccessorPropertyAssignmentSyntax): BinaryExpression;
        public visitSetAccessorPropertyAssignment(node: SetAccessorPropertyAssignmentSyntax): BinaryExpression;
        public visitFunctionExpression(node: FunctionExpressionSyntax): FunctionDeclaration;
        public visitEmptyStatement(node: EmptyStatementSyntax): EmptyStatement;
        public visitTryStatement(node: TryStatementSyntax): TryStatement;
        public visitCatchClause(node: CatchClauseSyntax): CatchClause;
        public visitFinallyClause(node: FinallyClauseSyntax): Block;
        public visitLabeledStatement(node: LabeledStatementSyntax): LabeledStatement;
        public visitDoStatement(node: DoStatementSyntax): DoStatement;
        public visitTypeOfExpression(node: TypeOfExpressionSyntax): UnaryExpression;
        public visitDeleteExpression(node: DeleteExpressionSyntax): UnaryExpression;
        public visitVoidExpression(node: VoidExpressionSyntax): UnaryExpression;
        public visitDebuggerStatement(node: DebuggerStatementSyntax): DebuggerStatement;
    }
}
declare module TypeScript {
    interface EmitterIOHost {
        createFile(path: string, useUTF8?: boolean): ITextWriter;
        fileExists(path: string): boolean;
        directoryExists(path: string): boolean;
        resolvePath(path: string): string;
    }
    interface PullTypeInfoAtPositionInfo {
        symbol: PullSymbol;
        ast: AST;
        enclosingScopeSymbol: PullSymbol;
        candidateSignature: PullSignatureSymbol;
        callSignatures: PullSignatureSymbol[];
        isConstructorCall: boolean;
    }
    interface PullSymbolInfo {
        symbol: PullSymbol;
        ast: AST;
        enclosingScopeSymbol: PullSymbol;
    }
    interface PullCallSymbolInfo {
        targetSymbol: PullSymbol;
        resolvedSignatures: PullSignatureSymbol[];
        candidateSignature: PullSignatureSymbol;
        isConstructorCall: boolean;
        ast: AST;
        enclosingScopeSymbol: PullSymbol;
    }
    interface PullVisibleSymbolsInfo {
        symbols: PullSymbol[];
        enclosingScopeSymbol: PullSymbol;
    }
    class Document {
        public fileName: string;
        private compilationSettings;
        private scriptSnapshot;
        public version: number;
        public isOpen: boolean;
        private _diagnostics;
        private _syntaxTree;
        public script: Script;
        public lineMap: LineMap;
        constructor(fileName: string, compilationSettings: CompilationSettings, scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, syntaxTree: SyntaxTree);
        public diagnostics(): IDiagnostic[];
        public syntaxTree(): SyntaxTree;
        public update(scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, textChangeRange: TextChangeRange): Document;
        static create(fileName: string, scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, referencedFiles: IFileReference[], compilationSettings): Document;
    }
    class TypeScriptCompiler {
		public logger: ILogger;
        public settings: CompilationSettings;
        public pullTypeChecker: PullTypeChecker;
        public semanticInfoChain: SemanticInfoChain;
        public emitOptions: EmitOptions;
        public fileNameToDocument: StringHashTable;
		constructor(logger:TypeScript.ILogger, compilerSettings:TypeScript.CompilationSettings, diagnosticMessages:any);
		public getDocument(fileName: string): Document;
        public timeFunction(funcDescription: string, func: () => any): any;
        public addSourceUnit(fileName: string, scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, referencedFiles?: IFileReference[]): Document;
        public updateSourceUnit(fileName: string, scriptSnapshot: IScriptSnapshot, version: number, isOpen: boolean, textChangeRange: TextChangeRange): Document;
        private isDynamicModuleCompilation();
        private updateCommonDirectoryPath();
        public parseEmitOption(ioHost: EmitterIOHost): IDiagnostic;
        public getScripts(): Script[];
        private useUTF8ForFile(script);
        static mapToDTSFileName(fileName: string, wholeFileNameReplaced: boolean): string;
        private canEmitDeclarations(script?);
        private emitDeclarations(document, declarationEmitter?);
        public emitAllDeclarations(): IDiagnostic[];
        static mapToFileNameExtension(extension: string, fileName: string, wholeFileNameReplaced: boolean): string;
        static mapToJSFileName(fileName: string, wholeFileNameReplaced: boolean): string;
        private emit(document, inputOutputMapper?, emitter?);
        public emitAll(ioHost: EmitterIOHost, inputOutputMapper?: (inputFile: string, outputFile: string) => void): IDiagnostic[];
        private outputScriptToUTF8(script);
        private outputScriptsToUTF8(scripts);
        private createFile(fileName, useUTF8);
        public pullResolveFile(fileName: string): boolean;
        public getSyntacticDiagnostics(fileName: string): IDiagnostic[];
        private getSyntaxTree(fileName);
        private getScript(fileName);
        public getSemanticDiagnostics(fileName: string): IDiagnostic[];
        public pullTypeCheck();
        private pullUpdateScript(oldDocument, newDocument);
        public getSymbolOfDeclaration(decl: PullDecl);
        public resolvePosition(pos: number, document: Document): PullTypeInfoAtPositionInfo;
        private extractResolutionContextFromPath(path, document);
        public pullGetSymbolInformationFromPath(path: AstPath, document: Document): PullSymbolInfo;
        public pullGetDeclarationSymbolInformation(path: AstPath, document: Document): PullSymbolInfo;
        public pullGetCallInformationFromPath(path: AstPath, document: Document): PullCallSymbolInfo;
        public pullGetVisibleMemberSymbolsFromPath(path: AstPath, document: Document): PullVisibleSymbolsInfo;
        public pullGetVisibleSymbolsFromPath(path: AstPath, document: Document): PullVisibleSymbolsInfo;
        public pullGetContextualMembersFromPath(path: AstPath, document: Document): PullVisibleSymbolsInfo;
        public pullGetTypeInfoAtPosition(pos: number, document: Document): PullTypeInfoAtPositionInfo;
        public getTopLevelDeclarations(scriptName: string): PullDecl[];
        public reportDiagnostics(errors: IDiagnostic[], errorReporter: IDignosticsReporter): void;
    }
}
declare module TypeScript {
    module CompilerDiagnostics {
        var debug: boolean;
        interface IDiagnosticWriter {
            Alert(output: string): void;
        }
        var diagnosticWriter: IDiagnosticWriter;
        var analysisPass: number;
        function Alert(output: string): void;
        function debugPrint(s: string): void;
        function assert(condition: boolean, s: string): void;
    }
    interface IDignosticsReporter {
        addDiagnostic(diagnostic: IDiagnostic): void;
    }
    interface ILogger {
        information(): boolean;
        debug(): boolean;
        warning(): boolean;
        error(): boolean;
        fatal(): boolean;
        log(s: string): void;
    }
    class NullLogger implements ILogger {
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
    function timeFunction(logger: ILogger, funcDescription: string, func: () => any): any;
}
