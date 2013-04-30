module TypeScript.Api {
	
	export class TextWriter implements ITextWriter {

		public buffer   : string[] = [];

		public temp     : string = "";

		public Write(s:string) : void  {

			this.temp += s;
		}

		public WriteLine(data) : void  {

			this.buffer.push(this.temp + data);
			
			this.temp = "";
		}

		public Close() : void {

			if (this.temp.length > 0)  { 
			
				this.buffer.push(this.temp);
				
			}

			this.temp = "";
		}
		
		public ToString() : string {
		
			return this.buffer.join('\n');
		}
	}	
}