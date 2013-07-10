// Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
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

module TypeScript.Api.IO {

    // Microsoft Buffer Implementation.
	export class Buffer {
		
		public static process (buffer /* NodeBuffer or String */) : string {
		
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
}