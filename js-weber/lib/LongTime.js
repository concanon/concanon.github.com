// requires s2c.Utils

(function(){

var Utils = s2c.Utils;

////
function Watcher() // constructor
{
	this.callbacks = new Array();
	this.callbacksDone = new Array();
	this.started = false;
}
// emits doneEvent

Watcher.prototype.makeCallback = function() //public
{	
	var callback = Utils.makeFunctor(
		{watcher: this, index: this.callbacks.length},
		function(){this.watcher.onCallback(this.index);}
	);

	this.callbacks.push(callback);
	this.callbacksDone.push(false);
	return callback;
}

Watcher.prototype.start = function(callback) //public
{
	this.started = true;
	
	if(this.isCallbacksDone())
	{callback();}
	else
	{Utils.addListener(this, 'doneEvent', callback);}
}

Watcher.prototype.onCallback = function(index)
{
	this.callbacksDone[index] = true;
	
	if(this.started && this.isCallbacksDone())
	{
		if(this.doneEvent){this.doneEvent();}
	}
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
////

if(!s2c){s2c = {};}
s2c.LongTime = 
{
	Watcher: Watcher
}

})();