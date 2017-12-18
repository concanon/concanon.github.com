
function getLib_S2C_LongTime()
{
	if(window.lib_S2C_LongTime){return window.lib_S2C_LongTime;}

	var Utils = getLib_S2C_Utils();

	///
	
	/*
		events: calls event doneEvent(callbackArgs), where callbackArgs 
			is an array of argument arrays corresponding to each watched callback's arguments.
	*/
	function Watcher()
	{
		this._callbacks = [];
		this._callbacksDone = [];
		this._callbackArgs = []; // array of argument arrays which are returned by callbacks
		this._callbackArgsByKey = {}; // map of callbackKeyStr to callback arguments array
		this._started = false;
	}

	/*
		Create a watched callback. 
		callbackKeyStr - an optional arbitrary string used to identify the newly created callback.
	*/
	Watcher.prototype.makeCallback = function(callbackKeyStr)
	{
		if(arguments.length < 1){callbackKeyStr = '' + this._callbacks.length;}
		
		var callback = Utils.makeFunctor(
			{watcher: this, index: this._callbacks.length, callbackKeyStr: callbackKeyStr},
			function(){this.watcher._onCallback(this.index, this.callbackKeyStr, arguments);}
		);

		this._callbacks.push(callback);
		this._callbacksDone.push(false);
		this._callbackArgs.push([]);
		return callback;
	}

	/*
	    Begin waiting for all watched callbacks to be called.
		callback will receive an array of argument arrays corresponding to each watched callback's arguments.
	*/
	Watcher.prototype.start = function(callback)
	{
		this._started = true;
		Utils.addListener(this, 'doneEvent', callback);
		this._checkIfDone();
	}
	
	/*
		After all watched callbacks are complete, this method will retrieve the arguments for a watched callback.
		callbackKeyStr - the key string of the watched callback for which to retrieve arguments.
	*/
	Watcher.prototype.getCallbackArgs = function(callbackKeyStr)
	{
		return this._callbackArgsByKey[callbackKeyStr];
	}

	/*
		returns true if all watched callbacks have been called
	*/
	Watcher.prototype.isCallbacksDone = function()
	{
		for(var i=0; i < this._callbacksDone.length; ++i)
		{
			if(!this._callbacksDone[i]){return false;}
		}
		
		return true;
	}

	Watcher.prototype._onCallback = function(index, callbackKeyStr, args)
	{
		this._callbacksDone[index] = true;
		this._callbackArgs[index] = args;
		this._callbackArgsByKey[callbackKeyStr] = args;
		this._checkIfDone();
	}

	Watcher.prototype._checkIfDone = function()
	{
		if(!this._started || !this.isCallbacksDone()){return false;}
		if(this.doneEvent){this.doneEvent.apply(null, [this._callbackArgs]);}
		return true;
	}

	///

	return window.lib_S2C_LongTime = {
		Watcher: Watcher
	}
}