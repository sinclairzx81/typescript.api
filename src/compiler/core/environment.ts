///<reference path='references.ts' />
///<reference path='..\enumerator.ts' />
///<reference path='..\process.ts' />

interface IEnvironment {
    readFile(path: string, useUTF8?: boolean): string;
    writeFile(path: string, contents: string, useUTF8?: boolean): void;
    deleteFile(path: string): void;
    fileExists(path: string): boolean;
    directoryExists(path: string): boolean;
    listFiles(path: string, re?: RegExp, options?: { recursive?: boolean; }): string[];

    arguments: string[];
    standardOut: ITextWriter;

    currentDirectory(): string;
}

var Environment = (function () {
    // Create an IO object for use inside WindowsScriptHost hosts
    // Depends on WSCript and FileSystemObject
    function getWindowsScriptHostEnvironment(): IEnvironment {
        try {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
        } catch (e) {
            return null;
        }

        var streamObjectPool = [];

        function getStreamObject(): any {
            if (streamObjectPool.length > 0) {
                return streamObjectPool.pop();
            } else {
                return new ActiveXObject("ADODB.Stream");
            }
        }

        function releaseStreamObject(obj: any) {
            streamObjectPool.push(obj);
        }

        var args = [];
        for (var i = 0; i < WScript.Arguments.length; i++) {
            args[i] = WScript.Arguments.Item(i);
        }

        return {
            currentDirectory: (): string => {
                return (<any>WScript).CreateObject("WScript.Shell").CurrentDirectory;
            },

            readFile: function (path, useUTF8: boolean = false) {
                try {
                    var streamObj = getStreamObject();
                    streamObj.Open();
                    streamObj.Type = 2; // Text data
                    streamObj.Charset = 'x-ansi'; // Assume we are reading ansi text
                    streamObj.LoadFromFile(path);
                    var bomChar = streamObj.ReadText(2); // Read the BOM char
                    streamObj.Position = 0; // Position has to be at 0 before changing the encoding
                    if ((bomChar.charCodeAt(0) === 0xFE && bomChar.charCodeAt(1) === 0xFF) ||
                        (bomChar.charCodeAt(0) === 0xFF && bomChar.charCodeAt(1) === 0xFE)) {
                        streamObj.Charset = 'unicode';
                    } else if (bomChar.charCodeAt(0) === 0xEF && bomChar.charCodeAt(1) === 0xBB) {
                        streamObj.Charset = 'utf-8';
                    }
                    else {
                        streamObj.Charset = useUTF8 ? 'utf-8' : 'x-ansi';
                    }

                // Read the whole file
                    var str = streamObj.ReadText(-1 /* read from the current position to EOS */);
                    streamObj.Close();
                    releaseStreamObject(streamObj);
                    return <string>str;
                }
                catch (err) {
                    throw new Error("Error reading file \"" + path + "\": " + err.message);
                }
            },

            writeFile: function (path, contents, useUTF8: boolean = false) {
                var file = this.createFile(path, useUTF8);
                file.Write(contents);
                file.Close();
            },

            fileExists: function (path: string): boolean {
                return fso.FileExists(path);
            },

            deleteFile: function (path: string): void {
                if (fso.FileExists(path)) {
                    fso.DeleteFile(path, true); // true: delete read-only files
                }
            },

            directoryExists: function (path) {
                return <boolean>fso.FolderExists(path);
            },

            listFiles: function (path, spec?, options?) {
                options = options || <{ recursive?: boolean; }>{};
                function filesInFolder(folder, root): string[] {
                    var paths = [];
                    var fc: Enumerator;

                    if (options.recursive) {
                        fc = new Enumerator(folder.subfolders);

                        for (; !fc.atEnd() ; fc.moveNext()) {
                            paths = paths.concat(filesInFolder(fc.item(), root + "/" + fc.item().Name));
                        }
                    }

                    fc = new Enumerator(folder.files);

                    for (; !fc.atEnd() ; fc.moveNext()) {
                        if (!spec || fc.item().Name.match(spec)) {
                            paths.push(root + "/" + fc.item().Name);
                        }
                    }

                    return paths;
                }

                var folder = fso.GetFolder(path);
                var paths = [];

                return filesInFolder(folder, path);
            },

            createFile: function (path, useUTF8: boolean = false) {
                try {
                    var streamObj = getStreamObject();
                    streamObj.Charset = useUTF8 ? 'utf-8' : 'x-ansi';
                    streamObj.Open();
                    return {
                        Write: function (str) { streamObj.WriteText(str, 0); },
                        WriteLine: function (str) { streamObj.WriteText(str, 1); },
                        Close: function () {
                            streamObj.SaveToFile(path, 2);
                            streamObj.Close();
                            releaseStreamObject(streamObj);
                        }
                    };
                } catch (ex) {
                    WScript.StdErr.WriteLine("Couldn't write to file '" + path + "'");
                    throw ex;
                }
            },

            arguments: <string[]>args,

            standardOut: WScript.StdOut,
        }
    };

    function getNodeEnvironment(): IEnvironment {
        var _fs = require('fs');
        var _path = require('path');
        var _module = require('module');

        return {
            currentDirectory: (): string => {
                return (<any>process).cwd();
            },

            readFile: function (file: string, useUTF8?: boolean) {
                var buffer = _fs.readFileSync(file);
                switch (buffer[0]) {
                    case 0xFE:
                        if (buffer[1] === 0xFF) {
                            // utf16-be. Reading the buffer as big endian is not supported, so convert it to 
                            // Little Endian first
                            var i = 0;
                            while ((i + 1) < buffer.length) {
                                var temp = buffer[i]
                                buffer[i] = buffer[i + 1];
                                buffer[i + 1] = temp;
                                i += 2;
                            }
                            return buffer.toString("ucs2", 2);
                        }
                        break;
                    case 0xFF:
                        if (buffer[1] === 0xFE) {
                            // utf16-le 
                            return buffer.toString("ucs2", 2);
                        }
                        break;
                    case 0xEF:
                        if (buffer[1] === 0xBB) {
                            // utf-8
                            return buffer.toString("utf8", 3);
                        }
                }

                // Default behaviour
                return useUTF8 ? buffer.toString("utf8", 0) : buffer.toString();
            },

            writeFile: function (path: string, contents: string, useUTF?: boolean) {
                if (useUTF) {
                    _fs.writeFileSync(path, contents, "utf8");
                }
                else {
                    _fs.writeFileSync(path, contents);
                }
            },
            
            fileExists: function(path): boolean {
                return _fs.existsSync(path);
            },

            deleteFile: function(path) {
                try {
                    _fs.unlinkSync(path);
                } catch (e) {
                }
            },
            
            directoryExists: function(path: string): boolean {
                return _fs.existsSync(path) && _fs.lstatSync(path).isDirectory();
            },

            listFiles: function dir(path, spec?, options?) {
                options = options || <{ recursive?: boolean; }>{};

                function filesInFolder(folder: string): string[]{
                    var paths = [];

                    var files = _fs.readdirSync(folder);
                    for (var i = 0; i < files.length; i++) {
                        var stat = _fs.statSync(folder + "/" + files[i]);
                        if (options.recursive && stat.isDirectory()) {
                            paths = paths.concat(filesInFolder(folder + "/" + files[i]));
                        } else if (stat.isFile() && (!spec || files[i].match(spec))) {
                            paths.push(folder + "/" + files[i]);
                        }
                    }

                    return paths;
                }

                return filesInFolder(path);
            },

            createFile: function(path, useUTF8?) {
                function mkdirRecursiveSync(path) {
                    var stats = _fs.statSync(path);
                    if (stats.isFile()) {
                        throw "\"" + path + "\" exists but isn't a directory.";
                    } else if (stats.isDirectory()) {
                        return;
                    } else {
                        mkdirRecursiveSync(_path.dirname(path));
                        _fs.mkdirSync(path, 0775);
                    }
                }
                mkdirRecursiveSync(_path.dirname(path));

                var fd = _fs.openSync(path, 'w');
                return {
                    Write: function(str) { _fs.writeSync(fd, str); },
                    WriteLine: function(str) { _fs.writeSync(fd, str + '\r\n'); },
                    Close: function() { _fs.closeSync(fd); fd = null; }
                };
            },

            arguments: process.argv.slice(2),
            
            standardOut: {
                Write: function(str) { process.stdout.write(str); },
                WriteLine: function(str) { process.stdout.write(str + '\n'); },
                Close: function() { }
            },
        }
    };

    if (typeof WScript !== "undefined" && typeof ActiveXObject === "function") {
        return getWindowsScriptHostEnvironment();
    }
    else if (typeof require === "function") {
        return getNodeEnvironment();
    }
    else {
        return null; // Unsupported host
    }
})();
