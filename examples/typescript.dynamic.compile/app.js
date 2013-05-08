var typescript = require('typescript.api');
var http       = require('http');

//////////////////////////////////////////////////////////////////
// SIMPLE HTTP HOST
//////////////////////////////////////////////////////////////////
// Will create a http server and on each request, will compile
// and invoke program.ts. Errors are written to http response.
//////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////
// settings...
//////////////////////////////////////////////////////////////////
var settings = {
	context : null,
	port    : 5555
}

//////////////////////////////////////////////////////////////////
// diagnostics
//////////////////////////////////////////////////////////////////
function diagnostics(units, request, response)
{
	response.writeHead(200, {'content-type' : 'text/plain'});
	
	for(var n in units)
	{
		for(var m in units[n].diagnostics) 
		{
			response.write(units[n].diagnostics[m].toString());
		}
	}
	
	response.end();	
}

//////////////////////////////////////////////////////////////////
// load context
//////////////////////////////////////////////////////////////////

function loadcontext(callback) {

	typescript.resolve(['program.ts'], function(units) 
	{
		if(!typescript.check(units)) 
		{
			callback(null, units);
		}
		else
		{
			typescript.compile(units, function(compilation) 
			{
				if(!typescript.check(compilation)) 
				{
					callback(null, compilation);
				}
				else 
				{
					typescript.run(compilation, null, function(context) {
						
						callback(context, null);
						
					});	
				}
			});
		} 
	});	
}

//////////////////////////////////////////////////////////////////
// call the context..
//////////////////////////////////////////////////////////////////

function callcontext(context, request, response) 
{
	try 
	{
		context.Program.Main(request, response);  
	} 
	catch (exception) 
	{
		response.writeHead(200, {'content-type' : 'text/plain'});
		
		response.write(exception.toString());
		
		response.end();
	}
}

//////////////////////////////////////////////////////////////////
// create the server..
//////////////////////////////////////////////////////////////////

var server = http.createServer(function(request, response) {
	
	loadcontext(function(context, units) {
	
		if(context) 
		{
			callcontext(context, request, response);
		} 
		else 
		{
			diagnostics(units, request, response);
		}
	});		
	 
});

//////////////////////////////////////////////////////////////////
// listen
//////////////////////////////////////////////////////////////////

server.listen(settings.port);

console.log('listening on port ' + settings.port.toString());



