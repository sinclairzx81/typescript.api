// Copyright (c) sinclair 2013.  All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/// <reference path="IIO.ts" />
/// <reference path="Buffer.ts" />
/// <reference path="IOFile.ts" />

module TypeScript.Api.IO 
{	
	var _fs = require('fs');
	
	export class IOSync implements IIO 
	{
		public readFile (path : string, callback : { ( iofile : TypeScript.Api.IO.IOFile ) : void; }): void 
		{
			try 
			{
				var data = _fs.readFileSync(path);
				
				callback( new TypeScript.Api.IO.IOFile (path, TypeScript.Api.IO.Buffer.process(data), [], false) );  
			} 
			catch(exception) 
			{
				var text    = "could not resolve source unit.";
					
				var message = "could not resolve source unit " + path + ".";
				    
				var error   = new TypeScript.Api.IO.IOFileError(text, message);				
				
				callback( new TypeScript.Api.IO.IOFile (path, null, [error], false) );  
			}
		}		
	}
}