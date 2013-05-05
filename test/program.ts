// <reference path='other.ts' />


//class Cat<T> {public v:Cat<number, Action<string>>;}

//module cat.foo { export class Cat {} }


//function method() : Action<cat.foo.Cat> { return null; }


class Test {

	v:Action<string>;

}

//module app.some {
//	class Animal<T,S> { 
		
//	}
//}

//module application.objects {
//	export class Animal {
		
//	}
//}
//var test:Animal<number, number> = null; // is ""
//var test = new Animal<number, number>(); // is null
//var test:Animal<number, number>;//= new Animal<number, number>(); // is ""
//var animal:application.objects.Animal<number, number, application.objects.Animal<string, application.objects.Animal<string, string, string>>>;//= new Animal<number, number>(); // is ""
//module cat.foo { export class Cat {} } var k:cat.foo.Cat;
//function method():Animal<number, string> { return null; }
 //var k:string;

//function void_method():void {}

/*
declare var Buffer: {
   new (str: string, encoding?: string): NodeBuffer;
   new (size: number): NodeBuffer;
   new (array: any[]): NodeBuffer;
   prototype: NodeBuffer;
   isBuffer(obj: any): boolean;
   byteLength(string: string, encoding?: string): number;
   concat(list: NodeBuffer[], totalLength?: number): NodeBuffer;
}
*/
