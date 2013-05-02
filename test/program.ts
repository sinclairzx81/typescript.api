/// <reference path='decl/node.d.ts' />
/// <reference path='data.ts' />

module application {

	export class Program {
	
		public static Main(args:string) : void {
		
			console.log('application main');
			
			var mongo = new application.data.Mongo();
			
			
		}
	}
}

application.Program.Main([]);



 