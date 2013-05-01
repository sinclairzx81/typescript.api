/// <reference path='../compiler/typescript.ts'/>
/// <reference path='../compiler/io.ts'/>
/// <reference path='path.ts' />

module TypeScript.Api {

	var _path  = require('path');
	var _fs    = require('fs');
	var _http  = require('http');
	var _https = require('https');
	var _url   = require('url');

	class PathUtil {
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
			if(!PathUtil.isAbsoluteUrl(path)) {
				if(!PathUtil.isAbsoluteUrn(path)) {
					if(!(path.indexOf('/') == 0)) {
						return true;
					}
				}
			}
			return false;				
		}
		// takes a guess at the protocol this path is refering too.
		public static protocol(path:string) : string {
			var regex = new RegExp("^(?:http[s]*)|(?:ftp[s]*)|(?:file)");
			var result = <any>path.match(regex);
			if(result) {
				if(result.index == 0){
					return result[0];
				}
			}
			if(PathUtil.isAbsoluteUrn(path) ){
				return "file";
			}
			return "";
		}		
	}
	
	class LoadOp {
		constructor(public parent_filename:string,     
					public filename       :string) {
			
		} 
	} 
	
	class AsyncLoader {
		constructor() { }
		// loads a source file from web..
		public fromWeb(context:any, op:LoadOp, callback:{(context:any, resolved:ResolvedFile) : void; }): void {
			var url      = _url.parse(op.filename);
			var protocol = _http;
			var options = {
				host   : url.host,
				port   : url.port,
				path   : url.path,
				method : 'GET',
				headers: { }
			};
			if(PathUtil.protocol(op.filename) == 'https') {
				options.port = 443;
				protocol = _https;
			}
			var request = protocol.request(options, (response) => {
				var data = [];
				response.on('data', (chunk) => { data.push(chunk); });
				response.on('end',  ()      => { 
					var resolved = new ResolvedFile();
					resolved.path    = op.filename;
					resolved.content = data.join('');
					callback(context, resolved );  
				});
			});
			request.on('error', (err) => {
				 var resolved = new ResolvedFile();
				 resolved.path  = op.filename;
				 resolved.error = err;
				 callback(context, resolved );  
			});
			request.end();  
		}		
		// loads a source from local disk..
		public fromFile(context:any, op:LoadOp, callback:{(context:any, resolved:ResolvedFile) : void; }): void {
			_fs.readFile(op.filename, "utf8", (err, data) => {
			  if (!err) {
				var resolved = new ResolvedFile();
				resolved.path    = op.filename;
				resolved.content = data;
				callback(context, resolved );  
			  } else {
				var resolved = new ResolvedFile();
				resolved.path  = op.filename;
				resolved.error = err;
				callback(context, resolved ); 
			  }
			});			
		}
	}
	
	export class ResolvedFile implements IResolvedFile {
		content : string;
		path    : string;
		error   : string;
	}
	
	export class CodeResolver {
		
		private loader        : AsyncLoader;
		private resolved      : ResolvedFile [];
		private queue_open    : LoadOp       [];
		private queue_close   : LoadOp       [];
		
		constructor() {
			this.loader       = new AsyncLoader();
			this.queue_open   = [];
			this.queue_close  = [];
			this.resolved     = [];
		}
		
		private visited(op:LoadOp) : boolean {
			for(var n in this.queue_close) {
				if(this.queue_close[n].filename == op.filename) {
					return true;
				}
			}
			return false;
		}
		
		private walk(callback: {( resolved:ResolvedFile[]): void; }) : void {
			
			// fetch filename off the queue.
			var op = this.queue_open.pop();
			
			// resolve relative op.filename to be absolute in all cases.
			if( PathUtil.isRelative(op.filename) ) {
				var parent  = _path.dirname(op.parent_filename);
				op.filename = _path.join(parent, op.filename);
			}
			if( PathUtil.isRootRelative(op.filename) ) {
				var parent  = _path.dirname(op.parent_filename);
				op.filename = _path.join(parent, op.filename);
			}
			
			console.log('[resolving] ' + op.filename);
			
			if(!this.visited(op)) {
			
				// push op on the closed queue. 
				this.queue_close.push(op);
				
				
				// determine how to load the file.
				var load:Function = this.loader.fromFile;
				if(PathUtil.isAbsoluteUrl(op.filename)) {
					load = this.loader.fromWeb;
				}
			 
				// load
				var that = this;
				load(null, op, (context, resolved) => {
				
					this.resolved.push(resolved);
					
					if(resolved.error) {
						console.log("[error] cannot load " + resolved.path);
						return;
					}
					
					// get snapshot of file....
					var snapshot    = TypeScript.ScriptSnapshot.fromString( resolved.content );
					var references  = TypeScript.getReferencedFiles( resolved.path, snapshot );
					
					for(var n in references) {
						var reference = references[n].path;
						// fix up typescript's get reference utility from messing with
						// double slashes..
						reference = reference.replace('\\', '/');
						if(reference.indexOf('http:/') == 0){
							if(!(reference.indexOf('http://') == 0)) {
								reference = reference.replace('http:/', 'http://');
							}
						}
						if(reference.indexOf('https:/') == 0){
							if(!(reference.indexOf('https://') == 0)) {
								reference = reference.replace('https:/', 'https://');
							}
						}
						// push new op on the queue for loading..
						that.queue_open.unshift( new LoadOp( resolved.path, reference ) );
					}
					
					// if there are more items on the queue, keep walking..
					if(that.queue_open.length > 0) {
						that.walk( callback );
					} else {
						callback( that.resolved );
					}
					
				});
			} else {
				// if there are more items on the queue, keep walking..
				if(this.queue_open.length > 0) {
					this.walk( callback );
				} else {
					callback( this.resolved );
				}		
			}			
		}
		
		public resolve(source, callback: {( resolved:ResolvedFile[]): void; }) : void {
			var op = new LoadOp( global.process.mainModule.filename, "./test/program.ts" );
			this.queue_open = [ op ];
			this.walk( callback );
		}
		
	}

}

