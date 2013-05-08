/////////////////////////////////////////////////////////////////////
// IO
/////////////////////////////////////////////////////////////////////

var ajax = ajax || {};

ajax.get = function (url, callback) 
{
 	$.ajax({url: url, type: 'GET', dataType: 'json', contentType: 'application/json; charset=utf-8', success: function (data)  
    {
 	    if (callback) 
        {
 	        callback(data);
 	    }

    }});  
    
}

/////////////////////////////////////////////////////////////////////
// TypeModel
/////////////////////////////////////////////////////////////////////

var TypeModel = function (obj) 
{
    this.arguments  = ko.observableArray([]);

    this.name       = ko.observable();

    this.arrayCount = ko.observable();

    this.expanded   = ko.observable(false);

    this.construct = function(obj) 
    {
        this.name (obj.name);
        
        this.arrayCount (obj.arrayCount);

        for (var n in obj.arguments) 
        {
            this.arguments.push(new TypeModel(obj.arguments[n]));
        }
    }

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }

    this.text = function () {

        var buffer = [];

        var process = function (type) {
            
            buffer.push(type.name());

            var length = type.arguments().length;

            if(length > 0) 
            { 
                buffer.push('<'); 
            }
            
            for(var i = 0; i < length; i++ ) 
            { 
                process( type.arguments()[i] );

                if(i != length - 1) 
                {
                    buffer.push(', ');
                }
            }

            if(length > 0) 
            { 
                buffer.push('>'); 
            }
            
            for(var i = 0; i < type.arrayCount(); i++)
            {
                buffer.push('[]');
            }
        }

        process(this);

        return buffer.join('');
    }

    this.construct(obj);
}

/////////////////////////////////////////////////////////////////////
// VariableModel
/////////////////////////////////////////////////////////////////////

var VariableModel = function (obj) {

    this.name       = ko.observable();

    this.type       = ko.observable();

    this.expanded   = ko.observable(false);

    this.construct  = function (obj) 
    {
        this.name(obj.name);

        this.type(new TypeModel(obj.type));
    }

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }

    this.text = function () 
    {
        return this.name() + ':' + this.type().text();
    }


    this.construct(obj);
}

/////////////////////////////////////////////////////////////////////
// ParameterModel
/////////////////////////////////////////////////////////////////////

var ParameterModel = function (obj) 
{
    this.name       = ko.observable();

    this.type       = ko.observable();

    this.expanded   = ko.observable(false);

    this.construct  = function (obj) 
    {
        this.name(obj.name);

        this.type(new TypeModel(obj.type));
    }

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }

    this.text = function()
    {
        return this.name() + ':' + this.type().text();
    }

    this.construct(obj);
}

/////////////////////////////////////////////////////////////////////
// MethodModel
/////////////////////////////////////////////////////////////////////
var MethodModel = function (obj) 
{
    this.parameters = ko.observableArray([]);

    this.name       = ko.observable();

    this.returns    = ko.observable();

    this.isStatic   = ko.observable();

    this.expanded   = ko.observable(false);

    this.construct = function (obj) 
    {
        this.name (obj.name);

        this.isStatic (obj.isStatic);

        for (var n in obj.parameters) 
        {
            this.parameters.push( new ParameterModel( obj.parameters[n] ) );
        }
        
        this.returns ( new TypeModel(obj.returns) );
    }

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }

    this.text = function()
    {
        var buffer = [];

        if(this.isStatic())
        {
            buffer.push('static ');
        }

        buffer.push(this.name());

        var length = this.parameters().length;

        buffer.push('(');

        for(var i = 0; i < length; i++)
        {
             buffer.push( this.parameters()[i].text() );

            if(i != length - 1) 
            {
                buffer.push(', ');
            }
        }

        buffer.push(')');

        buffer.push(' : ');

        buffer.push( this.returns().text() );

        return buffer.join('');
    }

    this.construct(obj);
}

/////////////////////////////////////////////////////////////////////
// ClassModel
/////////////////////////////////////////////////////////////////////
var ClassModel = function (obj) {

    this.methods     = ko.observableArray([]);
    
    this.variables   = ko.observableArray([]);
    
    this.parameters  = ko.observableArray([]);
    
    this.extends     = ko.observableArray([]);
    
    this.implements  = ko.observableArray([]);
    
    this.name        = ko.observable();

    this.expanded    = ko.observable(false);

    this.construct = function(obj)
    {
        for (var n in obj.methods)    this.methods.push    ( new MethodModel    ( obj.methods    [n] ) );
    
        for (var n in obj.variables)  this.variables.push  ( new VariableModel  ( obj.variables  [n] ) );
    
        for (var n in obj.parameters) this.parameters.push ( obj.parameters [n] );
    
        for (var n in obj.implements) this.implements.push ( obj.implements [n] );
    
        for (var n in obj.extends)    this.extends.push    ( obj.extends    [n] );
    
        this.name  (obj.name);
    }

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }

    this.text = function()
    {
        var buffer = [];

        buffer.push('class ')

        buffer.push(this.name());

        var length = this.parameters().length;

        if (this.parameters().length > 0) {

            buffer.push('<')
        }

        for(var i = 0; i < length; i++)
        {
            buffer.push( this.parameters()[i] );

            if(i != length - 1) 
            {
                buffer.push(', ');
            }
        }

        if (this.parameters().length > 0) {

            buffer.push('>');

        }

        // todo: extends...

        return buffer.join('');
    }

    this.construct(obj);
}

