
function getLib_S2C_LongTime()
{
	if(window.lib_S2C_LongTime){return window.lib_S2C_LongTime;}

	var Utils = getLib_S2C_Utils;

	///
	
	function Watcher()
	{
		this.callbacks = [];
		this.callbacksDone = [];
		this.callbackArgs = []; // array of argument arrays which are returned by callbacks
		this.callbackArgsByKey = {}; // map of callbackKeyStr to callback arguments array
		this.started = false;
	}
	// emits doneEvent(callbackArgs) 
	// where callbackArgs is an array of argument arrays corresponding to each watched callback's arguments

	//callbackKeyStr is an optional arbitrary string used to identify the newly created callback
	Watcher.prototype.makeCallback = function(callbackKeyStr) //public
	{
		if(arguments.length < 1){callbackKeyStr = '' + this.callbacks.length;}
		
		var callback = Utils.makeFunctor(
			{watcher: this, index: this.callbacks.length, callbackKeyStr: callbackKeyStr},
			function(){this.watcher.onCallback(this.index, this.callbackKeyStr, arguments);}
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

	Watcher.prototype.getCallbackArgs = function(callbackKeyStr) // public
	{
		return this.callbackArgsByKey[callbackKeyStr];
	}

	Watcher.prototype.onCallback = function(index, callbackKeyStr, args)
	{
		this.callbacksDone[index] = true;
		this.callbackArgs[index] = args;
		this.callbackArgsByKey[callbackKeyStr] = args;
		this.checkIfDone();
	}

	Watcher.prototype.checkIfDone = function()
	{
		if(!this.started || !this.isCallbacksDone()){return false;}
		if(this.doneEvent){this.doneEvent.apply(null, [this.callbackArgs]);}
		return true;
	}

	///

	return window.lib_S2C_LongTime = {
		Watcher: Watcher
	}
}