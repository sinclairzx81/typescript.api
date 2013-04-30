module TypeScript.Api {

	export class Logger implements TypeScript.ILogger {

		public ioHost : IIO;
		
		constructor(ioHost:IIO) {
		
			this.ioHost = ioHost;
		}
		
		public information() : boolean { 
			
			return false; 
			
		}
		
		public debug() : boolean {
		
			return false; 
		}
		
		public warning() : boolean { 
		
			return false; 
		}
		
		public error()  : boolean { 
		
			return false; 
		}
		
		public fatal(): boolean { 
		
			return false; 
		}
		
		public log(s: string): void {
		
			this.ioHost.stdout.WriteLine(s);
			
		}
	}

}