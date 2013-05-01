/// <reference path='decl/node.d.ts' />
/// <reference path='data.ts' />
// <reference path='../src/api/compiler.ts' />


module application {

	export class Program {
		
		public mongo : application.data.Mongo;
	
		public static Main(args:string) void {
		
			console.log('application main');
			
			var mongo = new application.data.Mongo();
			
			var data  = mongo.GetData();
			
			for(var n in data){
			
				console.log(data[n]);
			}
		}
	}
}

application.Program.Main([ ]);