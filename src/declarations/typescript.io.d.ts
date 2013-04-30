interface IResolvedFile {
    content: string;
    path: string;
}

interface IFileWatcher {
    close(): void; 
}

interface IIO {
    readFile(path: string): string;
    writeFile(path: string, contents: string): void;
    createFile(path: string, useUTF8?: boolean): ITextWriter;
    deleteFile(path: string): void;
    dir(path: string, re?: RegExp, options?: { recursive?: boolean; }): string[];
    fileExists(path: string): boolean;
    directoryExists(path: string): boolean;
    createDirectory(path: string): void;
    resolvePath(path: string): string;
    dirName(path: string): string;
    findFile(rootPath: string, partialFilePath: string): IResolvedFile;
    print(str: string): void;
    printLine(str: string): void;
    arguments: string[];
    stderr: ITextWriter;
    stdout: ITextWriter;
    watchFile(fileName: string, callback: (string) => void ): IFileWatcher;
    run(source: string, fileName: string): void;
    getExecutingFilePath(): string;
    quit(exitCode?: number);
}