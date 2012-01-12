/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Wink main object and core methods
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

define(['../../_kernel/js/kernel'], function(wink)
{
	/**
	 * The version of Wink currently in use
	 * 
	 * @property
	 * @type string
	 */
	wink.version = '1.4.1';
	
	/**
	 * @namespace Gathers all the HTML5 APIs related components
	 */
	wink.api = {};
	
	/**
	 * @namespace Gathers all things related to CSS effects
	 * 
	 * @see <a href="WINK_ROOT_URL/fx/_xy/test/test_xy_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/fx/_xy/test/test_xy_2.html" target="_blank">Test page (transition)</a>
	 * @see <a href="WINK_ROOT_URL/fx/_xyz/test/test_xyz.html" target="_blank">Test page (3d)</a>
	 */
	wink.fx = {};
	
	/**
	 * @namespace A set a of mathematical libraries and methods
	 * 
	 * @see <a href="WINK_ROOT_URL/math/_basics/test/test_basics.html" target="_blank">Test page (basics)</a>
	 * @see <a href="WINK_ROOT_URL/math/_geometric/test/test_geometric.html" target="_blank">Test page (geometric)</a>
	 * @see <a href="WINK_ROOT_URL/math/_matrix/test/test_matrix.html" target="_blank">Test page (matrix)</a>
	 */
	wink.math = {};
	
	/**
	 * @namespace Gathers all the multimedia components
	 */
	wink.mm = {};
	
	/**
	 * @namespace Gathers all the network related components
	 */
	wink.net = {};
	
	/**
	 * @namespace Gathers all the wink plugins
	 */
	wink.plugins = {};
	
	/**
	 * @namespace Gathers all the UI components
	 */
	wink.ui = 
	{
		/**
		 * @namespace Gathers all the form components
		 */
		form: {},
		/**
		 * @namespace Gathers all the layout components
		 */
		layout: {},
		/**
		 * @namespace Gathers all the 2D components
		 */
		xy: {},
		/**
		 * @namespace Gathers all the 3D components
		 */
		xyz: {}
	};
	
	/**
	 * @namespace Gathers all the interactions components
	 */
	wink.ux = {};
	
	var slice = Array.prototype.slice;
	var wd = window;
	
	/**
	 * Returns a DOM element
	 * 
	 * @param {string} id The identifier of the DOM element to return
	 * @returns {HTMLElement} Returns the DOM ellement if it has been found or the id otherwise
	 * 
	 * @example
	 * 
	 * var test = wink.byId('myComponent');
	 * var test2 = $('myComponent');
	 * 
	 */
	wink.byId = function(id)
	{
		if (wink.isString(id)) 
		{
			return document.getElementById(id);
		} else 
		{
			return id;
		}
	};
	
	/**
	 * Execute a query and returns the corresponding DOM elements
	 * 
	 * @param {string} selector The query selector you want to use
	 * @param {HTMLElement} [element] The element where you want to search
	 * 
	 * @returns {array} Returns an array containing the DOM elements corresponding to the query
	 * 
	 * @example
	 * 
	 * var test = wink.query('.MyClass');
	 * var test2 = $$('input[type=radio]');
	 * 
	 */
	wink.query = function(selector, element)
	{
		return slice.call((element||document).querySelectorAll(selector));
	};
	
	var _winklocale = "en_EN";
	/**
	 * Set wink locale used for translation
	 * 
	 * @param {string} locale The lang you want to set
	 */
	wink.setLocale = function(locale)
	{
		_winklocale = locale;
	};
	
	/**
	 * Returns the translated value of a key
	 * 
	 * @param {String} key The key identifying a ressource
	 * @param {Object} [object] The component that holds the resource list (within an i18n object)
	 * 
	 * @returns {string} The translated value of the key
	 * 
	 * @example
	 * 
	 * var test = wink.translate('myText')
	 * var test2 = _('myText');
	 * 
	 */
	wink.translate = function(key, object)
	{
		var result = key;
		var i18n = window.i18n || {};
		if (wink.isSet(object) && wink.isSet(object.i18n))
		{
			i18n = object.i18n;
		}
		var resourceList = i18n[_winklocale];
		if (wink.isUndefined(resourceList)) {
			resourceList = i18n;
		}
		var value = resourceList[key];
		if (!wink.isUndefined(value))
		{
			result = value;
		}
		return result;
	};
	
	/**
	 * Returns true if the given parameter is undefined, false otherwise.
	 * 
	 * @param {object} object The object to test
	 *  
	 * @returns {boolean} True if the object is undefined false otherwise
	 */
	wink.isUndefined = function(object) 
	{
		return (object === undefined);
	};
	
	/**
	 * Returns true if the given parameter is null, false otherwise.
	 * 
	 * @param {object} object The object to test
	 *  
	 * @returns {boolean} True if the object is null false otherwise
	 */
	wink.isNull = function(object)
	{
		return (object === null);
	};
	
	/**
	 * Returns true if the given parameter is set, false otherwise.
	 * 
	 * @param {object} object The object to test
	 * 
	 * @returns {boolean} True if the object is set false otherwise
	 */
	wink.isSet = function(object) 
	{
		return ((!wink.isUndefined(object)) && (!wink.isNull(object)));
	};
	
	/**
	 * Returns true if the given callback object is valid (contains at least a method. It can also contain a context)
	 * 
	 * @parmam {object} callback The object to test
	 * 
	 * @returns {boolean} True if the object is a valid callback false otherwise
	 */
	wink.isCallback = function(callback) 
	{
		return !!(callback && callback.method);
	};
	
	/**
	 * Returns true if the given parameter is a string, false otherwise.
	 * 
	 * @param {object} object The object to test
	 *  
	 * @returns {boolean} True if the object is a string false otherwise
	 */
	wink.isString = function(object) 
	{
		return (typeof object == "string" || object instanceof String);
	};
	
	/**
	 * Returns true if the given parameter is an integer
	 * 
	 * @param {object} object The object to test
	 * 
	 * @returns {boolean} True if the object is an integer false otherwise
	 */
	wink.isInteger = function(object)
	{
		return (parseInt(object)===object);
	};
	
	/**
	 * Returns true if the given parameter is a number
	 * 
	 * @param {object} object The object to test
	 * 
	 * @returns {boolean} True if the object is a number false otherwise
	 */
	wink.isNumber = function(object)
	{
		return (typeof object == "number" || object instanceof Number);
	};
	
	/**
	 * Returns true if the given parameter is an array
	 * 
	 * @param {object} object The object to test
	 * 
	 * @returns {boolean} True if the object is an array false otherwise
	 */
	wink.isArray = function(object)
	{
		return (typeof object == "array" || object instanceof Array);
	};
	
	/**
	 * Returns true if the given parameter is a boolean
	 * 
	 * @param {object} object The object to test
	 * 
	 * @returns {boolean} True if the object is a boolean false otherwise
	 */
	wink.isBoolean = function(object)
	{
		return (typeof object == "boolean" || object instanceof Boolean);
	};
	
	/**
	 * Returns true if the given parameter is a function
	 * 
	 * @param {object} object The object to test
	 * 
	 * @returns {boolean} True if the object is a function false otherwise
	 */
	wink.isFunction = function(object)
	{
		return Object.prototype.toString.call(object) === "[object Function]";
	};
	
	/**
	 * Returns the given string parameter trimed.
	 * 
	 * @param {string} str The string to trim
	 *  
	 * @returns {string} The trimmed string
	 */
	wink.trim = function(str) 
	{
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	};
	
	/**
	 * Binds a method to a given context
	 * 
	 * @param {string} method The method to bind
	 * @param {object} context The scope with which the method will be executed
	 * @param {object} [arguments] Arguments to pass to the binded function
	 * 
	 * @returns {function} The binded function
	 */
	wink.bind = function(method, context /*[, arg1 [, arg2 ... ] ]*/)
	{
		var args = slice.call(arguments, 2);
		return function()
		{
			var finalArgs = args.concat(slice.call(arguments, 0));
			return method.apply(context, finalArgs);
		};
	};
	
	/**
	 * Invokes the given callback
	 * 
	 * @param {object} callback The callback to invoke. The callback must be an object containing a 'method' and a 'context'.
	 * @param {object} [parameters] Parameters to pass to the callback
	 * 
	 * @returns {function} The called function
	 */
	wink.call = function(callback, parameters)
	{
		var context = wd;
		var method = callback.method;
		var args = [];
		
		if (wink.isSet(callback.context))
		{
			context = callback.context;
		}
	
		if (arguments.length == 2)
		{
			args = [parameters];
		}
		if (wink.isSet(callback.arguments))
		{
			var additional = callback.arguments;
			if (!wink.isArray(additional)) {
				additional = [callback.arguments];
			}
			args = args.concat(additional);
		}
		return context[method].apply(context, args);
	};
	
	/**
	 * Connect a method to another method
	 * 
	 * @param {object} source The source context
	 * @param {string} method The source method
	 * @param {object} callback A callback that will be called once the source method will be invoked
	 */
	wink.connect = function(source, method, callback)
	{
		if (!wink.isSet(callback.context)) callback.context = wd;
		
		var f = source[method];
		
		if ( wink.isNull(f) || wink.isUndefined(f.cbs) )
		{

			var _source = function()
			{
				var target = arguments.callee.target;
				var args = [];
				
				var i, l = arguments.length;
				for ( i=0; i<l; i++ )
				{
					var argi = arguments[i];
					if ( wink.isArray(argi))
					{
						args = args.concat([argi]);
					} else
					{
						args = args.concat(argi);
					}
				}
				
				target && target.apply(source, args);
				
				var cbs = source[method].cbs;
				
				for ( var cb in cbs)
				{
					if ( !wink.isArray(cbs[cb].arguments) )
					{
						wink.call({context: cbs[cb].context, method: cbs[cb].method, arguments: args.concat([cbs[cb].arguments])});
					} else
					{
						wink.call({context: cbs[cb].context, method: cbs[cb].method, arguments: args.concat(cbs[cb].arguments)});
					}
				}
			};
			
			_source.target = f;
			_source.cbs = [];
			
			f = source[method] = _source;
		}

		for ( var cb in f.cbs)
		{
			if ( (f.cbs[cb].context == callback.context) && (f.cbs[cb].method == callback.method))
			{
				return
			}
		}

		f.cbs.push(callback);
	};
	
	/**
	 * Disconnect two methods
	 * 
	 * @param {object} source The source context that was previously connected
	 * @param {string} method The source method that was previously connected
	 * @param {object} callback The callback that was previously connected
	 */
	wink.disconnect = function(source, method, callback)
	{
		if (!wink.isSet(callback.context)) callback.context = wd;
		
		var f = source[method];
		
		if ( !wink.isUndefined(f.cbs) )
		{
			for ( var cb in f.cbs)
			{
				if ( (f.cbs[cb].context == callback.context) && (f.cbs[cb].method == callback.method))
				{
					delete f.cbs[cb];
				}
			}
		}
	};
	
	/**
	 * Calls a deferred method.
	 * 
	 * @param {object} context The execution context of the method to call 
	 * @param {string} method The method to call
	 * @param {integer} delay Time to wait before calling method
	 * @param {object} [arguments] A list of caller arguments
	 * 
	 * @returns {object} The timeout object
	 */
	wink.setTimeout = function(context, method, delay /*[, arg1 [, arg2 ... ] ]*/)
	{
		var args = slice.call(arguments, 3);
		var toExecute = function()
		{
			context[method].apply(context, args);
		};
		return setTimeout(toExecute, delay);
	};
	
	/**
	 * Calls a deferred method.
	 * 
	 * @param {object} context The execution context of the method to call 
	 * @param {string} method The method to call
	 * @param {integer} delay Time to wait before calling method
	 * @param {object} [arguments] A list of caller arguments
	 * 
	 * @returns {object} The interval object
	 */
	wink.setInterval = function(context, method, delay /*[, arg1 [, arg2 ... ] ]*/)
	{
		var args = slice.call(arguments, 3);
		var toExecute = function()
		{
			context[method].apply(context, args);
		};
		return setInterval(toExecute, delay);
	};
	

	var _uidSequence = 100;
	/**
	 * Generates a unique identifier
	 * 
	 * @returns {integer} The unique id
	 */
	wink.getUId = function()
	{
		return (_uidSequence += 1);
	};
	
	
	if (wink.isUndefined(wd._))
	{
		/**
		 * @function
		 * @see wink.translate
		 */
		_ = wink.bind(wink.translate, wink);
	}
	
	if (wink.isUndefined(wd.$$))
	{
		/**
		 * @function
		 * @see wink.query
		 */
		$$ = wink.bind(wink.query, wink);
	}
	
	if (wink.isUndefined(wd.$))
	{
		/**
		 * @function
		 * @see wink.byId
		 */
		$ = wink.bind(wink.byId, wink);
	}
	
	return wink;
});