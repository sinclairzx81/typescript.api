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

module TypeScript.Api.Units 
{
	export class Diagnostic
	{
		public line_index:number;
		public char_index:number;
		
		constructor(public type       : string,
				    public path       : string,
					public text       : string,
					public message    : string) 
		{
			this.line_index = 0;
			this.char_index = 0;
  	    }		
		
		public computeLineInfo(content:string, start:number) : void 
		{
			for(var i = 0; i < start; i++) 
			{
				var ch = content[i];
				
				if(ch == '\r\n') 
				{
					this.line_index += 1;
					this.char_index =  0
					i += 1;
				}
				if(ch == '\n') 
				{
					this.line_index += 1;
					this.char_index =  0;				
				}
				
				this.char_index += 1;
			}
		}
		
		public toString() : string {
			
			return this.path + " [" + (this.line_index + 1).toString() 
						     + ":" +  (this.char_index + 1).toString() + "] " + this.message;
		}
	}		

}