declare module TypeScript.Api {
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
declare module TypeScript.Api {
    interface IIO {
        readFile(filename: string, callback: (iofile: Api.IOFile) => void): void;
    }
}
declare module TypeScript.Api {
    class Buffer {
        static process(buffer): string;
    }
}
declare module TypeScript.Api {
    class IOSync implements Api.IIO {
        public readFile(path: string, callback: (iofile: Api.IOFile) => void): void;
    }
}
declare module TypeScript.Api {
    class IOAsync implements Api.IIO {
        public readFile(path: string, callback: (iofile: Api.IOFile) => void): void;
    }
}
declare module TypeScript.Api {
    class IORemoteAsync implements Api.IIO {
        public readFile(path: string, callback: (iofile: Api.IOFile) => void): void;
        private readFileFromDisk(path, callback);
        private readFileFromHttp(path, callback);
        private isHTTPS(path);
        private isUrl(path);
    }
}
declare module TypeScript.Api {
    class NullLogger implements TypeScript.ILogger {
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
}
declare module TypeScript.Api {
    class ConsoleLogger implements TypeScript.ILogger {
        public information(): boolean;
        public debug(): boolean;
        public warning(): boolean;
        public error(): boolean;
        public fatal(): boolean;
        public log(s: string): void;
    }
}
declare module TypeScript.Api {
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
declare module TypeScript.Api {
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
declare module TypeScript.Api {
    class Path {
        static isAbsoluteUrl(path: string): boolean;
        static isAbsoluteUrn(path: string): boolean;
        static isRootRelative(path: string): boolean;
        static isRelative(path: string): boolean;
        static toForwardSlashes(path: string): string;
        static relativeToAbsolute(absolute_parent_path: string, relative_path: string): string;
    }
}
declare module TypeScript.Api {
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
        public clone(): Diagnostic;
    }
}
declare module TypeScript.Api {
    class Unit {
        public path: string;
        public content: string;
        public diagnostics: Api.Diagnostic[];
        constructor(path: string, content: string, diagnostics: Api.Diagnostic[]);
        public hasError(): boolean;
    }
}
declare module TypeScript.Api {
    class SourceUnit extends Api.Unit {
        public remote: boolean;
        public syntaxChecked: boolean;
        public typeChecked: boolean;
        constructor(path: string, content: string, diagnostics: Api.Diagnostic[], remote: boolean);
        public references(): string[];
        public clone(): SourceUnit;
    }
}
declare module TypeScript.Api {
    class ReflectedType {
        public identifier: string;
        public name: string;
        public scope: string[];
        constructor(identifier: string);
    }
}
declare module TypeScript.Api {
    class Import extends Api.ReflectedType {
        public alias: string;
        constructor();
        static create(ast: TypeScript.ImportDeclaration): Import;
    }
}
declare module TypeScript.Api {
    class Type extends Api.ReflectedType {
        public arguments: Type[];
        public signature: Api.Method;
        public arrayCount: number;
        public resolved: boolean;
        constructor();
        private static qualifyName(ast);
        static create(ast: TypeScript.AST): Type;
    }
}
declare module TypeScript.Api {
    class Parameter extends Api.ReflectedType {
        public type: Api.Type;
        public isOptional: boolean;
        public isPublic: boolean;
        constructor();
        private static load_type(result, ast);
        static create(ast: TypeScript.Parameter): Parameter;
    }
}
declare module TypeScript.Api {
    class Method extends Api.ReflectedType {
        public parameters: Api.Parameter[];
        public returns: Api.Type;
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
declare module TypeScript.Api {
    class Variable extends Api.ReflectedType {
        public type: Api.Type;
        public isPublic: boolean;
        public isProperty: boolean;
        public isStatic: boolean;
        public isStatement: boolean;
        public isExpression: boolean;
        public isStatementOrExpression: boolean;
        public isExported: boolean;
        public isOptional: boolean;
        public comments: string[];
        constructor();
        private static load_comments(result, ast);
        private static load_type(result, ast);
        static create(ast: TypeScript.VariableDeclarator): Variable;
    }
}
declare module TypeScript.Api {
    class Interface extends Api.ReflectedType {
        public methods: Api.Method[];
        public variables: Api.Variable[];
        public parameters: string[];
        public extends: Api.Type[];
        public isExported: boolean;
        public comments: string[];
        constructor();
        private static load_comments(result, ast);
        private static load_parameters(result, ast);
        private static load_extends(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: TypeScript.InterfaceDeclaration): Interface;
    }
}
declare module TypeScript.Api {
    class Class extends Api.ReflectedType {
        public methods: Api.Method[];
        public variables: Api.Variable[];
        public parameters: string[];
        public extends: Api.Type[];
        public implements: Api.Type[];
        public isExported: boolean;
        public comments: string[];
        constructor();
        private static load_comments(result, ast);
        private static load_parameters(result, ast);
        private static load_extends(result, ast);
        private static load_implements(result, ast);
        private static load_methods(result, ast);
        private static load_variables(result, ast);
        static create(ast: TypeScript.ClassDeclaration): Class;
    }
}
declare module TypeScript.Api {
    class Module extends Api.ReflectedType {
        public imports: Api.Import[];
        public modules: Module[];
        public interfaces: Api.Interface[];
        public classes: Api.Class[];
        public methods: Api.Method[];
        public variables: Api.Variable[];
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
declare module TypeScript.Api {
    class Script extends Api.ReflectedType {
        public modules: Api.Module[];
        public interfaces: Api.Interface[];
        public classes: Api.Class[];
        public methods: Api.Method[];
        public variables: Api.Variable[];
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
declare module TypeScript.Api {
    class CompiledUnit extends Api.Unit {
        public ast: TypeScript.AST;
        public sourcemap: string;
        public references: string[];
        public script: Api.Script;
        constructor(path: string, content: string, diagnostics: Api.Diagnostic[], ast: TypeScript.AST, sourcemap: string, script: Api.Script, references: string[]);
    }
}
declare module TypeScript.Api {
    class Node {
        public path: string;
        public references: string[];
        constructor();
    }
    class Topology {
        static graph(units: Api.SourceUnit[]): Node[];
        static sort(units: Api.SourceUnit[]): Api.SourceUnit[];
    }
}
declare module TypeScript.Api {
    class LoadParameter {
        public parent_filename: string;
        public filename: string;
        constructor(parent_filename: string, filename: string);
    }
    class Resolver {
        public io: Api.IIO;
        public logger: TypeScript.ILogger;
        private pending;
        private closed;
        private units;
        constructor(io: Api.IIO, logger: TypeScript.ILogger);
        public resolve(sources: string[], callback: (units: Api.SourceUnit[]) => void): void;
        private load(callback);
        private next(callback);
        private visited(parameter);
    }
}
declare module TypeScript.Api {
    class CompilerOptions {
        public logger: TypeScript.ILogger;
        public languageVersion: TypeScript.LanguageVersion;
        public moduleGenTarget: TypeScript.ModuleGenTarget;
        public generateDeclarationFiles: boolean;
        public mapSourceFiles: boolean;
        constructor();
    }
}
declare module TypeScript.Api {
    class CompilerCache {
        public compiler: TypeScript.TypeScriptCompiler;
        public units: Api.SourceUnit[];
        constructor(compiler: TypeScript.TypeScriptCompiler);
        public get_cached_unit(path: string): Api.SourceUnit;
        public is_in_cache(path: string): boolean;
        private compare(a, b);
        public refresh(units: Api.SourceUnit[]): void;
        private syntaxCheck(unit);
        private typeCheck(unit);
        private type_and_syntax_checking();
        public update(units: Api.SourceUnit[]): void;
        public reevaluate_references(): void;
    }
}
declare module TypeScript.Api {
    class TypeResolver {
        private static resolve_type(module_scope_stack, type);
        private static resolve_local_scope(scripts);
        private static resolve_global_scope(scripts);
        static resolve(scripts: Api.Script[]): void;
    }
}
declare module TypeScript.Api {
    class Emitter {
        public files: string[];
        constructor();
        public writeFile(fileName: string, contents: string, writeByteOrderMark: boolean): void;
        public directoryExists(path: string): boolean;
        public fileExists(path: string): boolean;
        public resolvePath(path: string): string;
    }
    class CompilerEmitter {
        public compiler: TypeScript.TypeScriptCompiler;
        public cache: Api.CompilerCache;
        public emitter: Emitter;
        constructor(compiler: TypeScript.TypeScriptCompiler, cache: Api.CompilerCache);
        private get_content(unit);
        private get_declararion(unit);
        private get_source_map(unit);
        private get_reflection(unit, ast);
        public emit(): Api.CompiledUnit[];
    }
}
declare module TypeScript.Api {
    class Compiler {
        public options: Api.CompilerOptions;
        public compiler: TypeScript.TypeScriptCompiler;
        public logger: TypeScript.ILogger;
        public cache: Api.CompilerCache;
        public emitter: Api.CompilerEmitter;
        constructor(options: Api.CompilerOptions);
        private passes;
        public compile(sourceUnits: Api.SourceUnit[], callback: (compiledUnits: Api.CompiledUnit[]) => void): void;
    }
}
