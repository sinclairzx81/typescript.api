/// <reference path='decl/node.d.ts' />

var typescript = require('typescript.api');

var fs = require("fs");

declare var JSON;
 
export class Program  
{
    public static Reflect (request:http.ServerRequest, response:http.ServerResponse) : void {
        
        var error = (units, request, response) => 
        {
            response.writeHead(500, {'content-type' : 'application/json'}); 

            response.write(JSON.stringify(units.diagnostics, null, " "));

            response.end(); 
        };

        typescript.resolve('program.ts', (units) => 
        {
            if(!typescript.check(units)) 
            {
                error(units, request, response);
            }
            else 
            { 
                typescript.compile(units, (compilation) => 
                { 
                    if(!typescript.check(compilation)) 
                    {
                        error(compilation, request, response);
                    } 
                    else  
                    {
                        typescript.reflect(compilation, (reflection) => 
                        {
                            response.writeHead(200, {'content-type' : 'application/json'}); 

                            response.write(JSON.stringify(reflection, null, " "));

                            response.end();    
                        });
                    }
                }); 
            }
        });
    }
    
    public static Script    (request:http.ServerRequest, response:http.ServerResponse) : void 
    {
        response.writeHead(200, {'content-type' : 'text/javascript'}); 

        response.write(fs.readFileSync(__dirname + "/templates/script.js"));

        response.end();
    }

    public static Home    (request:http.ServerRequest, response:http.ServerResponse) : void 
    {
        response.writeHead(200, {'content-type' : 'text/html'}); 

        response.write(fs.readFileSync(__dirname + "/templates/index.html"));

        response.end();
    }

	public static Main (request:http.ServerRequest, response:http.ServerResponse) : void 
    {

        switch(request.url) {

            case "/":

            case "/home":

                Program.Home(request, response);

                break;

            case "/reflect":

                Program.Reflect(request, response);

                break;

            case "/script.js":

                Program.Script(request, response);

                break;

            default:

                response.writeHead(404, {'content-type' : 'text/html'});
                 
                response.write('no route');

                response.end();

                break;
        }
	}	
}