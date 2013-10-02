/*--------------------------------------------------------------------------

Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

--------------------------------------------------------------------------*/

/// <reference path="references/node.d.ts" />
/// <reference path="references/typescript.d.ts" />

//----------------------------------------
// nodejs core modules
//----------------------------------------
var node = {

    path : require('path'),

    fs   : require('fs'),

    net  : require('net'),

    util : require('util'),

    http : require('http'),

    https: require('https'),

    url  : require('url'),

    vm   : require('vm')
}

//----------------------------------------
// typescript compiler services
//----------------------------------------

var shim = () : any => {

    var sandbox = {

        __filename  : __filename,

        __dirname   : __dirname,

        global	    : global,

        process     : process,

        require     : require,

        console     : console,

        exports     : null,

        setInterval : setInterval,

        setTimeout  : setTimeout
    }
    
	var typescript_filename = require.resolve('typescript');
	
    var source = node.fs.readFileSync(typescript_filename, 'utf8');

    var script = node.vm.createScript(source.concat('\n\nexports =  TypeScript;'), typescript_filename);
	
    script.runInNewContext( sandbox );
	
    return sandbox.exports;
}

var typescript: typeof TypeScript = shim();




