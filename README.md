# typescript.api

A compiler as a service api enabling nodejs developers to resolve, compile, reflect and run typescript 0.9 source files.

## install

```javascript
npm install typescript.api
```

## compiler version

TypeScript 0.9 alpha

## quick start

### registering typescript extension

The following will register the *.ts extension with require(). Compilation errors
will be written to the console, and module will be resolved, compiled and executed
synchronously.

```javascript
var typescript = require("typescript.api");

typescript.register();

var program = require("./program.ts");
```

### manual compilation

The following is an example of using the api to compile the source file 'program.ts'. 

The process will first resolve 'program.ts' and all its reference sources. The resolved 
sources (units) are then passed to the compiler for compilation. The compilation object
is then sent to be run.

```javascript
var typescript = require("typescript.api");

var sources = ["./program.ts"];

function has_errors(compilation) {

	// errors can be listed on the compilation.diagnostics array.
	
	return compilation.diagnostics.length > 0; 
	
}

// resolve units...
typescript.resolve(sources, function(units) {
	
	// compile units...
	typescript.compile(units, function(compilation) {
		
		// check for errors...
		if(!has_errors (compilation) ) {
			
			// run the compilation...
			typescript.run(compilation, null, function(context) {
			
				 // exported members available on the context...
			});
		}
	});
});
```

## reference

### typescript.resolve (sources, callback)

Will resolve compilation units by iteratively walking the source files by way of their
<reference path='#'> elements. 

Will return a list of source units needed for compilation.

__Arguments__

* sources - An array of source filenames. 
* callback(units) - A callback with located units.

__Example__

Will resolve 'program.ts' and print all referenced source files.

```javascript
var typescript = require("typescript.api");

typescript.resolve(["program.ts"], function(units) { 

	for(var n in units) {
	
		console.log( units[n].path );
		
		console.log( units[n].content );
		
		for(var m in units[n].references) {
		
			console.log( units[n].references[m] )
			
		}
	}
});
```

### typescript.create ( filename, code )

Will create a unit from the supplied filename and source code.

__Arguments__

* filename - The filename for this unit.
* code - Source code for this unit.

__Example__

The following will create a unit. and send to the compiler for compilation.

```javascript
var typescript = require("typescript.api");

var unit = typescript.create("temp.ts", "console.log('hello world');");

typescript.compile([unit], function(compilation) {

	typescript.run(compilation, null, function(context) { });
	
});
```

### typescript.compile ( units, callback )

Compiles and produces javascript from the supplied units.

__Arguments__

* units - An array of units. 
* callback - A callback that passes the compiled output.

__Example__

The following will first create and compile a unit, and compiled source is
written to the console.

```javascript
var typescript = require("typescript.api");

var unit = typescript.create("temp.ts", "var value:number = 123;");

typescript.compile([unit], function(compilation) {

	for(var n in compilation.scripts){
	
		console.log(compilation.scripts[n]);
	}
});
```

### typescript.reflect ( compilation, callback )

Reflects compilation AST and produces meta data about the modules, classes, 
methods and variables contained within the compilation. 

__Arguments__

* units - The compilation to be reflected. 
* callback - A callback that passes the reflected metadata.

__Example__

The following will load the program.ts source file, compile it, then reflect. The reflected
metadata is written to the console as a JSON string.

```javascript
var typescript = require("typescript.api");

typescript.resolve(['program.ts'], function(units){

	typescript.compile(units, function(compilation) {
		
		typescript.reflect(compilation, function(reflection) {
			
			var json = JSON.stringify(reflection, null, ' ');
			
			console.log(json);
		});
	});
});
```

### typescript.run ( compilation, sandbox, callback )

Runs a compilation. 

__Arguments__

* compilation - The compilation to be executed.
* sandbox - A sandbox. pass null to inherit the current sandbox.
* callback - A callback that passes a content containing exported 

__Example__

The following will first create and compile a unit, then send it off
for compilation.

```javascript	
var typescript = require("typescript.api");	

var unit = typescript.create("temp.ts", "export var value:number = 123;");

typescript.compile([unit], function(compilation) {

	typescript.run(compilation, null, function(context) { 
	
		console.log(context.value);
		
	});
});
```
