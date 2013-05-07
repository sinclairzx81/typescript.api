// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/// <reference path="../units/SourceUnit.ts" />
/// <reference path="IIO.ts" />
/// <reference path="Buffer.ts" />


module TypeScript.Api.IO 
{	
	var _fs = require('fs');
	
	export class IOSync implements IIO 
	{
		public readFile (path : string, callback : { ( sourceUnit:TypeScript.Api.Units.SourceUnit) : void; }): void 
		{
			
		
			try 
			{
				var data = _fs.readFileSync(path);
				
				callback( new TypeScript.Api.Units.SourceUnit(path, TypeScript.Api.IO.Buffer.process(data), [], false) );  
			} 
			catch(exception) 
			{
				var text = "could not resolve source unit.";
				
				var message = "could not resolve source unit " + path + ".";
			
				var diagnostic = new TypeScript.Api.Units.Diagnostic("resolve", path, text, message);			
				
				callback( new TypeScript.Api.Units.SourceUnit(path, null, [diagnostic], false) );  
			}
		}		
	}
}