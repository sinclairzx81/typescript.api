module TypeScript.Api {
	
	var _path = require("path");
	
	// Path : static path helper utilities.
	export class Path {
	
		// checks to see if the path is a absolute url.
		public static isAbsoluteUrl (path:string) : boolean {
			var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp[s]?:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
			return regex.test(path);
		}
		
		// checks to see if this path is a absolute urn.
		public static isAbsoluteUrn (path:string): boolean {
			var regex = new RegExp("^(?:[a-xA-Z]:(/|\))|(?:file://)");
			return regex.test(path);	
		}
		
		// checks to see if this path is root relative.
		public static isRootRelative(path:string) : boolean {
			return path.indexOf('/') == 0 && path.indexOf('//') != 0;
		}
		
		// checks to see if this path is relative.
		public static isRelative(path:string) : boolean {
			if(!Path.isAbsoluteUrl(path)) {
				if(!Path.isAbsoluteUrn(path)) {
					if(!(path.indexOf('/') == 0)) {
						return true;
					}
				}
			}
			return false;				
		}
		
		// magical function to turn a relative path into a absolute by way
		// of its abaolute parent. if already a absolute path, just return.
		public static relativeToAbsolute (absolute_parent_path:string, relative_path:string) : string {
			if( Path.isRelative(relative_path) ) {		
				var absolute_parent_directory  = _path.dirname(absolute_parent_path);
				return _path.join(absolute_parent_directory, relative_path);			
			}
			return relative_path;
		}
	}
}