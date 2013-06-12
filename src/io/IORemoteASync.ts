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
	var _fs    = require('fs');
	
	var _url   = require('url');
	
	var _http  = require('http');
	
	var _https = require('https');
	
	export class IORemoteAsync implements IIO  
	{
		public readFile(path : string, callback : { ( iofile : TypeScript.Api.IO.IOFile ) : void; }): void 
		{
			if(this.isUrl(path)) 
			{
				this.readFileFromHttp(path, callback);
				
				return;
			}
			
			this.readFileFromDisk(path, callback);
		}
		
		private readFileFromDisk(path : string, callback : {(iofile : TypeScript.Api.IO.IOFile) : void; }) : void 
		{
			_fs.readFile(path, (error, data) => 
			{
				if (error) 
				{
					var text    = "could not resolve source unit.";
					
					var message = "could not resolve source unit " + path + ".";
				    
					var error   = new TypeScript.Api.IO.IOFileError(text, message);				
				
					callback( new TypeScript.Api.IO.IOFile (path, null, [error], false) ); 
				} 
				else
				{
					callback( new TypeScript.Api.IO.IOFile(path, TypeScript.Api.IO.Buffer.process (data), [], false) ); 
				}
			});			
		}
		
		private readFileFromHttp(path : string, callback:{( iofile : TypeScript.Api.IO.IOFile ) : void; }) : void 
		{
			var url      = _url.parse(path);
			
			var protocol = _http;
			
			var options  = { host : url.host, port : url.port, path : url.path, method : 'GET' };
			
			if( this.isHTTPS ( path ) ) 
			{
				protocol 	 = _https;
				
				options.port = 443;
			}
			
			var request = protocol.request(options, (response) => 
			{
				var data = [];
				
				response.on('data', (chunk) => 
				{ 
					data.push(chunk); 
				});
				
				response.on('end', () => 
				{ 
					callback( new TypeScript.Api.IO.IOFile (path, TypeScript.Api.IO.Buffer.process( data.join('') ), [], true) );  
				});
			});
			
			request.on('error', (error) => 
			{
				var text = "could not resolve source unit.";
				
				var message = "could not resolve source unit " + path + ".";
			
				var error   = new TypeScript.Api.IO.IOFileError(text, message);				
				
				callback( new TypeScript.Api.IO.IOFile (path, null, [error], true) ); 
			});
			
			request.end();  
		}
		
		private isHTTPS (path:string) : boolean 
		{
			if(path.indexOf('https://') == 0) 
			{
				return true;
			}
			
			return false;
		}
		
		private isUrl (path:string) : boolean 
		{
			var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp[s]?:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
			
			return regex.test(path);
		}		
	}
}