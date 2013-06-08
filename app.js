var typescript = require('./bin/index.js');


 
function print_units(units) {

    console.log('----------------------------------------------')

    for (var n in units) {

        console.log(units[n].references())
        
        console.log(units[n].declaration);

        console.log(units[n].content);

        console.log('------------------------')
    }
}

typescript.resolve('c:/input/typescript/program.ts', function (resolved) {

    typescript.compile(resolved, function(compiled) {

        print_units(compiled)

        typescript.reflect(compiled, function(reflection){

            console.log(reflection)

        });
         
    });
})

 


 
























 
 
