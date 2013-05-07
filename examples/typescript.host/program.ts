export class Program {
	
	public static Main(request:any, response:any) : void {
		
		response.writeHead(200, {'content-type' : 'application/json'}); 
		
		response.write('hello typescript');
		
		response.end();
	}	
}