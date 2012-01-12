/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview JSON stringification - a wink.json extension.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Mathieu HELIOT
 */
define(['../../../_base/_base/js/base', './json'], function(wink)
{
	var _stack = new Array();
	
	/**
	 * Returns the JSON representation of a given value
	 * 
	 * <pre>
	 * Value can be an JS object or an array
	 * 
	 * Values as "undefined" and functions don't have string representation :
	 * 
	 *	- in arrays these values are represented as the null,
	 *	- in objects these values causes the property to be excluded from stringification.
	 * 
	 * Named properties are excluded from the stringification.
	 * 
	 * See also ECMAScript 5 specifications for more informations about the JSON structure. 
	 * </pre>
	 * 
	 * @param {object} value The object or array to transform
	 * 
	 * @returns {string} The stringified value of the object
	 * 
	 */
	wink.json.stringify = function(value)
	{
		var str;
		
		if ( value )
		{				
			if ( wink.isSet(window.JSON) && wink.isSet(window.JSON.stringify) )
			{
				str = window.JSON.stringify(value);
			} else
			{
				str = _str(value);
			}
		}
		
		return str;
	};	
	
	/**
	 * Transform an object to a validate JSON structure
	 * 
	 * according to ECMAScript 5 specifications.
	 * Returns 'undefined' for 'undefined' and function values
	 * 
	 * @param {object} value The value to transform
	 * 
	 * @returns {string} The stringified value
	 */
	var _str = function(value)
	{
		var str;
		var indent = '';
		var wrapper = new Object();
		
		if ( value && wink.isSet(value.toJSON) )
		{
			str = value.toJSON();
			
			if ( wink.isString(str) )
				str = _quote(str);
		} else
		{			
			if ( wink.isString(value) )
				str = _quote(value);
			
			else if ( wink.isNumber(value) )
				str = ( isFinite(value) ) ? value : 'null'; 
			
			else if ( wink.isNull(value) )
				str = 'null';

			else if ( wink.isBoolean(value) )
				str = ( value ) ? 'true' : 'false';
							
			else if ( !wink.isUndefined(value) && typeof(value) != 'function' )
				str = ( wink.isArray(value) ) ? _JA(value) : _JO(value);
		}
		
		return str;
	};
	
	/**
	 * Wraps a String value in double quotes and escapes characters within it.
	 * 
	 * @param {string} str The string to process
	 * 
	 * @returns {string} The escaped and quoted string
	 */
	var _quote = function(str)
	{		
		function _char(c)
		{
			var chars = {
		        '\b': '\\b',
		        '\t': '\\t',
		        '\n': '\\n',
		        '\f': '\\f',
		        '\r': '\\r',
		        '"' : '\\"',
		        '\\': '\\\\'
		    };
			
		    if ( !chars[c] )
		    	chars[c] =  '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
		    
		    return chars[c];
		}
		
		var product = '"',
			txt = str,			
			specialChars = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		
		str = txt.replace(specialChars, _char);
		str = product + str + product;
		
		return str;
	};
	
	/**
	 * Serializes an object.
	 * 
	 * @param {object} object The object to serialize
	 * 
	 * @returns {string} The serialized object
	 */	
	var _JO = function(object)
	{
		var propertyList = new Array(),
			partial = new Array();
		
		for ( var i=0 ; i<_stack.length ; i++ )	
	    {
			if ( _stack[i] == object )
			{
				wink.log('[JSON] The passed value is a cyclical structure.');
				return undefined;
			}
	    }
		
		_stack.push(object);
		
		for ( var attr in object )
			propertyList.push(attr);
		
		var strP,
			member,
			separator = ',',
			colon = ':';
		
		for ( var i=0 ; i<propertyList.length ; i++ )	
		{
			strP = _str(object[propertyList[i]]);

			if ( !wink.isUndefined(strP) )
			{
				member = _quote(propertyList[i]) + colon + strP;
				partial.push(member);
			}
		}
		
		if ( partial.length == 0 )
			str = '{}';
		
		else
		{
			var properties = '';
			
			for ( var i=0 ; i<partial.length ; i++ )
				properties += partial[i] + separator;
			
			properties = properties.slice(0,-1);
			str = '{' + properties + '}'; 
		}
		
		_stack.pop();
		
		return str;
	};
	
	/**
	 * Serializes an array.
	 * 
	 * @param {array} array The array to serialize
	 * 
	 * @returns {string} The serialized array
	 */
	var _JA = function(array)
	{
		var partial = new Array(),
			separator = ',',
			str;
		
		for ( var i=0 ; i<_stack.length ; i++ )	
	    {
			if ( _stack[i] == array )
			{
				wink.log('[JSON] The passed value is a cyclical structure.');
				return undefined;
			}
	    }
		
		_stack.push(array);
			
		var strP;
		
		for ( var i=0 ; i<array.length ; i++ )	
		{
			strP = _str(array[i]);
			
			partial.push( ( wink.isUndefined(strP) ) ? 'null' : strP );
		}
		
		if ( partial.length == 0 )
			str = '[]';
		
		else
		{
			var properties = '';
			
			for ( var i=0 ; i<partial.length ; i++ )
				properties += partial[i] + separator;
			
			properties = properties.slice(0,-1);
			str = '[' + properties + ']'; 
		}
		
		_stack.pop();
		
		return str;
	};
	
	return wink.json;
});