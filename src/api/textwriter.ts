// Acid Frameworks.  All rights reserved.
// 
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

module TypeScript.Api {

	///////////////////////////////////////////////////////////////////////
	// TextWriter : Implementation of a simple TextWriter.
	///////////////////////////////////////////////////////////////////////		
	export class TextWriter implements ITextWriter {

		public buffer   : string[] = [];
		public temp     : string = "";

		public Write(text:string) : void  {
			this.temp += text;
		}

		public WriteLine(text) : void  {
			this.buffer.push(this.temp + text);
			this.temp = "";
		}

		public Close() : void {
			if (this.temp.length > 0)  { 
				this.buffer.push(this.temp);
			}

			this.temp = "";
		}
		
		public ToString() : string {
			return this.buffer.join('\n');
		}
	}	
}