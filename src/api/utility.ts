module TypeScript.Api {

		
		export class PathUtil {
			
			public static IsAbsoluteUrl (path:string) : boolean {
				
				var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
				
				return regex.test(path);
			}
			
			
			
		}

}