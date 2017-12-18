
function getLib_S2C_Utils()
{
	if(window.S2C_Utils){return window.S2C_Utils;}

	///
	
	function Allocator(yourConstructor)
	{
		this._ctor = yourConstructor;
		this._instances = new Array();
	}
    
    Allocator.numCreated = 0;
    Allocator.numReused = 0;

	Allocator.prototype.allocate = function()
	{
		for(var i=0; i < this._instances.length; ++i)
		{
			if(!this._instances[i].as.Allocated.inUse)
			{
				this._instances[i].as.Allocated.inUse = true;
                ++Allocator.numReused;
				return this._instances[i];
			}
		}
		
		var ctor = this._ctor;
		var newInstance = new ctor();
        ++Allocator.numCreated;
		if(!newInstance.as){newInstance.as = new Object();}
		if(!newInstance.as.Allocated){newInstance.as.Allocated = new Object();}
		newInstance.as.Allocated.inUse = true;
		newInstance.as.Allocated.allocator = this;
		this._instances.push(newInstance);
		if(this.createEvent){this.createEvent(newInstance);}
		return newInstance;
	}

	Allocator.prototype.free = function(obj) //public
	{
		if(obj.allocatorFreeEvent){obj.allocatorFreeEvent();}
		obj.as.Allocated.inUse = false;
	}
	
    Allocator.logStats = function()
    {
        console.log("Allocator Stats\nnumber of objects created: " + Allocator.numCreated + "\nnumber of times objects were reused: " + Allocator.numReused);
    }
	
	///

	///
		
	function makeFunctor(data, fn)
	{
		var newFn = function(){return fn.apply(newFn, arguments);};
		for(var k in data){newFn[k] = data[k];}
		return newFn;
	}

	/// Begin event handling
	
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

	/// end Event Handling
	
	return window.S2C_Utils = {
		makeFunctor: makeFunctor,
		addListener: addListener,
		remListener: remListener,
		remAllListeners: remAllListeners,
		Allocator: Allocator
	};
}
	