/////////////////////////////////////////////////////////////////////
// InterfaceModel
/////////////////////////////////////////////////////////////////////

var InterfaceModel = function (obj) 
{
    this.methods     = ko.observableArray([]);

    this.variables   = ko.observableArray([]);

    this.parameters  = ko.observableArray([]);

    this.extends     = ko.observableArray([]);

    this.name        = ko.observable();

    this.expanded    = ko.observable(false);

    this.construct = function () 
    {
        for (var n in obj.methods)    this.methods.push(new MethodModel(obj.methods[n]));

        for (var n in obj.variables)  this.variables.push(new VariableModel(obj.variables[n]));

        for (var n in obj.parameters) this.parameters.push(obj.parameters[n]);

        for (var n in obj.extends)    this.extends.push(obj.extends[n]);

        this.name(obj.name);
    }

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }

    this.text = function()
    {
        var buffer = [];

        buffer.push('interface ')

        buffer.push(this.name());

        var length = this.parameters().length;

        if (this.parameters().length > 0) {

            buffer.push('<')
        }

        for(var i = 0; i < length; i++)
        {
            buffer.push( this.parameters()[i] );

            if(i != length - 1) 
            {
                buffer.push(', ');
            }
        }

        if (this.parameters().length > 0) {

            buffer.push('>');

        }

        // todo: extends...

        return buffer.join('');
    }

    this.construct(obj);
}

/////////////////////////////////////////////////////////////////////
// ImportModel
/////////////////////////////////////////////////////////////////////
var ImportModel = function (obj) {
    this.name  = ko.observable();
    this.alias = ko.observable();   
    this.name  (obj.name);
    this.alias (obj.alias);

    this.expanded   = ko.observable(false);

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }
}

/////////////////////////////////////////////////////////////////////
// ModuleModel
/////////////////////////////////////////////////////////////////////
var ModuleModel = function (obj) {
    this.imports    = ko.observableArray([]);
    this.modules    = ko.observableArray([]);
    this.interfaces = ko.observableArray([]);
    this.classes    = ko.observableArray([]);
    this.methods    = ko.observableArray([]);
    this.variables  = ko.observableArray([]);
    this.name       = ko.observable();

    this.expanded   = ko.observable(false);
    
    for (var n in obj.imports)    this.imports.push    ( new ImportModel    ( obj.imports    [n] ) );
    for (var n in obj.modules)    this.modules.push    ( new ModuleModel    ( obj.modules    [n] ) );
    for (var n in obj.interfaces) this.interfaces.push ( new InterfaceModel ( obj.interfaces [n] ) );
    for (var n in obj.classes)    this.classes.push    ( new ClassModel     ( obj.classes    [n] ) );
    for (var n in obj.methods)    this.methods.push    ( new MethodModel    ( obj.methods    [n] ) );
    for (var n in obj.variables)  this.variables.push  ( new VariableModel  ( obj.variables  [n] ) );
    this.name  (obj.name);

    this.toggle = function () {
        this.expanded(this.expanded() ? false : true);
    }
}

/////////////////////////////////////////////////////////////////////
// ScriptModel
/////////////////////////////////////////////////////////////////////
var ScriptModel = function (obj) {
    this.modules    = ko.observableArray([]);
    this.interfaces = ko.observableArray([]);
    this.classes    = ko.observableArray([]);
    this.methods    = ko.observableArray([]);
    this.variables  = ko.observableArray([]);
    this.path       = ko.observable();
    this.expanded   = ko.observable(false);

    for (var n in obj.modules)    this.modules.push    ( new ModuleModel    ( obj.modules    [n] ) );
    for (var n in obj.interfaces) this.interfaces.push ( new InterfaceModel ( obj.interfaces [n] ) );
    for (var n in obj.classes)    this.classes.push    ( new ClassModel     ( obj.classes    [n] ) );
    for (var n in obj.methods)    this.methods.push    ( new MethodModel    ( obj.methods    [n] ) );
    for (var n in obj.variables)  this.variables.push  ( new VariableModel  ( obj.variables  [n] ) );
    this.path(obj.path);

    this.toggle = function () {
        this.expanded(this.expanded() ? false : true);
    }
}

/////////////////////////////////////////////////////////////////////
// ViewModel
/////////////////////////////////////////////////////////////////////
var ReflectionModel = function(obj) {

    this.scripts = ko.observableArray([]);

    this.expanded   = ko.observable(false);

    for (var n in obj.scripts)   this.scripts.push  ( new ScriptModel ( obj.scripts [n] ) ); 

    this.toggle = function () 
    {
        this.expanded(this.expanded() ? false : true);
    }
};

