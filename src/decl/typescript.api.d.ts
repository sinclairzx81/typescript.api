declare module TypeScript.Api.Units {
    class Diagnostic {
        public type: string;
        public path: string;
        public text: string;
        public message: string;
        public line_index: number;
        public char_index: number;
        constructor(type: string, path: string, text: string, message: string);
        public computeLineInfo(content: string, start: number): void;
        public toString(): string;
    }
}
declare module TypeScript.Api.Units {
    class Unit {
        public path: string;
        public content: string;
        public diagnostics: Diagnostic[];
        constructor(path: string, content: string, diagnostics: Diagnostic[]);
        public hasError(): boolean;
    }
}
declare module TypeScript.Api.Units {
    class SourceUnit extends Unit {
        public remote: boolean;
        public syntaxChecked: boolean;
        public typeChecked: boolean;
        constructor(path: string, content: string, diagnostics: Diagnostic[], remote: boolean);
        public references(): string[];
    }
}
declare module TypeScript.Api.IO {
    interface IIO {
        readFile(filename: string, callback: (unit: Units.SourceUnit) => void): void;
    }
}
declare module TypeScript.Api.IO {
    class Buffer {
        static process(buffer): string;
    }
}
declare module TypeScript.Api.IO {
    class IOSync implements IIO {
        public readFile(path: string, callback: (sourceUnit: Units.SourceUnit) => void): void;
    }
}
declare module TypeScript.Api.IO {
    class IOAsync implements IIO {
        public readFile(path: string, callback: (sourceUnit: Units.SourceUnit) => void): void;
    }
}
declare module TypeScript.Api.IO {
    class IORemoteAsync implements IIO {
        public readFile(path: string, callback: (unit: Units.SourceUnit) => void): void;
        private readFileFromDisk(path, callback);
        private readFileFromHttp(path, callback);
        private isHTTPS(path);
        private isUrl(path);
    }
}
declare module TypeScript.Api.Loggers {
    class NullLogger implements ILogger {
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
}
declare module TypeScript.Api.Loggers {
    class ConsoleLogger implements ILogger {
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
}
declare module TypeScript.Api.Writers {
    class TextWriter implements ITextWriter {
        public buffer: string[];
        public temp: string;
        constructor();
        public Write(text: string): void;
        public WriteLine(text): void;
        public Close(): void;
        public toString(): string;
    }
}
declare module TypeScript.Api.Loggers {
    class BufferedLogger implements ILogger {
        private writer;
        constructor();
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
        public toString(): string;
    }
}
declare module TypeScript.Api.Util {
    class Path {
        static isAbsoluteUrl(path: string): boolean;
        static isAbsoluteUrn(path: string): boolean;
        static isRootRelative(path: string): boolean;
        static isRelative(path: string): boolean;
        static toForwardSlashes(path: string): string;
        static relativeToAbsolute(absolute_parent_path: string, relative_path: string): string;
    }
}
declare module TypeScript.Api.Resolve {
    class LoadParameter {
        public parent_filename: string;
        public filename: string;
        constructor(parent_filename: string, filename: string);
    }
    class Resolver {
        public io: IO.IIO;
        public logger: ILogger;
        private pending;
        private closed;
        private units;
        constructor(io: IO.IIO, logger: ILogger);
        public resolve(sources: string[], callback: (units: Units.SourceUnit[]) => void): void;
        private load(callback);
        private next(callback);
        private visited(parameter);
    }
}
declare module TypeScript.Api.Units {
    class CompiledUnit extends Unit {
        public ast: AST;
        public declaration: string;
        constructor(path: string, content: string, diagnostics: Diagnostic[], ast: AST, declaration: string);
        public references(): string[];
    }
}
declare module TypeScript.Api.Compile {
    interface IEmitter {
        directoryExists(path: string): boolean;
        fileExists(path: string): boolean;
        resolvePath(path: string): string;
        createFile(path: string, useUTF8?: boolean): ITextWriter;
    }
    class Emitter implements IEmitter {
        public files: ITextWriter[];
        constructor();
        public createFile(path: string, useUTF8?: boolean): ITextWriter;
        public directoryExists(path: string): boolean;
        public fileExists(path: string): boolean;
        public resolvePath(path: string): string;
    }
}
declare module TypeScript.Api.Compile {
    class Compiler {
        public compiler: TypeScriptCompiler;
        public logger: ILogger;
        public sourceUnits: Units.SourceUnit[];
        constructor(logger: ILogger);
        private isSourceUnitInCache(sourceUnit);
        private isSourceUnitUpdated(sourceUnit);
        private addSourceUnit(sourceUnit);
        private syntaxCheck(sourceUnit);
        private typeCheck(sourceUnit);
        private emitUnits(sourceUnits);
        public compile(sourceUnits: Units.SourceUnit[], callback: (compiledUnits: Units.CompiledUnit[]) => void): void;
    }
}
declare module TypeScript.Api.Reflect {
    class Import {
        public name: string;
        public alias: string;
        public limChar: number;
        public minChar: number;
        static create(ast: ImportDeclaration): Import;
    }
}
declare module TypeScript.Api.Reflect {
    class Type {
        public name: string;
        public arguments: Type[];
        public arrayCount: number;
        public limChar: number;
        public minChar: number;
        constructor();
        private static qualifyName(ast);
        static create(ast: AST): Type;
    }
}
declare module TypeScript.Api.Reflect {
    class Parameter {
        public name: string;
        public type: Type;
        public limChar: number;
        public minChar: number;
        private static load_type(result, ast);
        static create(ast: Parameter): Parameter;
    }
}
declare module TypeScript.Api.Reflect {
    class Method {
        public name: string;
        public parameters: Parameter[];
        public returns: Type;
        public isStatic: boolean;
        public isAccessor: boolean;
        public isSignature: boolean;
        public isConstructor: boolean;
        public isCallMember: boolean;
        public isDeclaration: boolean;
        public isExpression: boolean;
        public isGetAccessor: boolean;
        public isSetAccessor: boolean;
        public isIndexer: boolean;
        public comments: string[];
        public limChar: number;
        public minChar: number;
        constructor();
        private static load_comments(result, ast);
        private static load_returns(result, ast);
        static load_parameters(result: Method, ast: FunctionDeclaration): void;
        static create(ast: FunctionDeclaration): Method;
    }
}
declare module TypeScript.Api.Reflect {
    class Variable {
        public name: string;
        public type: Type;
        public isProperty: boolean;
        public isStatic: boolean;
        public isStatement: boolean;
        public isExpression: boolean;
        public isStatementOrExpression: boolean;
        public isExported: boolean;
        public comments: string[];
        public limChar: number;
        public minChar: number;
        constructor();
        private static load_comments(result, ast);
        private static load_type(result, ast);
        static create(ast: VariableDeclarator): Variable;
    }
}
declare module TypeScript.Api.Reflect {
    class Interface {
        public methods: Method[];
        public variables: Variable[];
        public parameters: string[];
        public extends: Type[];
        public name: string;
        public limChar: number;
        public minChar: number;
        constructor();
        private static load_parameters(result, ast);
        private static load_extends(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: InterfaceDeclaration): Interface;
    }
}
declare module TypeScript.Api.Reflect {
    class Class {
        public methods: Method[];
        public variables: Variable[];
        public parameters: string[];
        public extends: Type[];
        public implements: Type[];
        public name: string;
        public limChar: number;
        public minChar: number;
        constructor();
        private static load_parameters(result, ast);
        private static load_extends(result, ast);
        private static load_implements(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: ClassDeclaration): Class;
    }
}
declare module TypeScript.Api.Reflect {
    class Module {
        public imports: Import[];
        public modules: Module[];
        public interfaces: Interface[];
        public classes: Class[];
        public methods: Method[];
        public variables: Variable[];
        public name: string;
        public limChar: number;
        public minChar: number;
        constructor();
        private static load_imports(result, ast);
        private static load_modules(result, ast);
        private static load_interfaces(result, ast);
        private static load_classes(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: ModuleDeclaration): Module;
    }
}
declare module TypeScript.Api.Reflect {
    class Script {
        public modules: Module[];
        public interfaces: Interface[];
        public classes: Class[];
        public methods: Method[];
        public variables: Variable[];
        public path: string;
        constructor();
        private static load_modules(result, ast);
        private static load_interfaces(result, ast);
        private static load_classes(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(path: string, ast: Script): Script;
    }
}
declare module TypeScript.Api.Reflect {
    class Reflection {
        public scripts: Script[];
        constructor();
    }
}
