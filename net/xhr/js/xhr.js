/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview XHR utility
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

define(['../../../_base/_base/js/base', '../../../_base/error/js/error'], function(wink) 
{
	var isSet = wink.isSet;
	var isArray = wink.isArray;
	
	/**
	 * @class The Xhr component can be used to build XmlHttpRequests and send HTTP requests. It supports both GET and POST methods.
	 * The Xhr constructor can optionaly take properties that will be stored (to be used within the callback methods for instance). To send a request, use the 'sendData' method
	 * 
	 * @param {object} [properties] The parameters that will be stored within the request object and can be used in the callbacks methods
	 * 
	 * @example
	 * 
	 * var parameters = 
	 * [
	 * 	{name: 'parameter1', value: 'test1'},
	 * 	{name: 'parameter2', value: 'test2'}
	 * ]
	 * 
	 * xhr = new wink.Xhr();
	 * xhr.sendData('test_xhr.html', parameters, 'GET', {method: 'onsuccess'}, {method: 'onfailure'}, null);
	 * 
	 * onsuccess = function(result)
	 * {
	 * 	...
	 * }
	 * 
	 * onfailure = function(result)
	 * {
	 * 	...
	 * }
	 * 
	 * @see <a href="WINK_ROOT_URL/net/xhr/test/test_xhr.html" target="_blank">Test page</a>
	 */
	wink.net.Xhr = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * An object containing the actual XHR object and the parameters set at the instantiation time
		 * 
		 * @property
		 * @type object
		 */
		this.request =
		{
		    xhrObject: null,
		    params: properties
		};
	
		this._create();
	};
	
	wink.net.Xhr.prototype =
	{
		/**
		 * Send the datas
		 * 
		 * @param {string} url The URL to call
		 * @param {array} [parameters] The parameters to add to the request URL
		 * @param {string} [method] Either GET or POST
		 * @param {object} [successCallback] The method to call in case of success. The 'callback' is an object that must contain a 'method' and a 'scope'
		 * @param {object} [failureCallback] The method to call in case of success. The 'callback' is an object that must contain a 'method' and a 'scope'
		 * @param {array} [headers] The HTTP headers to add to the request
		 * 
		 * @returns {boolean} Returns true if the request was send, false otherwise
		 */
		sendData: function(url, parameters, method, successCallback, failureCallback, headers)
		{
			var r = this.request, xo = r.xhrObject, enc = encodeURIComponent;
		
			method = method.toUpperCase();
			
			if ( isSet(parameters) && !isArray(parameters) )
			{
				wink.log('[Xhr] parameters must be in an array of objects containing the parameter name and value');
				return;
			}
		
			if (xo)
			{
				var p = null;
				
				if ( isSet(parameters) )
				{	
					var i, l = parameters.length;
					
					for (i=0; i<l; i++)
					{
						var parami = parameters[i];
						var name = parami.name;
						var value = parami.value;
						
						if ( method == 'GET' )
						{
							if ( i==0 && url.indexOf('?')==-1)	
							{
								url += '?' + enc(name) + '=' + enc(value);
							} else
							{
								url += '&' + enc(name) + '=' + enc(value);
							}
						} else
						{
							if ( i==0 )
							{
								p = enc(name) + '=' + enc(value);
							} else
							{
								p += '&' + enc(name) + '=' + enc(value);
							}
						}
					}
				}
				
				try
				{
					xo.open(method, url, true);
					xo.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
					
					if ( isSet(headers) )
	  				{
	  					if ( !isArray(headers) )
	  					{
	  						wink.log('[Xhr] headers must be in an array of objects containing the header name and value');
	  					} else
	  					{
	  						var i, l = headers.length;
	  						for (i=0; i<l; i++)
	  						{
	  							var hi = headers[i];
	  							xo.setRequestHeader(hi.name, hi.value);
	  						}
	  					}
	  				}
					
					xo.send(p);
					
				} catch (e)
				{
					return false;
				}
					
				xo.onreadystatechange = function()
				{
					var readyState = xo.readyState;
					
					if (readyState != 4)
					{
						return
					}
					
					var status = xo.status;
					
					if (!((status >= 200 && status < 400) || status == 0))
					{
						if ( isSet(failureCallback) )
						{
							wink.call(failureCallback, r);
						}
					} else
					{
						if ( isSet(successCallback) )
						{
							wink.call(successCallback, r);
						}
					}
				};
			} else
			{
				return false;
			}
		
			return true;
		},
	
		/**
		 * Instantiate a new XMLHttpRequest
		 */
		_create: function()
		{
			var xhrInterface = window.XMLHttpRequest;
			if (xhrInterface)
			{
				var xo;
				try
				{
					xo = new xhrInterface();
				} catch (e)
				{
					xo = false;
				}
				this.request.xhrObject = xo;
			} else
			{
				wink.log('[Xhr] XHR not supported');
			}
		}
	};
	
	/**
	 * @class
	 * @see wink.net.Xhr
	 */
	wink.Xhr = wink.net.Xhr;
	
	return wink.Xhr;
});