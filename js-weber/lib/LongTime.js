// requires s2c.Utils

(function(){

var Utils = s2c.Utils;

////
function Watcher() // constructor
{
	this.callbacks = [];
	this.callbacksDone = [];
	this.callbackArgs = []; // array of argument arrays which are returned by callbacks
	this.started = false;
}
// emits doneEvent(callbackArgs) 
// where callbackArgs is an array of argument arrays corresponding to each watched callback's arguments

Watcher.prototype.makeCallback = function() //public
{	
	var callback = Utils.makeFunctor(
		{watcher: this, index: this.callbacks.length},
		function(){this.watcher.onCallback(this.index, arguments);}
	);

	this.callbacks.push(callback);
	this.callbacksDone.push(false);
	this.callbackArgs.push([]);
	return callback;
}

/*
	callback will receive an array of argument arrays corresponding 
	to each watched callback's arguments
*/
Watcher.prototype.start = function(callback) //public
{
	this.started = true;
	Utils.addListener(this, 'doneEvent', callback);
	this.checkIfDone();
}

// returns true if all callbacks have been called
Watcher.prototype.isCallbacksDone = function() //public
{
	for(var i=0; i < this.callbacksDone.length; ++i)
	{
		if(!this.callbacksDone[i]){return false;}
	}
	
	return true;
}

Watcher.prototype.onCallback = function(index, args)
{
	this.callbacksDone[index] = true;
	this.callbackArgs[index] = args;
	this.checkIfDone();
}

Watcher.prototype.checkIfDone = function()
{
	if(!this.started || !this.isCallbacksDone()){return false;}
	if(this.doneEvent){this.doneEvent.apply(null, [this.callbackArgs]);}
	return true;
}

////

if(!s2c){s2c = {};}
s2c.LongTime = 
{
	Watcher: Watcher
}

})();