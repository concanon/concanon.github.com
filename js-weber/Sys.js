function importSys()
{
	if(importSys.lib){return importSys.lib;}
	
	function SysNode() // constructor
	{
		this.parent = null;
		this.as = new Object();
		this.as.SysNode = this;
		this.mainObj = this;
	}
	
	SysNode.prototype.event = function(eventName, data)
	{
		var event = new Object();
		event.name = eventName;
		event.downstream = true;
		event.upstream = false;
		event.isPropagating = true;
		
		var path = new Array();
		var node = this;
		
		do
		{
			path.push(node);
		}while(node = node.parent)
		
		// downstream 
		for(var i = path.length - 1; i >= 0 && event.isPropagating; --i)
		{
			if(path[i].mainObj[eventName]){path[i].mainObj[eventName](event, data);}
		}
		
		// upstream
		event.upstream = true;
		event.downstream = false;
		
		for(var i = 0; i < path.length && event.isPropagating; ++i)
		{
			if(path[i].mainObj[eventName]){path[i].mainObj[eventName](event, data);}
		}
		
		event.upstream = false;
	}
	
	SysNode.prototype.dataReq = function(dataName, fillCallback, noFillCallback)
	{
		var dataReq = new DataReq(this, dataName, fillCallback, noFillCallback);
		dataReq.runStep();
		return dataReq;
	}
	
	
	// DataReq Class //
	function DataReq(requester, dataName, fillCallback, noFillCallback) // constructor
	{
		this.requester = requester;
		this.dataName = dataName;
		this.originalFillCallback = fillCallback;
		this.originalNoFillCallback = noFillCallback;
		this.alive = true;
		this.downstream = true;
		this.upstream = false;
		
		this.path = new Array();
		var node = requester;
		
		do
		{
			this.path.push(node);
		}while(node = node.parent);
		
		this.pathIndex = this.path.length - 1;
	}
	
	DataReq.prototype.fillCallback = function()
	{
		if(this.alive)
		{
			this.originalFillCallback.apply(null, arguments);
			this.alive = false;
		}
	}
	
	DataReq.prototype.noFillCallback = function()
	{
		if(!this.alive){return;}
		
		if(this.downstream)
		{
			--this.pathIndex;
			
			if(this.pathIndex < 0)
			{
				this.downstream = false;
				this.upstream = true;
				this.pathIndex = 0;
			}
			
			this.runStep();
		}
		else
		{
			++this.pathIndex;
			
			if(this.pathIndex < this.path.length) 
			{
				this.runStep();
			}
			else
			{
				this.originalNoFillCallback.apply(null, arguments);
				this.alive = false;
			}
		}
	}
	
	DataReq.prototype.abort = function()
	{
		this.originalNoFillCallback.apply(null, arguments);
		this.alive = false;
	}
	
	DataReq.prototype.runStep = function()
	{
		this.path[this.pathIndex].handleDataReq(this);
	}
	// End DataReq Class //
	
	
	return importSys.lib = 
	{
		SysNode: SysNode
	};
}