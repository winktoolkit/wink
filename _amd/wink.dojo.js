/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * Definition of wink core dependencies to use in conjunction with an AMD loader
 * 
 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 7.5, Windows Phone 8
 * @author Jerome GIRAUD
 */

var dojoBaseUrl = '../..';

define(
	[
	 	'../_base/_kernel/js/kernel',
		
	 	dojoBaseUrl + '/dojo/dom',
		dojoBaseUrl + '/dojo/dom-geometry',
		dojoBaseUrl + '/dojo/has',
		dojoBaseUrl + '/dojo/_base/lang',
	 	dojoBaseUrl + '/dojo/_base/connect',
	 	
	 	dojoBaseUrl + '/dojo/dom-class',
	 	dojoBaseUrl + '/dojo/dom-style',
	 	
	 	dojoBaseUrl + '/dojo/json',
	 	dojoBaseUrl + '/dojo/query',
	 	
	 	
	 	dojoBaseUrl + '/dijit/_base/manager',
	 	dojoBaseUrl + '/dijit/DialogUnderlay',
	 	
	 	dojoBaseUrl + '/dojox/math/round'
	 	
	 ], function(wink, dom, geom, has)
	{
		
		var slice = Array.prototype.slice;
		var wd = window;
		
		/***** wink/base *****/
		wink.version = '1.4.4';
		
		wink.api = {};
		wink.fx = {};
		wink.math = {};
		wink.mm = {};
		wink.net = {};
		wink.plugins = {};
		wink.ui = 
		{
			form: {},
			layout: {},
			xy: {},
			xyz: {}
		};
		wink.ux = {};
		
		// dojo/dom
		wink.byId = dom.byId;
		
		// dojo/query : No equivalent
		
		// No dojo equivalent
		wink.isUndefined = function(object) 
		{
			return (object === undefined);
		};
		
		wink.isNull = function(object)
		{
			return (object === null);
		};
		
		wink.isSet = function(object) 
		{
			return ((!wink.isUndefined(object)) && (!wink.isNull(object)));
		};
		
		wink.isCallback = function(callback) 
		{
			return !!((callback && callback.method) || wink.isFunction(callback));
		};
		
		wink.isInteger = function(object)
		{
			return (parseInt(object)===object);
		};
		
		wink.isNumber = function(object)
		{
			return (typeof object == "number" || object instanceof Number);
		};
		
		wink.isBoolean = function(object)
		{
			return (typeof object == "boolean" || object instanceof Boolean);
		};
		
		wink.setTimeout = function(context, method, delay)
		{
			var args = slice.call(arguments, 3);
			var toExecute = function()
			{
				context[method].apply(context, args);
			};
			return setTimeout(toExecute, delay);
		};
		
		wink.setInterval = function(context, method, delay)
		{
			var args = slice.call(arguments, 3);
			var toExecute = function()
			{
				context[method].apply(context, args);
			};
			return setInterval(toExecute, delay);
		};
		
		// dojo/_base/lang
		wink.isString = dojo.isString;
		wink.isFunction = dojo.isFunction;
		wink.isArray = dojo.isArray;
		
		//wink.trim = dojo.trim;
		wink.trim = dojo.trim;
		
		// No dojo equivalent
		wink.bind = function(method, context)
		{
			var args = slice.call(arguments, 2);
			return function()
			{
				var finalArgs = args.concat(slice.call(arguments, 0));
				return method.apply(context, finalArgs);
			};
		};
		
		wink.call = function(callback, parameters)
		{
			if (wink.isFunction(callback))
			{
				return callback.apply(wd, [parameters]);
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
		
		wink.setLocale = function(locale)
		{
			// Cannot change the dojo locale ; must be set at startup
		};
		
		_ = wink.translate = function(key, object)
		{
			var result = key;
			var i18n = wd.i18n || {};
			if (wink.isSet(object) && wink.isSet(object.i18n))
			{
				i18n = object.i18n;
			}
			var resourceList = i18n[dojoConfig.locale];
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
		
		// dojo/dom-geometry
		wink.getPosition = function(node, parentNode, transform)
		{
			return (geom.position(node, true));
		};
		
		wink.getTopPosition = function(node, parentNode, transform)
		{
			return (geom.position(node, true).y);
		};
		
		wink.getLeftPosition = function(node, parentNode, transform)
		{
			return (geom.position(node, true).x);
		};
		
		// dijit/_base/manager
		wink.getUId = function()
		{
			return dijit.getUniqueId('wink');
		};

		// dojo/_base/connect
		wink._connectHandles = [];
		
		wink.connect = function(source, method, callback)
		{
			var handle;
			
			if ( source == wd )
			{
				source = null;
			}
			
			if ( callback.context && callback.context == wd )
			{
				callback.context = null;
			}
			
			if ( wink.isFunction(callback) )
			{
				handle = dojo.connect(source, method, null, callback);
			} else
			{
				handle = dojo.connect(source, method, callback.context, callback.method);
			}
			
			wink._connectHandles.push([handle, source, method, callback]);
		};
		
		wink.disconnect = function(source, method, callback)
		{
			var isFn = wink.isFunction(callback);
			
			if ( source == wd )
			{
				source = null;
			}
			
			if ( callback.context && callback.context == wd )
			{
				callback.context = null;
			}
			
			var i, l = wink._connectHandles.length;
			for (i = 0; i < l; i++) 
			{
				var sti = wink._connectHandles[i];
				
				if (sti[1] == source && sti[2] == method && (isFn && callback == sti[3]) || (!isFn && sti[3].context == callback.context && sti[3].method == callback.method))
				{
					dojo.disconnect(sti[0]);
					wink._connectHandles.splice(i, 1);
					break;
				}
			}
		};
		
		/***** wink/json *****/
		// dojo/json
		wink.json = {};
		
		wink.parseJSON = wink.json.parse = function(str)
		{
			return JSON.parse(str, true);
		};
		
		// dojo/_base/kernel
		wink.mixin = wink.concat = dojo.mixin;
		
		/***** wink/topics *****/
		// dojo/_base/connect
		wink.topics =
		{
			_handles: [],
			subscribe: function(topic, callback)
			{
				var handle;
				
				if ( wink.isFunction(callback) )
				{
					handle = dojo.subscribe(topic, callback);
				} else
				{
					if (!wink.isSet(callback.context))
					{
						callback.context = wd;
					}
					
					handle = dojo.subscribe(topic, callback.context, callback.method);
				}
				
				wink.topics._handles.push([handle, topic.toLowerCase(), callback]);
			},
			
			unsubscribe: function(topic, callback)
			{
				var topicLower = topic.toLowerCase(),
				isFn = wink.isFunction(callback);
				
				if (!isFn && !wink.isSet(callback.context))
				{
					callback.context = wd;
				}
				
				var i, l = wink.topics._handles.length;
				for (i = 0; i < l; i++) 
				{
					var sti = wink.topics._handles[i];
					
					if (sti[1] == topicLower && ((isFn && callback == sti[2]) || (!isFn && sti[2].method == callback.method && sti[2].context == callback.context)))
					{
						dojo.unsubscribe(sti[0]);
						wink.topics._handles.splice(i, 1);
						break;
					}
				}
			},
			
			publish: function(topic, value)
			{
				dojo.publish(topic, [value]);
			}
		}
		
		wink.subscribe = wink.topics.subscribe;
		wink.unsubscribe = wink.topics.unsubscribe;
		wink.publish = wink.topics.publish;
		
		
		/***** wink/ui/xy/layer *****/
		// dijit/dialogUnderlay
		wink.layer = 
		{
			show: function()
			{
				if ( !this.dojoLayer )
				{
					this.dojoLayer = new dijit.DialogUnderlay();
				}
				
				this.dojoLayer.show();
			},
			
			hide: function()
			{
				if ( this.dojoLayer )
				{
					this.dojoLayer.hide();
				}
			},
			
			refresh: function()
			{
				if ( this.dojoLayer )
				{
					this.dojoLayer.layout();
				}
			},
			
			update: function()
			{
				wink.log('Wink/Dojo: modify styles via CSS');
			}
		}
		
		/***** wink/math/basic *****/
		// dojox/math/round
		wink.math.round = dojox.math.round;
		
		/***** wink/feat *****/
		var wh = wink.has;
		wink.has = function(feat)
		{
			var _f = ['json-parse', 'json-stringify'];

			if ( _f.indexOf(feat) != -1 )
			{
				return has(feat)
			} else
			{
				return wh(feat);
			}
		};
		
		/***** wink/net/xhr *****/
		wink.net.Xhr = function(properties)
		{
			this.uId = wink.getUId();
			this.properties = properties
		};
		
		wink.net.Xhr.prototype =
		{
			sendData: function(url, parameters, method, successCallback, failureCallback, headers, timeout)
			{
				var p = this.properties;
				var success, failure;
				
				success = function(data, request)
				{
					var args = 
					{
						xhrObject: request.xhr,
					    params: p
					};
					
					wink.call(successCallback, args);
				}
				
				failure = function(data, request)
				{
					var args = 
					{
						xhrObject: request.xhr,
					    params: p
					};
					
					wink.call(failureCallback, args);
				}
				
				var content = {};
				
				for ( var i in parameters )
				{
					content[parameters[i].name] = parameters[i].value;
				}
			
				var xhrArgs =
				{
					url: url,
					handleAs: 'text',
					headers: headers,
					timeout: timeout,
					content: content,
					load: success,
					error: failure
				}
				
				if ( method == 'POST' )
				{
					dojo.xhrPost(xhrArgs);
				} else
				{
					dojo.xhrGet(xhrArgs);
				}
			}
		};
		
		wink.Xhr = wink.net.Xhr;
		
		return wink;
	}
);