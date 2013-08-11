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

//-------------------------------------------------------------------------
//
// typescript.api build script
//
// requires: TypeScript 0.9.1 command line compiler.
//
// notes:    run this script to build the typescipt.api. once 
//           built run "npm install typescript" inside
//           the ./bin directory.
//
//-------------------------------------------------------------------------

var tsc = require('./tools/compiler.js')

var io  = require('./tools/io.js')

//------------------------------------------------------------------------------------
// paths
//------------------------------------------------------------------------------------

var src_directory = './src'

var bin_directory = './bin'

//------------------------------------------------------------------------------------
// build
//------------------------------------------------------------------------------------

io.create_directory(bin_directory);

io.create_directory(bin_directory + '/decl')

tsc.build([src_directory + '/index.ts'], ['--removeComments'], bin_directory + '/index.js' , function() {

    io.license('./license.txt', bin_directory + '/index.js')

    io.copy(src_directory + '/resources/ecma.d.ts',           bin_directory + '/decl/ecma.d.ts')

    io.copy(src_directory + '/resources/lib.d.ts',            bin_directory + '/decl/lib.d.ts')

    io.copy(src_directory + '/resources/node.d.ts',           bin_directory + '/decl/node.d.ts')

    io.copy(src_directory + '/resources/typescript.api.d.ts', bin_directory + '/decl/typescript.api.d.ts')

    io.copy(src_directory + '/resources/typescript.d.ts',     bin_directory + '/decl/typescript.d.ts')

    io.copy('./readme.md',     bin_directory + '/readme.md')

    io.copy('./package.json',  bin_directory + '/package.json', function() {

        require('./app.js')
    })
})