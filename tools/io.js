var node = {

    fs: require('fs')
}

module.exports.license = function (license_file, code_file) {

    var license = node.fs.readFileSync(license_file, 'utf8')

    var code    = node.fs.readFileSync(code_file, 'utf8')

    var content = '/*--------------------------------------------------------------------------\n\n';

    content += license + '\n\n';

    content += '--------------------------------------------------------------------------*/\n\n'

    content += code;

    node.fs.writeFileSync(code_file, content, 'utf8');

}

module.exports.create_directory = function(directory) {

    if(!node.fs.existsSync(directory)){

        node.fs.mkdirSync(directory);	

    }
}

module.exports.copy = function (source, dest, callback) {

    var readstream = node.fs.createReadStream(source);

    var writestream = node.fs.createWriteStream(dest);

    readstream.pipe(writestream);

    if (callback) {

        setTimeout(callback, 500);
    }
}