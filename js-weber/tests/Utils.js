function importUtils()
{


if(importUtils.lib){return importUtils.lib;}

function makeFunctor(data, fn)
{
	var newFn = function(){return fn.apply(newFn, arguments);};
	for(var k in data){newFn[k] = data[k];}
	return newFn;
}

function addListener(obj, propertyName, callback)
{
	if(!obj[propertyName]){obj[propertyName] = makeMultiRunner();}
	obj[propertyName].fns.push(callback);
	return callback;
}

function remListener(obj, propertyName, callback)
{
	if(!obj[propertyName]){return;}
	var fns = obj[propertyName].fns;
	
	for(var i=fns.length-1; i >= 0; --i)
	{
		if(fns[i] === callback){fns.splice(i, 1);}
	}
}

function runMultiRunner()
{
	for(var i=0; i < this.fns.length; ++i)
	{this.fns[i].apply(null, arguments);}
}

function makeMultiRunner()
{
	return makeFunctor({fns: new Array()}, runMultiRunner);
}


/////////////////////
// Allocator Class //
/////////////////////

function Allocator(ctor) // constructor
{this.init(ctor);}

Allocator.prototype.init = function(ctor)
{
    this.instances = new Array();
    this.ctor = ctor;
}

Allocator.prototype.allocate = function()
{
    for(var i=0; i < this.instances.length; ++i)
    {
        if(!this.instances[i].as.Allocated.inUse)
        {
            this.instances[i].as.Allocated.inUse = true;
            return this.instances[i];
        }
    }
    
    var ctor = this.ctor;
    var newInstance = new ctor();
	
    if(!newInstance.as){newInstance.as = new Object();}
    if(!newInstance.as.Allocated){newInstance.as.Allocated = new Object();}
    newInstance.as.Allocated.inUse = true;
    this.instances.push(newInstance);
    
    if(this.onCreateEvent){this.onCreateEvent(newInstance);} // dispatch event
    
    return newInstance;
}

Allocator.prototype.free = function(obj)
{
    if(obj.destroyEvent){obj.destroyEvent();}
    obj.as.Allocated.inUse = false;
}
	
/////////////////////////
// End Allocator Class //
/////////////////////////	
	
	
	
	
return importUtils.lib = 
{
	makeFunctor: makeFunctor,
	addListener: addListener,
	remListener: remListener,
	Allocator: Allocator
};
}