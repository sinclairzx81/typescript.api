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
		public fromWeb(context:any, op:LoadOp, callback:{(context:any, codefile:CodeFile) : void; }): void {
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
					var codefile = new CodeFile();
					codefile.path    = op.filename;
					codefile.content = data.join('');
					callback(context, codefile );  
				});
			});
			request.on('error', (err) => {
				 var codefile = new CodeFile();
				 codefile.path  = op.filename;
				 codefile.error = err;
				 callback(context, codefile );  
			});
			request.end();  
		}		
		// loads a source from local disk..
		public fromFile(context:any, op:LoadOp, callback:{(context:any, codefile:CodeFile) : void; }): void {
			_fs.readFile(op.filename, "utf8", (err, data) => {
			  if (!err) {
				var codefile = new CodeFile();
				codefile.path    = op.filename;
				codefile.content = data;
				callback(context, codefile );  
			  } else {
				var codefile = new CodeFile();
				codefile.path  = op.filename;
				codefile.error = err;
				callback(context, codefile ); 
			  }
			});			
		}
	}
	
	class CodeFile implements IResolvedFile {
		content : string;
		path    : string;
		error   : string;
	}
	
	export class CodeResolver {
		
		private loader        : AsyncLoader;
		private resolved      : IResolvedFile [];
		private queue_open    : LoadOp[];
		private queue_close   : LoadOp[];
		
		constructor() {
			this.loader       = new AsyncLoader();
			this.queue_open   = [];
			this.queue_close  = [];
			this.resolved     = [];
		}
		
		private walk(callback: {( resolved:IResolvedFile[]): void; }) : void {
			
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
			
			// push op on the closed queue. 
			this.queue_close.push(op);
			
			
			// determine how to load the file.
			var load:Function = this.loader.fromFile;
			if(PathUtil.isAbsoluteUrl(op.filename)) {
				load = this.loader.fromWeb;
			}
		 
			// load
			var that = this;
			load(null, op, (context, codefile) => {
				if(codefile.error) {
					console.log("[error] cannot load " + codefile.path);
					return;
				}
				
				// get snapshot of file....
				var snapshot    = TypeScript.ScriptSnapshot.fromString( codefile.content );
				var references  = TypeScript.getReferencedFiles( codefile.path, snapshot );
				for(var n in references) {
					that.queue_open.unshift( new LoadOp(codefile.path, references[n].path) );
				}
				
				// if there are more items on the queue, keep walking..
				if(that.queue_open.length > 0) {
					that.walk( callback );
				} 
				// other
				else{
					callback( that.resolved );
				}
				
			});
		}
		
		public resolve(source, callback: {( resolved:IResolvedFile[]): void; }) : void {
			var op = new LoadOp( global.process.mainModule.filename, "./test/program.ts" );
			this.queue_open = [ op ];
			this.walk( callback );
		}
		
	}

}

