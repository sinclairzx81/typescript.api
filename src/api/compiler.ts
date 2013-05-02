/// <reference path='decl/typescript.d.ts' />
/// <reference path='textwriter.ts' />
/// <reference path='diagnostics.ts' />
/// <reference path='resolver.ts' />
/// <reference path='emitter.ts' />

module TypeScript.Api {
	
	///////////////////////////////////////////////////////////////////////
	// Compilation : What a compiler outputs.
	///////////////////////////////////////////////////////////////////////	
	
	export class CompiledSourceUnit {
		public ast      : TypeScript.AST;
		public filename : string;
		public content  : string;
		
	}
	
	export class Compilation {
		public astlist	   : TypeScript.AST[];
		public diagnostics : TypeScript.Api.Diagnostic[];
		public scripts     : string[];
		constructor() {
			this.astlist     = [];
			this.scripts     = [];
			this.diagnostics = [];
		}
	}
	
	///////////////////////////////////////////////////////////////////////
	// Compiler : Api Compiler
	///////////////////////////////////////////////////////////////////////	

	export class Compiler {
		
		public compiler : TypeScript.TypeScriptCompiler;
		public logger   : ILogger;
		
		constructor(logger:TypeScript.ILogger)  {
			
			this.logger = logger;
			
			// arbitua
			var settings = new TypeScript.CompilationSettings();
			settings.codeGenTarget                  = TypeScript.LanguageVersion.EcmaScript5;
			settings.moduleGenTarget                = TypeScript.ModuleGenTarget.Synchronous;
			settings.disallowBool                   = true;
			
			var diagnosticMessages = TypeScript.diagnosticMessages; // localize these in future...
			
			this.compiler = new TypeScript.TypeScriptCompiler(this.logger, settings, diagnosticMessages);
			this.compiler.logger = logger; 
		} 
		
		public compile(units:SourceUnit [], callback: { (compilation:Compilation) : void;} ) : void {  
			
			//TypeScript.CompilerDiagnostics.diagnosticWriter = {  Alert : (message: string) => { this.logger.log(message); }};
			
			var compilation = new Compilation();
			
			for(var n in units) {
				
				var unit = units[n];
				
				// add source unit
				var snapshot   = TypeScript.ScriptSnapshot.fromString( unit.content );
				var references = TypeScript.getReferencedFiles(unit.path, snapshot);
				var document   = this.compiler.addSourceUnit(unit.path, snapshot, 0, false, references);		
				
				// run diagnostics
				var syntacticDiagnostics = this.compiler.getSyntacticDiagnostics(unit.path);
				var diagnostic_reporter = new TypeScript.Api.DiagnosticReporter(unit, this.logger );
				this.compiler.reportDiagnostics(syntacticDiagnostics, diagnostic_reporter);
				compilation.diagnostics = diagnostic_reporter.diagnostics;
			}
			
			// type check...
			this.compiler.pullTypeCheck();

			// emit the source code...
			var emitter = new TypeScript.Api.Emitter();
			
			this.compiler.emitAll(emitter, (inputFile: string, outputFile: string) : void => {
				 
				this.logger.log('[emitting] ' + outputFile);
			});
			
			// push script ast on astlist
			
			compilation.astlist = this.compiler.getScripts();
			
			// iterate files, push output on compilation scripts.
			
			for(var n in emitter.files) {
			
				compilation.scripts.push(emitter.files[n].ToString());
			}
			
			callback(compilation);
		}
	}
	
}




 
 




