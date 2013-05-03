module application.collections {
	
	export class List<T> {
		public values : T[];
		
		constructor(){
			this.values = [];
		}
		public add(value:T): void {
			this.values.push(value);
		}
		public remove(value:T): void {
			for(var n in this.values){
				if(this.values[n] == value){
					this.values.splice(n, 1);
				}
			}
		}
		public each(callback:{(value:T): void;}): void{
			for(var n in this.values) {
				callback(this.values[n]);
			}
		}
	}
}