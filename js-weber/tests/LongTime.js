// requires Utils

function importLongTime()
{
if(importLongTime.lib){return importLongTime.lib;}

var Utils = importUtils();

///////////////////
// Stepper Class //
///////////////////

function Stepper(userDataObj, arrayOfFunctions) // constructor
{
	var cbStepper = this;
	this.data = userDataObj ? userDataObj : new Object();
	this.data.stepper = this;
	this.nextStepCallback = function(){cbStepper.nextStep.apply(cbStepper, arguments);};
	this.data.nextStepCallback = this.nextStepCallback;
	this.steps = new Array();
	this.nextStepIndex = 0;
	this.currentStepIndex = 0;
	if(arrayOfFunctions){this.addSteps(arrayOfFunctions);}
}

Stepper.STARTIF = 1;
Stepper.ENDIF = 2;
Stepper.ELSE = 3;
Stepper.STARTWHILE = 4;
Stepper.ENDWHILE = 5;

Stepper.prototype.nextStep = function()
{
	if(this.nextStepIndex == this.steps.length){return;}
	
	this.currentStepIndex = this.nextStepIndex++;
	
	if(this.steps[this.currentStepIndex] == Stepper.STARTIF 
		|| this.steps[this.currentStepIndex] == Stepper.ENDIF)
	{
		Stepper.prototype.nextStep.apply(this, arguments);
		return;
	}
	
	if(this.steps[this.currentStepIndex] == Stepper.ELSE)
	{
		do
		{
			this.currentStepIndex = this.nextStepIndex++;
		}
		while(this.steps[this.currentStepIndex] != Stepper.ENDIF);
		
		Stepper.prototype.nextStep.apply(this, arguments);
		return;
	}
	
	if(this.steps[this.currentStepIndex] == Stepper.STARTWHILE)
	{
		Stepper.prototype.nextStep.apply(this, arguments);
		return;
	}
	
	if(this.steps[this.currentStepIndex] == Stepper.ENDWHILE)
	{
		var innerWhileCount = 0;
		var exitingWhileLoop = false;
		
		do
		{
			--this.currentStepIndex;
			--this.nextStepIndex;
			
			if(exitingWhileLoop)
			{
				--innerWhileCount;
				exitingWhileLoop = false;
			}
			
			if(this.steps[this.currentStepIndex] == Stepper.ENDWHILE)
			{++innerWhileCount;}
			
			if(this.steps[this.currentStepIndex] == Stepper.STARTWHILE)
			{exitingWhileLoop = true;}
		}
		while(this.steps[this.currentStepIndex] != Stepper.STARTWHILE || innerWhileCount > 0)
		
		Stepper.prototype.nextStep.apply(this, arguments);
		return;
	}
	
	var isLastStep = this.currentStepIndex == (this.steps.length - 1); // to support recursive invocations resulting from running the step
	
	try{
		this.steps[this.currentStepIndex].apply(this.data, arguments);
	}catch(e){
		if(this.exceptionEvent){this.exceptionEvent.apply(null, [e]);}
	}
	
	if(isLastStep)
	{if(this.doneEvent){this.doneEvent.apply(null, []);}}
}

Stepper.prototype.addSteps = function(arrayOfFunctions)
{
	this.steps = this.steps.concat(arrayOfFunctions);
}

Stepper.prototype.IF = function(bool)
{
	if(bool)
	{
		this.nextStep();
	}
	else
	{
		var innerIfCount = 0;
		var exitingIfBlock = false;
		
		do
		{
			this.currentStepIndex = this.nextStepIndex++;
			
			if(exitingIfBlock)
			{
				--innerIfCount;
				exitingIfBlock = false;
			}
			
			if(this.steps[this.currentStepIndex] == Stepper.STARTIF)
			{++innerIfCount}
			else if(innerIfCount > 0 && this.steps[this.currentStepIndex] == Stepper.ENDIF)
			{exitingIfBlock = true;}
		}
		while(
			(this.steps[this.currentStepIndex] != Stepper.ENDIF
			&& this.steps[this.currentStepIndex] != Stepper.ELSE)
			|| innerIfCount != 0
		);
		
		Stepper.prototype.nextStep.apply(this, arguments);
	}
}


Stepper.prototype.WHILE = function(bool)
{
	if(bool)
	{
		this.nextStep();
	}
	else
	{
		var innerWhileCount = 0;
		var exitingWhileLoop = false;
		
		do
		{
			this.currentStepIndex = this.nextStepIndex++;
			
			if(exitingWhileLoop)
			{
				--innerWhileCount;
				exitingWhileLoop = false;
			}
			
			if(this.steps[this.currentStepIndex] == Stepper.STARTWHILE)
			{
				++innerWhileCount;
			} else if(innerWhileCount > 0 && this.steps[this.currentStepIndex] == Stepper.ENDWHILE)
			{
				exitingWhileLoop = true;
			}
		}
		while(this.steps[this.currentStepIndex] != Stepper.ENDWHILE || innerWhileCount > 0);
		this.nextStep();
	}
}
//public read, invoke Stepper.nextStepCallback
//public read, write, invoke Stepper.doneEvent

/////////////////
// End Stepper //
/////////////////


function runSteps(dataObj, arrayOfFunctions, callback)
{
	if(!runSteps.steppers){runSteps.steppers = new Array();}
	var stepper = new Stepper(dataObj, arrayOfFunctions);
	runSteps.steppers.push(stepper);
	Utils.addListener(stepper, 'doneEvent', function(){runStepsDone(stepper, callback);});
	stepper.nextStepCallback();
}

function runStepsDone(stepper, callback)
{    
	for(var i=0; i < runSteps.steppers.length; ++i) // remove reference to the stepper so it can be garbaged, since it's done
	{
		if(runSteps.steppers[i] == stepper)
		{runSteps.stppers = runSteps.steppers.splice(i, 1);}
	}
	
	if(callback){callback();}
}

/////////////
// Watcher //
/////////////

function Watcher() // constructor
{
	this.callbacks = new Array();
	this.callbacksDone = new Array();
	this.numCallbacksDone = 0;
	importUtils().addListener(this, 'doneEvent', function(){});
}

Watcher.prototype.makeCallback = function()
{	
	var callback = Utils.makeFunctor(
		{watcher: this, index: this.callbacks.length},
		function(){this.watcher.onCallback(this.index);}
	);

	this.callbacks.push(callback);
	this.callbacksDone.push(false);
	return callback;
}

Watcher.prototype.onCallback = function(index)
{
	this.callbacksDone[index] = true;
	++this.numCallbacksDone;
	
	if(this.numCallbacksDone == this.callbacks.length)
	{
		if(this.doneEvent){this.doneEvent();}
	}
}

Watcher.prototype.isCallbackDone = function(index)
{
	return this.callbacksDone[index];
}
/////////////////
// End Watcher //
/////////////////

return importLongTime.lib = 
{
	Stepper: Stepper,
	runSteps: runSteps,
	Watcher: Watcher
}
	
}