module TypeScript.Api.IO {

	export class Buffer {
		
		public static process (buffer /* NodeBuffer or String */) : string {
		
			switch (buffer[0]) {
			
				case 0xFE:
				
					if (buffer[1] == 0xFF) {
					
						// utf16-be. Reading the buffer as big endian is 
						// not supported, so convert it to Little Endian first
						
						var i = 0;
						
						while ((i + 1) < buffer.length) {
						
							var temp = buffer[i];
							
							buffer[i] = buffer[i + 1];
							
							buffer[i + 1] = temp;
							
							i += 2;
						}
						
						return buffer.toString("ucs2", 2);
						
					}
					
					break;
				case 0xFF:
				
					if (buffer[1] == 0xFE) {
					
						// utf16-le 
						return buffer.toString("ucs2", 2);
					}
					
					break;
					
				case 0xEF:
				
					if (buffer[1] == 0xBB) {
					
						// utf-8
						return buffer.toString("utf8", 3);
					}
			}
			
			// Default behaviour
			return buffer.toString();
		}	
	}
}