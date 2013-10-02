# typescript.api

A compiler as a service api enabling nodejs developers to programatically resolve, compile, reflect and run typescript 0.9 source files in memory.

## install

```javascript
npm install typescript.api
```

## compiler version

TypeScript 0.9.1-1

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
### overview

* [manual compilation](#manual_compilation)
* [declarations](#declarations)

### units

* [source unit](#source_unit)
* [compiled unit](#compiled_unit)

### methods

* [reset](#reset)
* [register](#register)
* [create](#create)
* [resolve](#resolve)
* [compile](#compile)
* [check](#check)
* [run](#run)
* [sort](#sort)

<a name="manual_compilation" />
### manual compilation

The following is an example of using the api to compile a source file named 'program.ts'. 

The process will first resolve 'program.ts' and all its referenced sources files. The resolved 
sources array (resolved) are then checked prior to being sent to the compiler for compilation. Once compiled,
the compilation is checked again for problems prior to being run.

```javascript
var tsapi = require("typescript.api");

// show diagnostic errors.
function show_diagnostics (units) {

	for(var n in units) {

		for(var m in units[n].diagnostics) {

			console.log( units[n].diagnostics[m].toString() );
		}
	}
}

tsapi.resolve(['./program.ts'], function(resolved) {

	if(!tsapi.check(resolved)) {

		show_diagnostics(resolved);

	}
	else {
	
		tsapi.compile(resolved, function(compiled) {

			if(!tsapi.check(compiled)) {

				show_diagnostics (compiled);
			}
			else
			{			
				tsapi.run(compiled, null, function(context) {

					 // exports are available on the context...
				});
			}
		});
	}
});
```

<a name="declarations" />
### declarations

It is important to note that the typescript.api does not automatically reference any declarations (such as lib.d.ts) for compilation. 
Because of this, you will need to reference the appropriate *.d.ts required by your application for compilation. This is unlike the 
tsc command line compiler which will, by default reference the lib.d.ts declaration if not stated otherwise. (see --noLib option). 

In the context of nodejs, the dom declarations declared in lib.d.ts are unnessasary and dramatically slow compilation times. The
typescript.api splits these declarations out to provide suitable environment declarations that you can reference in your project.

The typescript.api comes bundled with following declarations:

```javascript
// ecma api + html dom declarations (suitable for browser development)
[node_modules]/typescript.api/decl/lib.d.ts 

// ecma api + node.d.ts declarations (suitable for nodejs development)
[node_modules]/typescript.api/decl/node.d.ts

// ecma api only.
[node_modules]/typescript.api/decl/ecma.d.ts 

// typescript.api declarations.
[node_modules]/typescript.api/decl/typescript.api.d.ts
```

It is recommended that developers copy the appropriate declarations suitable for their environment into their project structure and
reference them accordingly. 

For a full definition of this api, see  [typescript.api.d.ts](https://github.com/sinclairzx81/typescript.api/blob/master/src/resources/typescript.api.d.ts)

For other additional declarations, see the [definitely typed](https://github.com/borisyankov/DefinitelyTyped) project.

## units

<a name="source_unit" />
### source unit

The typescript.api accepts source units for compilation. A source unit consists of the following properties: 

```javascript

sourceUnit = {

	path          : string,   // (public) the path of this source unit.

	content       : string,   // (public) the typescript source of this unit.

	remote        : boolean,  // (public) if this source file is loaded over http.

	references    : Function  // (public) returns an array of references for this source unit.

	diagnostics   : [object], // (public) compilation errors for this unit. 0 length if none.
};

```

note: For manually creating source units, see [create](#create)

note: For loading source units from disk. see [resolve](#resolve)

<a name="compiled_unit" />
### compiled unit

A compiled unit is the output from a [compilation](#compile). A compiled unit consists of the following properties:

```javascript

compiledUnit = {

	path          : string,   // (public) the path of this unit.

	content       : string,   // (public) the javascript source of this unit.

	references    : string[], // (public) an array of references for this unit.

	diagnostics   : [object], // (public) compilation errors for this unit. 0 length if none.

	ast           : object,   // (public) AST for this unit.

	sourcemap     : string,   // (public) The sourcemap for this unit.

	declaration   : string,   // (public) The declaration file for this unit.

	script        : object,   // (public) reflected metadata for this unit.
};

```

## methods

<a name="reset" />
### reset (options)

Resets the compiler. Optionally allows the caller to set compiler options.  

```javascript	

var tsapi = require("typescript.api")

tsapi.reset()
```

Additionally, It is possible to specify reset with the following options. all of which are optional.

```javascript

var tsapi = require("typescript.api")

tsapi.reset({

    languageVersion          : "EcmaScript5", // (default)EcmaScript5 | EcmaScript3

    moduleGenTarget			 : "Synchronous", // (default)Synchronous | ASynchronous

    removeComments			 : true,          // (default) true

    generateDeclarationFiles : false,		  // (default) false

    mapSourceFiles           : false,         // (default) false

	noImplicitAny            : false,         // (default) false

	allowBool                : false,         // (default) false

	outputMany               : true           // (default) true

})

```

<a name="register" />
### typescript.register ()

The register() method will register the typescript file extension with nodejs require(). When using this 
method, the api will automatically JIT compile your typescript source code on first request and cache 
for subsequent requests. 

```javascript

//---------------------------------
// program.ts
//---------------------------------

export var message:string = 'hello world';

//---------------------------------
// app.js
//---------------------------------

require('typescript.api').register();

var program = require('./program.ts');

console.log(program.message); // hello world
```


<a name="resolve" />
### resolve (sources, callback)

The typescript.api resolve function will resolve source units needed for compilation and return them
in order of dependancy, it does this by scanning each files reference element. 

special note: the resolve method will be unable to resolve source units if your code contains circular 
references. for example, if file0.ts references file1.ts, and file1.ts references file0.ts, then this would
be considered a circular reference. in these instances, the resolve() method will return the source units 
found in order of discovery, and no additional dependency resolution will occur. 

__arguments__

* sources - A filename, or a array of filenames to resolve. 
* callback(units) - A callback which passes the resolved source units.

__example__

The following will resolve 'program.ts' and log each referenced source file to 
the console.

```javascript
var tsapi = require("typescript.api");

tsapi.resolve(["program.ts"], function(resolved) { 

	for(var n in resolved) {

		console.log( resolved[n].path ); // the source files path
		
		console.log( resolved[n].content ); // the source files content (typescript)
		
		for(var m in resolved[n].references) {
		
			console.log( resolved[n].references[m] ) // paths to referenced source files.
			
		}
	}
});
```
<a name="check" />
### check (units)

A utility method to check for errors in either resolved or compiled units.

__arguments__

* units   - units to be checked. 
* returns - true if ok. 

__example__

The following example will check if both a resolve() and compile() is successful.

```javascript
var tsapi = require("typescript.api");

tsapi.resolve(["program.ts"], function(resolved) { 

	if( tsapi.check (resolved)) { // check here for reference errors.
		
		tsapi.compile(resolved, function(compiled) {
		
			if( tsapi.check (compiled) ) { // check here for syntax and type errors.
			
				tsapi.run(compiled, null, function(context) {
					
				});
			}
		});
	}
});
```

<a name="create" />
### create ( filename, code )

Creates a source unit from a string. 

__arguments__

* filename - A filename that other units may reference.
* code	   - The source code for this unit.

__returns__

* unit	   - A source unit.

__example__

The following will create a unit. and send to the compiler for compilation. 
The compilation is then run.

```javascript
var tsapi = require("typescript.api");

var sourceUnit = tsapi.create("temp.ts", "export var message = 'hello world'");

tsapi.compile([sourceUnit], function(compiled) {

	tsapi.run(compiled, null, function(context) { 
		
		console.log(context.message); // outputs hello world
	})
})

```

<a name="compile" />
### compile ( units, callback )

compiles source units. 

__arguments__

* units	   - An array of source units. 
* callback - A callback that passed the compiled output.

__example__

The following will first create and compile a unit, and compiled source is
written to the console.

```javascript

var tsapi = require("typescript.api");

var sourceUnit = tsapi.create("temp.ts", "var value:number = 123;");

tsapi.compile([sourceUnit], function(compiled) {

	for(var n in compiled) {
	
		console.log(compiled[n].content);
	}
});
```

<a name="run" />
### run ( compiledUnits, sandbox, callback )

executes compiled units within a nodejs vm and returns a context containing exported members.

__arguments__

* compiledUnits - compiled source units - (obtained from a call to compile)
* sandbox	    - A sandbox. pass null to inherit the current sandbox. code in executed in nodejs vm.
* callback      - A callback that passes a context containing any exported variables and function.

__example__

The following will first create and compile a unit, then send it off
for compilation.

```javascript

var tsapi = require("typescript.api");	

var sourceUnit = tsapi.create("temp.ts", "export var value:number = 123")

tsapi.compile([sourceUnit], function(compiled) {

	tsapi.run(compiled, null, function(context) { 
	
		console.log(context.value) // outputs 123

	})
})
```

<a name="sort" />
### sort ( units )

Will attempt to sort source units in order of dependency. If cyclic referencing
occurs, the sort will return the units in order in which they are received.

__arguments__

* units - An array of source units to be sorted.
* returns - the sorted units in order of dependency.

__example__

The following will create a series of source units which reference each other
as in the following graph. The units are first randomized and then sorted. The 
resulting sort will be the order of a, b, c, d, e, f. 

```javascript
/*
         [a]
        /   \
      [b]   [c]
     /   \ /   \
   [d]   [e]   [f]
*/
function shuffle(o) {  
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var tsapi = require("typescript.api")

var units = [
    tsapi.create("a.ts", ""),
    tsapi.create("b.ts", "/// <reference path='a.ts' />"),
    tsapi.create("c.ts", "/// <reference path='a.ts' />"),
    tsapi.create("d.ts", "/// <reference path='b.ts' />"),
    tsapi.create("e.ts", "/// <reference path='b.ts' />\n/// <reference path='c.ts' />\n"),
    tsapi.create("f.ts", "/// <reference path='c.ts' />"),
];

// shuffle
units = shuffle(units);

// sort
units = tsapi.sort(units);

// display
for (var n in units)  {

    console.log(units[n].path);
}
```
