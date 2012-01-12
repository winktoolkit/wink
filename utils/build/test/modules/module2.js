wink.fx = 
{
	addClass: function(node, classStr) 
	{
		var cls = node.className;
		if ((" " + cls + " ").indexOf(" " + classStr + " ") < 0)
		{
			node.className = cls + (cls ? ' ' : '') + classStr;
		}
	} ,
	removeClass: function(node, classStr)
	{
		var t = wink.trim((" " + node.className + " ").replace(" " + classStr + " ", " "));
		if (node.className != t)
		{
			node.className = t;
		}
	}
};

external.fn1 = function() {
	
};