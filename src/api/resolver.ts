/// <reference path='../compiler/typescript.ts'/>
/// <reference path='../compiler/io.ts'/>

module TypeScript.Api {

	export class Resolver {
		
		constructor(public ioHost:IIO, 
					public sources:string[]) { }
		
		public resolve(callback: {( files:IResolvedFile[]): void; }) : void{
			
			// todo: implement resolver, return files.
			//for(var n in this.sources) {
			//	var code       = this.ioHost.readFile(this.sources[n]);
			//	var snapshot   = TypeScript.ScriptSnapshot.fromString( code );
			//	var references = TypeScript.getReferencedFiles(this.sources[n], snapshot);
			//	console.log(references);
			//	for(var m in references) {
			//		
			//	}
			//}	

			callback([]);
		
		}
		
	}

}

