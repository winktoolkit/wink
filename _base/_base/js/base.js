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
	wink.version = '1.4.2';
	
	/**
	 * @namespace Gathers all the HTML5 APIs related components
	 */
	wink.api = {};
	
	/**
	 * @namespace Gathers all things related to CSS effects
	 * 
	 * @compatibility 
	 * 
	 * <b>2D fx</b> Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Bada 1.0, Windows Phone 7.5
	 * <br />
	 * <b>3D fx</b> Iphone OS2, Iphone OS3, Iphone OS4, Android 3.0, Android 3.1, BlackBerry 7
	 * 
	 * @see <a href="WINK_ROOT_URL/fx/_xy/test/test_xy_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/fx/_xy/test/test_xy_2.html" target="_blank">Test page (transition)</a>
	 * @see <a href="WINK_ROOT_URL/fx/_xyz/test/test_xyz.html" target="_blank">Test page (3d)</a>
	 */
	wink.fx = {};
	
	/**
	 * @namespace A set a of mathematical libraries and methods
	 * 
	 * @compatibility
	 * 
	 * <b>basics</b> Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
	 * <br />
	 * <b>geometrics</b> Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
	 * <br />
	 * <b>matrix</b> Iphone OS2, Iphone OS3, Iphone OS4, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
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
	 * @returns {object} Returns a wrapper containing an array of the DOM elements corresponding to the query
	 * 
	 * @example
	 * 
	 * var test = wink.query('.MyClass');
	 * var test2 = $$('input[type=radio]');
	 * 
	 * $$(".MyClass").removeClass("hidden").addClass("active");

	 * $$(".MyClass").translate(20, 20).rotate(2);
	 * var positions = $$(".MyClass").getPosition();
	 * 
	 * if ($$("#box").hasClass("visible")) {
	 *   $$("#box").applyTransition("background-color", "1s", "1ms", "linear").apply({ "background-color": "blue" });
	 *   $$("#box").listenTo("rotation", function(gestureInfos) {
	 *     console.log("rotation [" + gestureInfos.rotation + "deg]");
	 *   });
	 * }
	 * 
	 */
	wink.query = function(selector, element)
	{
		return new QueryWrapper(selector, element);
	};
	
	/**
	 * The QueryWrapper wraps the result of a query selection, allowing to chain some wink calls for each element
	 */
	var QueryWrapper = (function() {
		var wrapper = function(selector, element) {
			if (wink.isUndefined(wrapper.prototype.initialized)) {
				this.init();
			}
			
			var r;
			try {
				r = slice.call((element||document).querySelectorAll(selector));
			} catch (e) {
				r = [];
			}
			var l = this.length = r.length;
			
			for (var i = 0; i < l; i++) {
				this[i] = r[i];
			}
			this.selector = selector;
			
			return this;
		};
		
		var wp = wrapper.prototype = {
			/**
			 * Initialize the wrapper prototype's methods
			 * @ignore
			 */
			init: function() {
				wp.each([
					"pop", "push", "reverse", "shift", "sort", "splice", "unshift", "slice", "indexOf", "lastIndexOf"
				], function(i, name) {
					wp[name] = [][name];
				});
				
				wink.query.extend(wink, [ "getPosition", "getTopPosition", "getLeftPosition" ], true);
				wink.query.extend(wink.fx, [ "getTransformPosition", "hasClass" ], true);
				wink.query.extend(wink.fx, [ "translate", "rotate", "scale", "addClass", "removeClass", 
				                             "apply", "applyTransition", "applyTransformTransition", "onTransitionEnd" ], false);
				wink.query.extend(wink.ux.gesture, [ "listenTo", "unlistenTo" ], false);
				
				wp.initialized = true;
			},
			/**
			 * Extends the wrapper. The user can extend another wrapper by giving it as a parameter.
			 * @ignore
			 */
			extend: function(context, methods, withResult, wrapper) {
				var thewp = wrapper || wp,
					map = {};
				
				var i, l = methods.length;
				for (var i = 0; i < l; i++) {
					var mi = methods[i],
						f = context ? context[mi] : null;
					if (wink.isFunction(f)) {
						map[mi] = { c: context, f: f, r: withResult };
					}
				}
				
				wp.each(map, function(method, props) {
					var f = props.f,
						ctx = props.c,
						withResult = props.r;
					thewp[method] = function() {
						var l = this.size();
						if (l == 0) {
							return;
						}
						var i, nodes = this.toArray(), res = [], argus = this.splice.call(arguments, 0);
						for (i = 0; i < l; i++) {
							res.push(f.apply(ctx, [ nodes[i] ].concat(argus)));
						}
						if (!withResult) {
							return this;
						}
						if (res.length == 1) {
							return res[0];
						}
						return res;
					};
				});
			},
			/**
			 * @ignore
			 */
			size: function() {
				return this.length;
			},
			/**
			 * Gets an array of selected elements
			 * @ignore
			 */
			toArray: function() {
				return slice.call(this, 0);
			},
			/**
			 * Call the callback for each element of the list
			 * @ignore
			 */
			each: function(list, callback) {
				for (i in list) {
					var li = list[i];
					callback.call(li, i, li);
				}
			}
		};
		
		return wrapper;
	})();
	
	/**
	 * Extends the wrapper
	 */
	wink.query.extend = QueryWrapper.prototype.extend;
	
	
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
	 * A callback can be also a function.
	 * 
	 * @param {object|function} callback The object to test
	 * 
	 * @returns {boolean} True if the object is a valid callback false otherwise
	 */
	wink.isCallback = function(callback) 
	{
		return !!((callback && callback.method) || wink.isFunction(callback));
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
	 * @param {object|function} callback The callback to invoke
	 * @param {object} [parameters] Parameters to pass to the callback
	 * 
	 * @returns {function} The called function
	 * 
	 * @example
	 * 
	 * var ctx = {
	 *   fn: function(params, message) {
	 *     console.log("fn: ", params.property, message);
	 *   }
	 * };
	 * var fn2 = function(message, params) {
	 *   console.log("fn2: ", params.property, message);
	 * };
	 * wink.call({ context: ctx, method: 'fn', arguments: "message" }, { property: "value" });
	 * wink.call(wink.bind(fn2, this, "message"), { property: "value" });
	 * 
	 */
	wink.call = function(callback, parameters)
	{
		if (wink.isFunction(callback))
		{
			return callback.apply(wd, wink.isArray(parameters) ? parameters : [parameters]);
		}
		
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
	 * @param {object|function} callback A callback that will be called once the source method will be invoked
	 */
	wink.connect = function(source, method, callback)
	{
		var isFn = wink.isFunction(callback);
		if (!isFn && !wink.isSet(callback.context))
		{
			callback.context = wd;
		}
		
		var f = source[method];
		
		if ( wink.isNull(f) || wink.isUndefined(f.cbs) )
		{
			var _source = function()
			{
				var target = _source.target,
					args = [].splice.call(arguments, 0);
				
				target && target.apply(source, args);

				var i, cbs = _source.cbs, l = cbs.length;
				for (i = 0; i < l; i++)
				{
					var cb = cbs[i];
					if (wink.isFunction(cb))
					{
						wink.call(cb, args);
					}
					else
					{
						wink.call({ context: cb.context, method: cb.method, arguments: args.concat(cb.arguments) });
					}
				}
			};
			
			_source.target = f;
			_source.cbs = [];
			
			f = source[method] = _source;
		}

		var i, cbs = f.cbs, l = cbs.length;
		for (i = 0; i < l; i++)
		{
			var cb = cbs[i];
			if ((isFn && callback == cb) || (!isFn && cb.context == callback.context && cb.method == callback.method))
			{
				return
			}
		}

		cbs.push(callback);
	};
	
	/**
	 * Disconnect two methods
	 * 
	 * @param {object} source The source context that was previously connected
	 * @param {string} method The source method that was previously connected
	 * @param {object|function} callback The callback that was previously connected
	 */
	wink.disconnect = function(source, method, callback)
	{
		var isFn = wink.isFunction(callback);
		if (!isFn && !wink.isSet(callback.context))
		{
			callback.context = wd;
		}
		
		var f = source[method];
		
		if ( !wink.isUndefined(f.cbs) )
		{
			var i, cbs = f.cbs, l = cbs.length;
			for (i = 0; i < l; i++)
			{
				var cb = cbs[i];
				if ((isFn && callback == cb) || (!isFn && cb.context == callback.context && cb.method == callback.method))
				{
					cbs.splice(i, 1);
					break;
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
	
	/**
	 * Retrieve the position of a node (top, left and transform if specified)
	 * 
	 * @param {HTMLElement} node The node
	 * @param {HTMLElement} [parentNode] If specified, the returned value is relative to the parentNode node. If parentNode is not a parent node of the current HTML element or if not specified, the returned value will be an absolute position
	 * @param {boolean} [transform] Take CSS transforms into account while calculating the position
	 * 
	 * @returns {object} the x and y position of the element
	 */
	wink.getPosition = function(node, parentNode, transform)
	{
		var position = {x: 0, y: 0};
		var obj = node;

		while (obj && obj != parentNode) 
		{
			position.x += obj.offsetLeft;
			position.y += obj.offsetTop;

			if ( transform )
			{
				position.x += wink.fx.getTransformPosition(obj).x;
				position.y += wink.fx.getTransformPosition(obj).y;
			}
			
			obj = obj.offsetParent;
		}
		
		return position;
	};
		
	/**
	 * Retrieve the top position of a node (top and transform if specified)
	 * 
	 * @param {HTMLElement} node The node
	 * @param {HTMLElement} [parentNode] If specified, the returned value is relative to the parentNode node. If parentNode is not a parent node of the current HTML element or if not specified, the returned value will be an absolute top position
	 * @param {boolean} [transform] Take CSS transforms into account while calculating the position
	 * 
	 * @returns {integer} the y position of the element
	 */
	wink.getTopPosition = function(node, parentNode, transform)
	{
		return (wink.getPosition(node, parentNode, transform).y);
	};
	
	/**
	 * Retrieve the top position of a node (left and transform if specified)
	 * 
	 * @param {HTMLElement} node The node
	 * @param {HTMLElement} [parentNode] If specified, the returned value is relative to the parentNode node. If parentNode is not a parent node of the current HTML element or if not specified, the returned value will be an absolute left position
	 * @param {boolean} [transform] Take CSS transforms into account while calculating the position
	 * 
	 * @returns {integer} The x position of the element
	 */
	wink.getLeftPosition = function(node, parentNode, transform)
	{
		return (wink.getPosition(node, parentNode, transform).x);
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
	
	if (wink.isUndefined(wd.$))
	{
		/**
		 * @function
		 * @see wink.query
		 */
		$ = function() {
			if ( console )
			{
				console.log("$ is deprecated: the use of wink.query or $$ methods is recommanded");
			}
			return wink.query.apply(wink, arguments);
		};
	}
	
	if (wink.isUndefined(wd.$$))
	{
		/**
		 * @function
		 * @see wink.query
		 */
		$$ = wink.bind(wink.query, wink);
	}
	
	return wink;
});