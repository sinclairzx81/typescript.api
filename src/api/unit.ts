/// <reference path='decl/typescript.d.ts' />

module TypeScript.Api {
	
	///////////////////////////////////////////////////////////////////////
	// SourceUnit : Return object for the CodeResolver.
	///////////////////////////////////////////////////////////////////////		
	export class SourceUnit implements IResolvedFile {
		public content    : string;
		public path       : string;
		public remote     : boolean;
		public error      : string;
		public references : string[];
		
		public load_references() : void {
			this.references = [];
			var lines :string[] = this.content.split('\r\n');
			if (lines.length === 1) {
				lines = this.content.split('\n');
			}
			for(var n in lines) {
				var reference_pattern = /^(\/\/\/\s*<reference\s+path=)('|")(.+?)\2\s*(static=('|")(.+?)\2\s*)*\/>/gim;
				var match = reference_pattern.exec(lines[n]);
				if(match) {
					this.references.unshift( match[3] );
				}
			}
		}
	}
}