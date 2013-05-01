////////////////////////////////////////////////////////////////////
//
// Note: will build the TypeScript.Api for TypeScript 0.9 alpha
//
// 	requires: the tsc 0.9 command line compiler...
//
////////////////////////////////////////////////////////////////////

var tools = require('./build/tools.js');

var path  = require('path');

// variables

var root            = path.dirname( global.process.mainModule.filename );

var src_dir         = path.join( root, "/src/");

var bin_dir         = path.join( root, "/bin");

// typescript sources...
var sources = [
	"diagnostics.ts",
	"flags.ts",
	"nodeTypes.ts",
	"hashTable.ts",
	"ast.ts",
	"astWalker.ts",
	"astWalkerCallback.ts",
	"astPath.ts",
	"types.ts",
	"base64.ts",
	"sourceMapping.ts",
	"emitter.ts",
	"declarationEmitter.ts",
	"precompile.ts",
	"pathUtils.ts",
	"referenceResolution.ts",
	"typecheck/dataMap.ts",
	"typecheck/pullFlags.ts",
	"typecheck/pullDecls.ts",
	"typecheck/pullSymbols.ts",
	"typecheck/pullSymbolBindingContext.ts",
	"typecheck/pullTypeResolutionContext.ts",
	"typecheck/pullTypeResolution.ts",
	"typecheck/pullTypeChecker.ts",
	"typecheck/pullDeclDiffer.ts",
	"typecheck/pullSemanticInfo.ts",
	"typecheck/pullDeclCollection.ts",
	"typecheck/pullSymbolBinder.ts",
	"typecheck/pullSymbolGraph.ts",
	"typecheck/SemanticDiagnostic.ts",
	"typecheck/pullHelpers.ts",	
	"syntaxTreeToAstVisitor.ts",
	"typescript.ts"
].map(function (f) { return path.join(src_dir, 'compiler' ,f); });

// typescript api sources...
sources.push(path.join(src_dir, 'api/compiler.ts' ) );

// build 
function build () {
	for(var i = 0; i < 40; i++) console.log();
	console.log('----------------------------------------------------------');
	console.log('compiling......' + src_dir);

	tools.builder.build(sources, path.join(bin_dir, 'typescript.api.js'), function() {
		  console.log('----------------------------------------------------------');
		  for(var i = 0; i < 3; i++) console.log();
		  tools.nodestart.start( path.join( root, "app.js" ) );
	});

}

// optional - run this to rebuild on source changes.
//tools.dirwatch.watch(src_dir, null, function() {

	//run_build();
	
//});

// run build on startup..

build();





