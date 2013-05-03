# typescript.api

The typescript.api is a lightweight api that enables nodejs developers to compile 
and run typescript source code. 

## install

```javascript
npm install typescript.api
```

## compiler version

TypeScript 0.9 alpha

## quick start

### registering typescript extension

The following will register the *.ts extension with require(). Compilation errors
will be written to the console, and module will be resolve, compiled and executed
synchronously.

```javascript

	var typescript = require("typescript.api");

	typescript.register();

	var mymodule = require("./program.ts");

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
	typescript.units.resolve(sources, function(units) {
		typescript.compile(units, function(compilation) {
			if(!has_errors (compilation) ) {
				typescript.run(compilation, null, function(context) {
					 // exported members available on the context...
				});
			}
		});
	});

```

## reference

### typescript.units.resolve (sources, callback)

Will resolve compilation units by crawling the document space. 

__Arguments__

* sources - An array of source filenames. 
* callback(units) - A callback with located units.

__Example__

Will resolve 'program.ts' and print all referenced source files.

```javascript

	typescript.units.resolve(["program.ts"], function(units) { 
		for(var n in units) {
			console.log( units[n].path );
			console.log( units[n].content );
			for(var m in units[n].references) {
				console.log( units[n].references[m] )
			}
		}
	});
	
```

### typescript.units.create  ( filename, code )

Will create a unit from the supplied filename and source code.

__Arguments__

* filename - The filename for this unit.
* code - Source code for this unit.

__Example__

The following will create a unit. and send to the compiler for compilation.

```javascript

	var unit = typescript.units.create("temp.ts", "console.log('hello world');");

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

	var unit = typescript.units.create("temp.ts", "var value:number = 123;");

	typescript.compile([unit], function(compilation) {
		for(var n in compilation.scripts){
			console.log(compilation.scripts[n]);
		}
	});
	
```

### typescript.run ( compilation, sandbox, callback )

Runs a compilation. 

__Arguments__

* compilation - The compilation to be executed.
* sandbox - A sandbox. pass null to inherit the current sandbox.
* callback - A callback that passes a content containing exported 
		     members of the executed code. 

__Example__

The following will first create and compile a unit, then send it off
for compilation.

```javascript
	
	var unit = typescript.units.create("temp.ts", "export var value:number = 123;");

	typescript.compile([unit], function(compilation) {
		typescript.run(compilation, null, function(context) { 
			console.log(context.value);
		});
	});
	
```
