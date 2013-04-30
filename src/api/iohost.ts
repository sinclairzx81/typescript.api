///<references path="../compiler/io.ts" />
///<references path="textwriter.ts" />

module TypeScript.Api {
 
	var _fs 	  = require('fs');
	
	var _path     = require('path');
	
	var _module   = require('module');
	
	export interface IIOAsync extends IIO {
	
		readFileAsync(path, callback:{ (contents:string) : void ; } ) : void;
	
	}
	
	export class IOHost implements IIO {
			
		arguments: string[];  
		
		constructor(public stdout:ITextWriter, public stderr:ITextWriter) { }
		
		
		// IIOAsync implementation
		
		
		
		// IIO implementation - based on tsc implementation
		
		public readFile(path: string): string {
			
				try {
				
				var buffer = _fs.readFileSync(path);
				
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
				
			} catch (e) {
			
				IOUtils.throwIOError("Error reading file \"" + path + "\".", e);
			}
		}
		
		public writeFile(path: string, contents: string): void {
		
			_fs.writeFileSync(path, contents);
		}
		
		public createFile(path: string, useUTF8?: boolean): ITextWriter {
		
			function mkdirRecursiveSync(path) {
			
				var stats = _fs.statSync(path);
				
				if (stats.isFile()) {
				
					IOUtils.throwIOError("\"" + path + "\" exists but isn't a directory.", null);
					
				} else if (stats.isDirectory()) {
				
					return;
					
				} else {
				
					mkdirRecursiveSync(_path.dirname(path));
					
					_fs.mkdirSync(path, 0775);
				}
			}

			mkdirRecursiveSync(_path.dirname(path));

			try {
			
				var fd = _fs.openSync(path, 'w');
				
			} catch (e) {
			
				IOUtils.throwIOError("Couldn't write to file '" + path + "'.", e);
			}
			
			// Writing to a buffer to improve performance
			
			return new IOUtils.BufferedTextWriter({
			
				Write : function (str) { _fs.writeSync(fd, str); },
				
				Close : function () { _fs.closeSync(fd); fd = null; }
				
			});
			
		}
		public deleteFile(path: string) : void {
			
			try 
			{
				_fs.unlinkSync(path);
			} 
			catch (e) 
			{
				IOUtils.throwIOError("Couldn't delete file '" + path + "'.", e);
			}			
		}
		
		public dir(path: string, re?: RegExp, options?: { recursive?: boolean; }): string[] {
		
			options = options || <{ recursive?: boolean; }>{};

			function filesInFolder(folder: string): string[] {
			
				var paths = [];

				try {
					
					var files = _fs.readdirSync(folder);
					
					for (var i = 0; i < files.length; i++) {
					
						var stat = _fs.statSync(folder + "/" + files[i]);
						
						if (options.recursive && stat.isDirectory()) {
						
							paths = paths.concat(filesInFolder(folder + "/" + files[i]));
							
						} else if (stat.isFile() && (!re || files[i].match(re))) {
						
							paths.push(folder + "/" + files[i]);
							
						}
					}
				} catch (err) {
					/*
					*   Skip folders that are inaccessible
					*/
				}

				return paths;
			}

			return filesInFolder(path);
			
		}
		
		public fileExists(path: string): boolean {
		
			return _fs.existsSync(path) && _fs.lstatSync(path).isDirectory();
			
		}
		
		public directoryExists(path: string): boolean {
		
			return false;
			
		}
		
		public createDirectory(path: string): void {
		
                try 
				{
                    if (!this.directoryExists(path)) 
					{
                        _fs.mkdirSync(path);
                    }
                } 
				catch (e) {
                    // log...
                }		
		}
		
		public resolvePath(path: string): string {
		
			return _path.resolve(path);
			
		}
		public dirName(path: string): string {
		
			return _path.dirname(path);
		}
		
		public findFile(rootPath: string, partialFilePath: string): IResolvedFile{
			
			var path = rootPath + "/" + partialFilePath;

			while (true)  {
			
				if (_fs.existsSync(path)) {
				
					try 
					{
						var content = this.readFile(path);
						
						return { content: content, path: path };
					} 
					catch (err) 
					{
						 // log here..
					}
				}
				else 
				{
					var parentPath = _path.resolve(rootPath, "..");

					// Node will just continue to repeat the root 
					// path, rather than return null
					if (rootPath === parentPath) 
					{
						return null;
					}
					else 
					{
						rootPath = parentPath;
						
						path     = _path.resolve(rootPath, partialFilePath);
					}
				}
			}
		}
		
		public print(str: string): void {
		
			process.stdout.write(str)
		}
		
		public printLine(str: string): void {
			
			process.stdout.write(str + '\n')
			
		}

		public watchFile(fileName: string, callback: (string) => void ): IFileWatcher {
		
			var firstRun = true;
			
			var processingChange = false;

			var fileChanged: any = function(curr, prev) {
			
				if (!firstRun) {
				
					if (curr.mtime < prev.mtime) {
					
						return;
					}

					_fs.unwatchFile(fileName, fileChanged);
					
					if (!processingChange) {
					
						processingChange = true;
						
						callback(fileName);
						
						setTimeout(function() { 
						
							processingChange = false; 
							
						}, 100);
					}
				}
				firstRun = false;
				
				_fs.watchFile(fileName, {  persistent : true, interval   : 500 }, fileChanged);
			};

			fileChanged();
			
			return {
			
				fileName : fileName,
				
				close    : function() {
				
					_fs.unwatchFile(fileName, fileChanged);
				}
			};
			
		}
		public run(source: string, fileName: string): void {
		
            require.main.fileName = fileName;
			
            require.main.paths = _module._nodeModulePaths( _path.dirname( _fs.realpathSync(fileName) ) );
			
			require.main._compile(source, fileName);			
		}
		
		public getExecutingFilePath(): string {
			
			return process.mainModule.filename;
		}
		
		public quit(exitCode?: number) {
		
			 process.exit();
		}
	}   
}