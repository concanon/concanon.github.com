(function (){

function makeFunctor(data, fn) //public
{
	var newFn = function(){return fn.apply(newFn, arguments);};
	for(var k in data){newFn[k] = data[k];}
	return newFn;
}

//// Begin event handling
function addListener(obj, eventName, callback) //public
{
	remListener(obj, eventName, callback); // prevent adding the same callback twice
	if(!obj[eventName]){obj[eventName] = makeMultiRunner();}
	obj[eventName].fns.push(callback);
}

function remListener(obj, eventName, callback) //public
{
	if(!obj[eventName]){return;}
	var fns = obj[eventName].fns;
	
	for(var i=0; i < fns.length; ++i)
	{
		if(fns[i] == callback){fns.splice(i, 1);}
	}
}

function remAllListeners(obj, eventName) //public
{
	obj[eventName] = null;
}

function makeMultiRunner()
{
	return makeFunctor(
		{fns: new Array()}, 
		function()
		{
			for(var i=0; i < this.fns.length; ++i)
			{this.fns[i].apply(null, arguments);}
		}
	);
}
//// End event handling

////
function Allocator(constructor)
{
    this.instances = new Array();
    this.ctor = constructor;
}

Allocator.prototype.allocate = function() //public
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
    if(this.createEvent){this.createEvent(newInstance);} // dispatch event
    return newInstance;
}

Allocator.prototype.free = function(obj) //public
{
    if(obj.destroyEvent){obj.destroyEvent();}
    obj.as.Allocated.inUse = false;
}

////

if(!window.s2c){window.s2c = {};}
window.s2c.Utils =
{
	makeFunctor: makeFunctor,
	addListener: addListener,
	remListener: remListener,
	remAllListeners: remAllListeners,
	Allocator: Allocator
};

})();