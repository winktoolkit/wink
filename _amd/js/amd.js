/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Wink AMD loader
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

/**
 * AMD modules definition
 * 
 * @param {string} mid The unique id of the module
 * @param {array} dependencies The list of dependencies of the module
 * @param {function} factory The module constructor
 * 
 * @see For more information <a href="http://www.commonjs.org/" target="_blank">commmonJS</a>
 */
define = function(mid, dependencies, factory)
{
	//--> DUMB AMD define IMPLEMENTATION
	if (typeof wink == 'undefined')
	{
		wink = {};
	}

	var args = arguments, 
		arity = args.length, 
		f, 
		d = null;
	
	if ( arity == 1 )
	{
		f = args[0];
	}
	else if (  arity == 2 )
	{
		f = args[1];
		if (typeof args[0] == "array" || args[0] instanceof Array)
		{
			d = args[0];
		}
	}
	else
	{
		f = args[2];
		d = args[1];
	}
	
	return f(wink);
	//<-- DUMB AMD define IMPLEMENTATION
};


define.amd =
{
	vendor: 'winktoolkit.org'
};