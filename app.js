var typescript = require('./bin/index.js');

 
    for (var a = 0; a < 100; a++) {

        console.log()
    }

 
function print_units(units) {

    console.log('----------------------------------------------')
    for (var n in units) {

        console.log(units[n].content)

    }


}

typescript.resolve('c:/input/typescript/program.ts', function (resolved) {

    typescript.compile(resolved, function(compiled) {

        print_units(compiled)
        
        typescript.resolve('c:/input/typescript/program.ts', function (resolved) {

            resolved[0].content = "export function this_is_a_really_long_method {}";

            typescript.compile(resolved, function(compiled) {
                
                
                console.log('----------------------------------')
                console.log('OUTPUT:')
                print_units(compiled)

                console.log('----------------------------------')
            });
        })        
         
    });
})

 
























 
 
