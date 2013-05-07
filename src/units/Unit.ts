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

/// <reference path="Diagnostic.ts" />

module TypeScript.Api.Units
{
	export class Unit
	{
		public path        : string;
		public content     : string;
		public diagnostics : TypeScript.Api.Units.Diagnostic[];	
		
		constructor(path:string, content:string, diagnostics:TypeScript.Api.Units.Diagnostic[])
		{
			this.path 		 = path;
			this.content 	 = content;
			this.diagnostics = diagnostics;
		}
		
		public hasError() : boolean
		{
			if(this.diagnostics) 
			{
				return this.diagnostics.length > 0;
			}
			
			return false;
		}		
	}
}