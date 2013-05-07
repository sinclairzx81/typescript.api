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

The following will register the *.ts extension with require(). When calls to require() are made
to *.ts files, any source resolution and/or compilation errors will be written out to the console
by default.

If resolution or compilation errors do exist, the call to require() will return an empty object.

```javascript
require("typescript.api").register();

var program = require("./program.ts");
```

### manual compilation

The following is an example of using the api to compile a source file named 'program.ts'. 

The process will first resolve 'program.ts' and all its referenced sources files. The resolved 
sources (units) then checked prior to being send to the compiler for compilation. Once compiled,
the compilation is checked again for problems prior to being run.

```javascript
var typescript = require("typescript.api");

// show diagnostic errors.
function show_diagnostics (units) {

	for(var n in units) {
	
		for(var m in units[n].diagnostics) {
		
			console.log( units[n].diagnostics[m].toString() );
		}
	}
}

typescript.resolve(['./program.ts'], function(units) {
	
	if(!typescript.check(units)) {
	
		show_diagnostics(units);
	}
	else {
		
		typescript.compile(units, function(compilation) {
			
			if(!typescript.check(compilation)) {
			
				show_diagnostics (compilation);
			}
			else
			{			
				typescript.run(compilation, null, function(context) {
				
					 // exports are available on the context...
				});
			}
		});
	}
});
```

## reference

### typescript.resolve (sources, callback)

Will resolve source units by traversing each source files reference element.

__Arguments__

* sources - An array of source filenames. 
* callback(units) - A callback with the resolved units.

__Example__

The following will resolve 'program.ts' and log each referenced source file to 
the console.

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

### typescript.check (units)

Checks source units for diagnostic errors. 

__Arguments__

* units - units to be checked. 
* returns - true if ok. 

__Example__

The following example will check if both a resolve() and compile() is successful.

```javascript
var typescript = require("typescript.api");

typescript.resolve(["program.ts"], function(units) { 

	if(typescript.check (units)) {
		
		typescript.compile(units, function(compilation) {
		
			if( typescript.check (compilation) ) {
			
				typescript.run(compilation, null, function(context) {
					
				});
			}
		});
	}
});
```

### typescript.create ( filename, code )

Will create a unit from the supplied filename and source code.

__Arguments__

* filename - A filename that other units can reference.
* code - The source code for this unit.

__Example__

The following will create a unit. and send to the compiler for compilation. 
The compilation is then run.

```javascript
var typescript = require("typescript.api");

var unit = typescript.create("temp.ts", "console.log('hello world');");

typescript.compile([unit], function(compilation) {

	typescript.run(compilation, null, function(context) { 
		
		// will output hello world..
	});
	
});
```

### typescript.compile ( units, callback )

Compiles source units. 

__Arguments__

* units - An array of source units. 
* callback - A callback that passes the compiled output.

__Example__

The following will first create and compile a unit, and compiled source is
written to the console.

```javascript
var typescript = require("typescript.api");

var unit = typescript.create("temp.ts", "var value:number = 123;");

typescript.compile([unit], function(compilation) {

	for(var n in compilation){
	
		console.log(compilation[n].content);
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

The following will resolve the source file 'program.ts', compile it, then reflect its
meta data to the console as a JSON string.

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

* compilation - The compilation to be run.
* sandbox - A sandbox. pass null to inherit the current sandbox.
* callback - A callback that passes a context containing any exported variables and function.

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
