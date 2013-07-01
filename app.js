var typescript = require('./bin/index.js');


function print_diagnostics(units)
{
    for (var n in units) {

        for(var m in units[n].diagnostics)
        {
            console.log(units[n].diagnostics[m].toString());

        }
    }
}

function print_unit(unit) {

    console.log('------------------------')

    console.log(unit.path);

    console.log(unit.content);

    console.log(unit.declaration);

    console.log(unit.sourcemap);

    console.log(unit.reflection);

    console.log(JSON.stringify(unit.reflection, null, ' '));
}

typescript.resolve('c:/input/typescript/program.ts', function (resolved) {

    print_diagnostics(resolved);
    
    typescript.compile(resolved, function(compiled) {
        
        for (var n in compiled) {

            print_unit(compiled[n]);
        }
    });
});



 
























 
 
