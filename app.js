var typescript = require('./bin/index.js');



typescript.resolve('c:/input/typescript/program.ts', function (resolved) {

    typescript.compile(resolved, function(compiled) {

        typescript.reflect(compiled, function(reflect) {

            console.log(JSON.stringify(reflect, null, ' '));

        });
    });
})

 
























 
 
