function importHtmlUtils()
{
if(importHtmlUtils.lib){return importHtmlUtils.lib;}

//returns {myClass : [myElement1, ...], ... } of all named children of node
//invoke with 1 argument - getClassedNodes(node)
//node is element object
function getClassedNodes(node, classedNodes)
{
	if(arguments.length < 2){classedNodes = new Object();}

	if(typeof node == 'string')
	{node = document.getElementById(node);}

	if(node.className != undefined)
	{
		var classNames = node.className.split(' ');
		
		for(var k in classNames)
		{
			if(classedNodes[classNames[k]] == undefined)
				{classedNodes[classNames[k]] = new Array();}
			classedNodes[classNames[k]].push(node);
		}
	}
	
	for(var i=0; i < node.childNodes.length; ++i)
	{getClassedNodes(node.childNodes[i], classedNodes);}
	
	return classedNodes;
}


function loadScript(scriptUrl, waitSeconds, callback, failCallback)
{
	var waiter = new Object();
	waiter.loaded = false;
	setTimeout(function(){if(!waiter.loaded){failCallback();}}, waitSeconds * 1000);

   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   head.appendChild(script);
   script.addEventListener('load', function(){waiter.loaded = true; callback();});
   script.src = scriptUrl;
}



return importHtmlUtils.lib = 
{
	getClassedNodes: getClassedNodes,
	loadScript: loadScript
}
}