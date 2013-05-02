/// <reference path="decl/node.d.ts" />

module application.data {
	
	export interface IDataStore {
		get(): string[];
	}
	
	export class Mock implements IDataStore {
	
		constructor() { }
		
		public get():string[] {
			return ['a','b','c'];
		}
	}

}