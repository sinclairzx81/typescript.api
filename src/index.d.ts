/// <reference path="Decl/typescript.d.ts" />
/// <reference path="Decl/typescript.api.d.ts" />
export declare var allowRemote: boolean;
export declare var debug: boolean;
export declare var compiler: TypeScript.Api.Compile.Compiler;
export declare var languageVersion: TypeScript.LanguageVersion;
export declare var moduleTarget: TypeScript.ModuleGenTarget;
export declare function check(units: TypeScript.Api.Units.Unit[]): boolean;
export declare function register(): void;
export declare function reset(): void;
export declare function create(path: string, content: string): TypeScript.Api.Units.SourceUnit;
export declare function resolve(sources: string[], callback: (units: TypeScript.Api.Units.SourceUnit[]) => void): void;
export declare function sort(sourceUnits: TypeScript.Api.Units.SourceUnit[]): TypeScript.Api.Units.SourceUnit[];
export declare function graph(sourceUnits: TypeScript.Api.Units.SourceUnit[]): TypeScript.Api.Resolve.Node[];
export declare function compile(sourceUnits: TypeScript.Api.Units.SourceUnit[], callback: (compiledUnit: TypeScript.Api.Units.CompiledUnit[]) => void): void;
export declare function reflect(compiledUnits: TypeScript.Api.Units.CompiledUnit[], callback: (reflection: TypeScript.Api.Reflect.Reflection) => void): void;
export declare function run(compiledUnits: TypeScript.Api.Units.CompiledUnit[], sandbox: any, callback: (context: any) => void): void;
export declare function build(filenames: string[], callback: (diagnostics: TypeScript.Api.Units.Diagnostic[], source: string, declaration: string) => void): void;
