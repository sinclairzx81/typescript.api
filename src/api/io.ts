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

/// <reference path="decl/node.d.ts" />
/// <reference path="unit.ts" />

module TypeScript.Api {
	
	var _path  = require('path');
	var _fs    = require('fs');
	var _http  = require('http');
	var _https = require('https');
	var _url   = require('url');
	
	///////////////////////////////////////////////////////////////////////
	// Interface for IOAsync operations.
	///////////////////////////////////////////////////////////////////////	
	
	export interface IIOAsync {
	
		readFile(filename:string, callback:{( unit:SourceUnit) : void; }): void;
		
	}	
	
	///////////////////////////////////////////////////////////////////////
	// IOSync: Syncronous IO (used primarily for nodejs require()
	///////////////////////////////////////////////////////////////////////	
	
	export class IOSyncHost implements IIOAsync {
	
		public readFile (filename:string, callback:{(unit:SourceUnit) : void; }): void {
		
			try {
			
				var data = _fs.readFileSync(filename);
				
				callback( new SourceUnit(filename, processBuffer(data), false, null) );  
				
			} catch(exception) {
			
				callback( new SourceUnit(filename, null, false, exception) );  
			
			}
		}		
	}	
	 
	///////////////////////////////////////////////////////////////////////
	// IOAsyncHost: Provides local file read services.
	///////////////////////////////////////////////////////////////////////
	
	export class IOAsyncHost implements IIOAsync {
		
		public readFile (filename:string, callback: { (unit:SourceUnit) : void; } ): void {
			
			_fs.readFile(filename, (error, data) => {
			
				  if (!error) {
				  
					callback( new SourceUnit(filename, processBuffer(data), false, null) ); 
					
				  } else {
					
					callback( new SourceUnit(filename, null, false, error) );  
				  }
			  
			});			
		}	
	}
	
	///////////////////////////////////////////////////////////////////////
	// IOAsyncRemoteHost: Provides local and remote file read services.
	///////////////////////////////////////////////////////////////////////
	
	export class IOAsyncRemoteHost implements IIOAsync  {
		
		public readFile(filename:string, callback:{ ( unit:SourceUnit ) : void; }): void {
		
			if(this.isUrl(filename)) {
			
				this.readFileFromHttp(filename, callback);
				
				return;
			}
			
			this.readFileFromDisk(filename, callback);
		}
		
		private readFileFromDisk(filename:string, callback:{( unit:SourceUnit ) : void; }): void {
		
			_fs.readFile(filename, (error, data) => {
			
				  if (!error) {
				  
					callback( new SourceUnit(filename, processBuffer(data), false, null) ); 
					
				  } else {
					
					callback( new SourceUnit(filename, null, false, error) );  
				  }
			  
			});			
		}
		
		private readFileFromHttp(filename:string, callback:{( unit:SourceUnit ) : void; }): void {
		
			var url      = _url.parse(filename);
			
			var protocol = _http;
			
			var options  = { host : url.host, port : url.port, path : url.path, method : 'GET' };
			
			if(this.isHTTPS(filename)) {
			
				protocol 	 = _https;
				
				options.port = 443;
			}
			
			var request = protocol.request(options, (response) => {
			
				var data = [];
				
				response.on('data', (chunk) => { data.push(chunk); });
				
				response.on('end',  ()      => { 

					callback( new SourceUnit(filename, processBuffer( data.join('') ), true, null) );  
					
				});
			});
			
			request.on('error', (error) => {
			
				callback( new SourceUnit(filename, null, false, error) ); 
				
			});
			
			request.end();  
		}
		
		private isHTTPS (path:string) : boolean {
		
			if(path.indexOf('https://') == 0) {
			
				return true;
				
			}
			
			return false;
		}
		
		private isUrl (path:string) : boolean {
		
			var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp[s]?:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
			
			return regex.test(path);
		}		
	}
	
	///////////////////////////////////////////////////////////////////////
	// processBuffer : Handles file processing in the same way is tsc.
	///////////////////////////////////////////////////////////////////////
	function processBuffer(buffer) : string {
		switch (buffer[0]) {
			case 0xFE:
				if (buffer[1] == 0xFF) {
					// utf16-be. Reading the buffer as big endian is 
					// not supported, so convert it to Little Endian first
					var i = 0;
					while ((i + 1) < buffer.length) {
						var temp = buffer[i];
						buffer[i] = buffer[i + 1];
						buffer[i + 1] = temp;
						i += 2;
					}
					return buffer.toString("ucs2", 2);
				}
				break;
			case 0xFF:
				if (buffer[1] == 0xFE) {
					// utf16-le 
					return buffer.toString("ucs2", 2);
				}
				break;
			case 0xEF:
				if (buffer[1] == 0xBB) {
					// utf-8
					return buffer.toString("utf8", 3);
				}
		}
		// Default behaviour
		return buffer.toString();
	}		
}

