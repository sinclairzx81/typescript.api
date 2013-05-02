module TypeScript.Api {

	///////////////////////////////////////////////////////////////////////
	// TextWriter : Implementation of a simple TextWriter.
	///////////////////////////////////////////////////////////////////////		
	export class TextWriter implements ITextWriter {

		public buffer   : string[] = [];
		public temp     : string = "";

		public Write(text:string) : void  {
			this.temp += text;
		}

		public WriteLine(text) : void  {
			this.buffer.push(this.temp + text);
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