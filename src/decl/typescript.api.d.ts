declare module TypeScript.Api.IO {
    class IOFileError {
        public text: string;
        public message: string;
        constructor(text: string, message: string);
    }
    class IOFile {
        public path: string;
        public content: string;
        public errors: IOFileError[];
        public remote: boolean;
        constructor(path: string, content: string, errors: IOFileError[], remote: boolean);
    }
}
declare module TypeScript.Api.IO {
    interface IIO {
        readFile(filename: string, callback: (iofile: IO.IOFile) => void): void;
    }
}
declare module TypeScript.Api.IO {
    class Buffer {
        static process(buffer): string;
    }
}
declare module TypeScript.Api.IO {
    class IOSync implements IO.IIO {
        public readFile(path: string, callback: (iofile: IO.IOFile) => void): void;
    }
}
declare module TypeScript.Api.IO {
    class IOAsync implements IO.IIO {
        public readFile(path: string, callback: (iofile: IO.IOFile) => void): void;
    }
}
declare module TypeScript.Api.IO {
    class IORemoteAsync implements IO.IIO {
        public readFile(path: string, callback: (iofile: IO.IOFile) => void): void;
        private readFileFromDisk(path, callback);
        private readFileFromHttp(path, callback);
        private isHTTPS(path);
        private isUrl(path);
    }
}
declare module TypeScript.Api.Loggers {
    class NullLogger implements TypeScript.ILogger {
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
}
declare module TypeScript.Api.Loggers {
    class ConsoleLogger implements TypeScript.ILogger {
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
    class BufferedLogger implements TypeScript.ILogger {
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
        public diagnostics: Units.Diagnostic[];
        constructor(path: string, content: string, diagnostics: Units.Diagnostic[]);
        public hasError(): boolean;
    }
}
declare module TypeScript.Api.Units {
    class SourceUnit extends Units.Unit {
        public remote: boolean;
        public syntaxChecked: boolean;
        public typeChecked: boolean;
        constructor(path: string, content: string, diagnostics: Units.Diagnostic[], remote: boolean);
        public references(): string[];
    }
}
declare module TypeScript.Api.Reflect {
    class ReflectionType {
        public identifier: string;
        public name: string;
        public scope: string[];
        constructor(identifier: string);
    }
}
declare module TypeScript.Api.Reflect {
    class Import extends Reflect.ReflectionType {
        public alias: string;
        constructor();
        static create(ast: TypeScript.ImportDeclaration): Import;
    }
}
declare module TypeScript.Api.Reflect {
    class Type extends Reflect.ReflectionType {
        public arguments: Type[];
        public signature: Reflect.Method;
        public arrayCount: number;
        constructor();
        private static qualifyName(ast);
        static create(ast: TypeScript.AST): Type;
    }
}
declare module TypeScript.Api.Reflect {
    class Parameter extends Reflect.ReflectionType {
        public type: Reflect.Type;
        constructor();
        private static load_type(result, ast);
        static create(ast: TypeScript.Parameter): Parameter;
    }
}
declare module TypeScript.Api.Reflect {
    class Method extends Reflect.ReflectionType {
        public parameters: Reflect.Parameter[];
        public returns: Reflect.Type;
        public isExported: boolean;
        public isPublic: boolean;
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
        constructor();
        private static load_comments(result, ast);
        private static load_returns(result, ast);
        static load_parameters(result: Method, ast: TypeScript.FunctionDeclaration): void;
        static create(ast: TypeScript.FunctionDeclaration): Method;
    }
}
declare module TypeScript.Api.Reflect {
    class Variable extends Reflect.ReflectionType {
        public type: Reflect.Type;
        public isPublic: boolean;
        public isProperty: boolean;
        public isStatic: boolean;
        public isStatement: boolean;
        public isExpression: boolean;
        public isStatementOrExpression: boolean;
        public isExported: boolean;
        public comments: string[];
        constructor();
        private static load_comments(result, ast);
        private static load_type(result, ast);
        static create(ast: TypeScript.VariableDeclarator): Variable;
    }
}
declare module TypeScript.Api.Reflect {
    class Interface extends Reflect.ReflectionType {
        public methods: Reflect.Method[];
        public variables: Reflect.Variable[];
        public parameters: string[];
        public extends: Reflect.Type[];
        public isExported: boolean;
        constructor();
        private static load_parameters(result, ast);
        private static load_extends(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: TypeScript.InterfaceDeclaration): Interface;
    }
}
declare module TypeScript.Api.Reflect {
    class Class extends Reflect.ReflectionType {
        public methods: Reflect.Method[];
        public variables: Reflect.Variable[];
        public parameters: string[];
        public extends: Reflect.Type[];
        public implements: Reflect.Type[];
        public isExported: boolean;
        constructor();
        private static load_parameters(result, ast);
        private static load_extends(result, ast);
        private static load_implements(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: TypeScript.ClassDeclaration): Class;
    }
}
declare module TypeScript.Api.Reflect {
    class Module extends Reflect.ReflectionType {
        public imports: Reflect.Import[];
        public modules: Module[];
        public interfaces: Reflect.Interface[];
        public classes: Reflect.Class[];
        public methods: Reflect.Method[];
        public variables: Reflect.Variable[];
        public isExported: boolean;
        constructor();
        private static load_imports(result, ast);
        private static load_modules(result, ast);
        private static load_interfaces(result, ast);
        private static load_classes(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: TypeScript.ModuleDeclaration): Module;
    }
}
declare module TypeScript.Api.Reflect {
    class Script extends Reflect.ReflectionType {
        public modules: Reflect.Module[];
        public interfaces: Reflect.Interface[];
        public classes: Reflect.Class[];
        public methods: Reflect.Method[];
        public variables: Reflect.Variable[];
        constructor();
        private static load_modules(result, ast);
        private static load_interfaces(result, ast);
        private static load_classes(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static load_scope(script: Script): void;
        static create(name: string, ast: TypeScript.Script): Script;
    }
}
declare module TypeScript.Api.Reflect {
    class Reflection {
        public scripts: Reflect.Script[];
        public global_module_stack: Reflect.Module[];
        public local_module_stack: Reflect.Module[];
        constructor();
        private resolve_type(type);
        private resolve_local_scope(reflection_type);
        private load_global_module_scope(script);
        public resolve_type_references(): void;
    }
}
declare module TypeScript.Api.Units {
    class CompiledUnit extends Units.Unit {
        public ast: TypeScript.AST;
        public declaration: string;
        public sourcemap: string;
        public script: Api.Reflect.Script;
        constructor(path: string, content: string, diagnostics: Units.Diagnostic[], ast: TypeScript.AST, declaration: string, sourcemap: string, script: Api.Reflect.Script);
        public references(): string[];
    }
}
declare module TypeScript.Api.Resolve {
    class Node {
        public path: string;
        public references: string[];
        constructor();
    }
    class Topology {
        static graph(units: Api.Units.SourceUnit[]): Node[];
        static sort(units: Api.Units.SourceUnit[]): Api.Units.SourceUnit[];
    }
}
declare module TypeScript.Api.Resolve {
    class LoadParameter {
        public parent_filename: string;
        public filename: string;
        constructor(parent_filename: string, filename: string);
    }
    class Resolver {
        public io: Api.IO.IIO;
        public logger: TypeScript.ILogger;
        private pending;
        private closed;
        private units;
        constructor(io: Api.IO.IIO, logger: TypeScript.ILogger);
        public resolve(sources: string[], callback: (units: Api.Units.SourceUnit[]) => void): void;
        private load(callback);
        private next(callback);
        private visited(parameter);
    }
}
declare module TypeScript.Api.Compile {
    interface IEmitter {
        directoryExists(path: string): boolean;
        fileExists(path: string): boolean;
        resolvePath(path: string): string;
        writeFile(fileName: string, contents: string, writeByteOrderMark: boolean): void;
    }
    class Emitter implements IEmitter {
        public files: string[];
        constructor();
        public writeFile(fileName: string, contents: string, writeByteOrderMark: boolean): void;
        public directoryExists(path: string): boolean;
        public fileExists(path: string): boolean;
        public resolvePath(path: string): string;
    }
}
declare module TypeScript.Api.Compile {
    class Compiler {
        public compiler: TypeScript.TypeScriptCompiler;
        public logger: TypeScript.ILogger;
        public sourceUnits: Api.Units.SourceUnit[];
        constructor(languageVersion: TypeScript.LanguageVersion, moduleTarget: TypeScript.ModuleGenTarget, logger: TypeScript.ILogger);
        private isSourceUnitInCache(sourceUnit);
        private isSourceUnitUpdated(sourceUnit);
        private addSourceUnit(sourceUnit);
        private syntaxCheck(sourceUnit);
        private typeCheck(sourceUnit);
        private emitUnits(sourceUnits);
        public compile(sourceUnits: Api.Units.SourceUnit[], callback: (compiledUnits: Api.Units.CompiledUnit[]) => void): void;
    }
}
