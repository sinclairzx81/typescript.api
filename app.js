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

    //console.log(unit.path);

    //console.log(unit.content);

    //console.log(unit.references);

    //console.log(unit.sourcemap);

    //console.log(unit.script);

    console.log(JSON.stringify(unit.script, null, ' '));
}

        //setInterval(function() {

//typescript.resolve('e:/development/gold/appex/node_modules/appex/index.ts', function (resolved) {


  
    typescript.resolve('c:/input/typescript/program.ts', function (resolved) {

            //print_diagnostics(resolved);
            
            typescript.compile(resolved, function(compiled) {
        
                if (!typescript.check(compiled)) {

                    print_diagnostics(compiled);

                    console.log('errors');

                } else {

                    for (var n in compiled) {

                        print_unit(compiled[n]);
                    }
                }
            });

        
    });

//}, 5000);