/////////////////////////////////////////////////////////////////////////////////
//
//  http server: test 
//
/////////////////////////////////////////////////////////////////////////////////

var typescript = require('typescript.api');
var http       = require('http');

/////////////////////////////////////////////
// settings....
/////////////////////////////////////////////

var settings = {
	context : null,
	debug   : false,
	port    : 5555
}

/////////////////////////////////////////////
// load the context...
/////////////////////////////////////////////
function loadcontext(callback) {
	typescript.resolve(['program.ts'], function(units) {
		typescript.compile(units, function(compilation) {
			typescript.run(compilation, null, function(context) {
				callback(context, compilation.diagnostics);
			});
		});
	});	
}
/////////////////////////////////////////////
// call the context..
/////////////////////////////////////////////
function callcontext(context, diagnostics, request, response ) {
	if(diagnostics) {
		if(diagnostics.length > 0) {
			response.writeHead(200, {'content-type' : 'text/plain'});
			for(var n in diagnostics) {
				response.write(diagnostics.toString() + '\n');
			}
			response.end();
			return;		
		}
	}
	if(context) {
		try {
			// ================================================
			// call into the context here..
			// ================================================
			context.application.Program.Main(request, response);  
		} catch (e) {
			response.writeHead(200, {'content-type' : 'text/plain'});
			response.write(e.toString());
			response.end();
		}
	} else {
		response.writeHead(200, {'content-type' : 'text/plain'});
		response.write("context is null.");
		response.end();
	}
}

/////////////////////////////////////////////
// start the server
/////////////////////////////////////////////
var server = http.createServer(function(request, response) {
	if(settings.debug == true) { // if debug, load and call.
		loadcontext(function(context, diagnostics) {
			console.log('debug..');
			callcontext(context, diagnostics, request, response);
		});		
	} else {
		if(!settings.context) {  // if no context load and call.
			loadcontext(function(context, diagnostics) {
				console.log('initializing..');
				callcontext(context, diagnostics, request, response);
				settings.context = context;
			});			
		} else { // run from the cache..
			console.log('running from cache...');
			callcontext(settings.context, null, request, response);
		}
	}
});
// listen..
server.listen(settings.port);
console.log('listening on port ' + settings.port.toString());

