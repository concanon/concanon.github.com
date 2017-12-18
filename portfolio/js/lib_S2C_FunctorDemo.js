
function getLib_S2C_FunctorDemo()
{
	if(window.S2C_FunctorDemo){return S2C_FunctorDemo;}

	var utils = getLib_S2C_Utils();
	var makeFunctor = utils.makeFunctor;
	
	function basicFunctorDemo()
	{
		var adder = makeFunctor({a: 0, b: 0}, function(){return this.a + this.b;});
		
		alert('The result of adder() is: ' + adder());
		
		adder.a = 2;
		adder.b = 3;
		
		alert('The new result of adder() is: ' + adder());
	}
	
	function initButtonArea1()
	{
		var buttonAreaElt = document.getElementsByClassName('functorsArea')[0].getElementsByClassName('buttonArea')[0];
		var btnElts = buttonAreaElt.getElementsByTagName('button');
		
		for(var i=0; i < 3; ++i)
		{
			btnElts[i].addEventListener('click', function(){alert('Performing action #' + i);});
		}
	}
	
	function initButtonArea2()
	{
		var buttonAreaElt = document.getElementsByClassName('functorsArea')[0].getElementsByClassName('buttonArea')[1];
		var btnElts = buttonAreaElt.getElementsByTagName('button');
		
		for(var i=0; i < 3; ++i)
		{
			btnElts[i].addEventListener('click', 
				makeFunctor(
					{i: i},
					function(){alert('Performing action #' + this.i);}
				)
			);
		}
	}
	
	function init()
	{
		initButtonArea1();
		initButtonArea2();
	}
	
	return window.S2C_FunctorDemo = {
		init: init,
		basicFunctorDemo: basicFunctorDemo
	};
}

