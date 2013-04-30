///<reference path='references.ts' />

module TypeScript {
    export interface IDiagnostic {
        fileName(): string;
        start(): number;
        length(): number;
        diagnosticKey(): string;
        text(): string;
        message(): string;
    }

    export class Diagnostic implements IDiagnostic {
        private _fileName: string;
        private _start: number;
        private _originalStart: number;
        private _length: number;
        private _diagnosticKey: string;
        private _arguments: any[];

        constructor(fileName: string, start: number, length: number, diagnosticKey: string, arguments: any[]) {
            this._diagnosticKey = diagnosticKey;
            this._arguments = (arguments && arguments.length > 0) ? arguments : null;
            this._fileName = fileName;
            this._originalStart = this._start = start;
            this._length = length;
        }

        public toJSON(key) {
            var result: any = {};
            result.start = this.start();
            result.length = this.length();
            result.diagnosticCode = this._diagnosticKey;

            var arguments = (<any>this).arguments();
            if (arguments && arguments.length > 0) {
                result.arguments = arguments;
            }

            return result;
        }

        public fileName(): string {
            return this._fileName;
        }

        public start(): number {
            return this._start;
        }

        public length(): number {
            return this._length;
        }

        public diagnosticKey(): string {
            return this._diagnosticKey;
        }

        public arguments(): any[] {
            return this._arguments;
        }

        /// <summary>
        /// Get the text of the message in the given language.
        /// </summary>
        public text(): string {
            return TypeScript.getDiagnosticText(this._diagnosticKey, this._arguments);
        }

        /// <summary>
        /// Get the text of the message including the error code in the given language.
        /// </summary>
        public message(): string {
            return TypeScript.getDiagnosticMessage(this._diagnosticKey, this._arguments);
        }

        public adjustOffset(pos: number) {
            this._start = this._originalStart + pos;
        }

        /// <summary>
        /// If a derived class has additional information about other referenced symbols, it can
        /// expose the locations of those symbols in a general way, so they can be reported along
        /// with the error.
        /// </summary>
        public additionalLocations(): Location[] {
            return [];
        }

        public static equals(diagnostic1: Diagnostic, diagnostic2: Diagnostic): boolean {
            return diagnostic1._fileName === diagnostic2._fileName &&
                diagnostic1._start === diagnostic2._start &&
                diagnostic1._length === diagnostic2._length &&
                diagnostic1._diagnosticKey === diagnostic2._diagnosticKey &&
                ArrayUtilities.sequenceEquals(diagnostic1._arguments, diagnostic2._arguments, (v1, v2) => v1 === v2);
        }
    }

    function getLargestIndex(diagnostic: string): number {
        var largest = -1;
        var regex = /\d+/g;

        var match;
        while ((match = regex.exec(diagnostic)) != null) {
            var val = parseInt(match[0]);
            if (!isNaN(val) && val > largest) {
                largest = val;
            }
        }

        return largest;
    }

    export function getDiagnosticInfoFromKey(diagnosticKey: string): DiagnosticInfo {
        var result = DiagnosticInfoMap[diagnosticKey];
        Debug.assert(result !== undefined && result !== null);
        return result;
    }

    export function getDiagnosticText(diagnosticKey: string, args: any[]): string {
        var diagnosticMessageText = LocalizedDiagnosticMessages[diagnosticKey];
        Debug.assert(diagnosticMessageText !== undefined && diagnosticMessageText !== null);
        //var diagnosticName: string = (<any>DiagnosticCode)._map[diagnosticCode];

        var diagnostic = getDiagnosticInfoFromKey(diagnosticKey);

        var actualCount = args ? args.length : 0;
        if (!diagnostic) {
            throw new Error("Invalid diagnostic");
        }
        else {
            // We have a string like "foo_0_bar_1".  We want to find the largest integer there.
            // (i.e.'1').  We then need one more arg than that to be correct.
            var expectedCount = 1 + getLargestIndex(diagnosticKey);

            if (expectedCount !== actualCount) {
                throw new Error("Expected " + expectedCount + " arguments to diagnostic, got " + actualCount + " instead");
            }
        }

        
        diagnosticMessageText = diagnosticMessageText.replace(/{(\d+)}/g, function (match, num) {
            return typeof args[num] !== 'undefined'
                ? args[num]
                : match;
        });

        diagnosticMessageText = diagnosticMessageText.replace(/{(NL)}/g, function (match) {
            return "\r\n";
        });

        return diagnosticMessageText;
    }

    export function getDiagnosticMessage(diagnosticKey: string, args: any[]): string {
        var diagnostic = getDiagnosticInfoFromKey(diagnosticKey);
        var diagnosticMessageText = getDiagnosticText(diagnosticKey, args);

        var message: string;
        if (diagnostic.category === DiagnosticCategory.Error) {
            message = getDiagnosticText("error TS{0}: {1}", [diagnostic.code, diagnosticMessageText]);
        } else if (diagnostic.category === DiagnosticCategory.Warning) {
            message = getDiagnosticText("warning TS{0}: {1}", [diagnostic.code, diagnosticMessageText]);
        } else {
            message = diagnosticMessageText;
        }

        return message;
    }
}