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

function print_diagnostics(units)
{
    for (var n in units) {

        for(var m in units[n].diagnostics)
        {
            console.log(units[n].diagnostics[m].toString());

        }
    }
}

typescript.resolve('c:/input/typescript/program.ts', function (resolved) {

    print_diagnostics(resolved);


    typescript.compile(resolved, function(compiled) {
        
        typescript.reflect(compiled, function(reflection){

            console.log(reflection)

        });
         
    });
})

typescript.build(['c:/input/typescript/program.ts'], function (errors, source, declaration) {

    console.log(declaration);

    console.log('-----');

    console.log(source);

});



 
























 
 
