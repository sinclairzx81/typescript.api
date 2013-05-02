/// <reference path="collections.ts" />


module application {
	export class program {
		public static main(args:string[]) : void  {
			 var list = new application.collections.List<number>();
			 list.add(123);
			 list.add(123);
			 list.add(123);
			 list.each((n)=> 
				console.log(n.toString());
			 });
		}
	}
}


application.program.main([]);






 