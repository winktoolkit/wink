/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @class Manage the data storage in localStorage
 * 
 * @param {object} properties The properties object
 * @param {string} properties.key The storage key
 *
 * @author Donatien LEBARBIER
 */

wink.cache.localStorage = function(properties)
{
	this._data = null;

	this._now = new Date().getTime();

	this._key = 'wink.ressources';

	this._initProperties(properties);
};

wink.cache.localStorage.prototype = {

	/**
	 * Initialize datas with given properties
	 * 
	 * @param {object} properties The properties object
	 * @param {string} [properties.key=wink.ressources] The storage key
	 */
	_initProperties : function(properties)
	{
		if (properties.key)
		{
			this._key = properties.key;
		}
	},

	/**
	 * Test if browser supports localStorage
	 * 
	 * @returns {boolean} Whether this type of storage is supported
	 */
	isSupported : function()
	{
		try
		{
			return !!localStorage.getItem;
		} catch (e)
		{
			return false;
		}
	},

	/**
	 * Open and initialize storage if not done
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	open : function(callback, errCallback)
	{
		if (this._data == null)
		{
			// console.log('_open');

			this._data = (localStorage.getItem(this._key) ? this
					._parse(localStorage.getItem(this._key)) : {});
		}

		callback();
	},

	/**
	 * Drop the data.
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	drop : function(callback, errCallback)
	{
		// console.log('_drop');

		this._data = {};

		callback();
	},

	/**
	 * Retrieve the expired resources and the resources no more used (synchronization)
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 * @param {array} urls List of resources url (useful for synchronization)
	 */
	getExpiredItems : function(callback, errCallback, urls)
	{
		// console.log('_getExpiredItems');

		var items = new Array();

		for (url in this._data)
		{
			var item = this._data[url];
			if ((urls !== null)
					&& ((urls[url] === undefined) || (urls[url] === null)))
			{
				items.push(item);
			} else
			{
				if (item.expires < this._now)
				{
					items.push(item);
				}
			}
		}

		callback(items);
	},

	/**
	 * Retrieve a resource by its url from storage
	 * 
	 * @param {string} url Url of the resource to retrieve
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	getItem : function(url, callback, errCallback)
	{
		// console.log('_getItem ' + url);

		callback(this._data[url]);
	},

	/**
	 * Store a resource in storage
	 * 
	 * @param {string} url
	 * @param {string} type
	 * @param {number} version
	 * @param {number} expires
	 * @param {string} data
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	storeResource : function(url, type, version, expires, data, callback,
			errCallback)
	{
		// console.log('_storeResource ' + url);

		this._data[url] = {
			url : url,
			type : type,
			version : version,
			expires : (this._now + (expires * 1000)),
			data : data
		};

		callback();
	},

	/**
	 * Delete a resource from storage
	 * 
	 * @param {string} url Url of the resource to delete
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	deleteResource : function(url, callback, errCallback)
	{
		// console.log('_deleteResource ' + url);

		delete (this._data[url]);

		callback();
	},

	/**
	 * Action at the end of a transaction
	 */
	endTransaction : function()
	{
		localStorage.setItem(this._key, this._stringify(this._data));
	},

	/**
	 * Test the validity of a JSON structure and parse it
	 * 
	 * @param {string} str The string to parse
	 * @returns {object} The associated JSON structure
	 */
	_parse : function(str)
	{
		if (((window.json !== undefined) && (window.json !== null))
				&& ((window.json.parse !== undefined) && (window.json.parse !== null)))
		{
			return window.json.parse(str);
		} else
		{
			var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

			str = String(str);

			cx.lastIndex = 0;

			if (cx.test(str))
			{
				str = str.replace(cx,
						function(a)
						{
							return '\\u'
									+ ('0000' + a.charCodeAt(0).toString(16))
											.slice(-4);
						});
			}

			if (/^[\],:{}\s]*$/
					.test(str
							.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
							.replace(
									/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
									']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
			{
				var JSON = eval('(' + str + ')');
			}

			return JSON;
		}
	},

	/**
	 * Return the JSON representation of a given value
	 * 
	 * @param {object} value The object or array to transform
	 * @returns {string} The stringified value of the object
	 */
	_stringify : function(value)
	{
		var _stack = new Array();

		var _str = function(value)
		{
			var str;
			var indent = '';
			var wrapper = new Object();

			if (value
					&& ((value.toJSON !== undefined) && (value.toJSON !== null)))
			{
				str = value.toJSON();

				if (typeof str == "string" || str instanceof String)
					str = _quote(str);
			} else
			{
				if (typeof value == "string" || value instanceof String)
					str = _quote(value);

				else if (typeof value == "number" || value instanceof Number)
					str = (isFinite(value)) ? value : 'null';

				else if (value === null)
					str = 'null';

				else if (typeof value == "boolean" || value instanceof Boolean)
					str = (value) ? 'true' : 'false';

				else if ((value !== undefined) && typeof (value) != 'function')
					str = ((typeof value == "array" || value instanceof Array)) ? _JA(value)
							: _JO(value);
			}

			return str;
		};

		var _quote = function(str)
		{
			function _char(c)
			{
				var chars = {
					'\b' : '\\b',
					'\t' : '\\t',
					'\n' : '\\n',
					'\f' : '\\f',
					'\r' : '\\r',
					'"' : '\\"',
					'\\' : '\\\\'
				};

				if (!chars[c])
					chars[c] = '\\u'
							+ ('0000' + (+(c.charCodeAt(0))).toString(16))
									.slice(-4);

				return chars[c];
			}

			var product = '"', txt = str, specialChars = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

			str = txt.replace(specialChars, _char);
			str = product + str + product;

			return str;
		};

		var _JO = function(object)
		{
			var propertyList = new Array(), partial = new Array();

			for ( var i = 0; i < _stack.length; i++)
			{
				if (_stack[i] == object)
				{
					console
							.log('[JSON] The passed value is a cyclical structure.');
					return undefined;
				}
			}

			_stack.push(object);

			for ( var attr in object)
				propertyList.push(attr);

			var strP, member, separator = ',', colon = ':';

			for ( var i = 0; i < propertyList.length; i++)
			{
				strP = _str(object[propertyList[i]]);

				if (strP !== undefined)
				{
					member = _quote(propertyList[i]) + colon + strP;
					partial.push(member);
				}
			}

			if (partial.length == 0)
				str = '{}';
			else
			{
				var properties = '';

				for ( var i = 0; i < partial.length; i++)
					properties += partial[i] + separator;

				properties = properties.slice(0, -1);
				str = '{' + properties + '}';
			}

			_stack.pop();

			return str;
		};

		var _JA = function(array)
		{
			var partial = new Array(), separator = ',', str;

			for ( var i = 0; i < _stack.length; i++)
			{
				if (_stack[i] == array)
				{
					console
							.log('[JSON] The passed value is a cyclical structure.');
					return undefined;
				}
			}

			_stack.push(array);

			var strP;

			for ( var i = 0; i < array.length; i++)
			{
				strP = _str(array[i]);

				partial.push((strP !== undefined) ? 'null' : strP);
			}

			if (partial.length == 0)
				str = '[]';
			else
			{
				var properties = '';

				for ( var i = 0; i < partial.length; i++)
					properties += partial[i] + separator;

				properties = properties.slice(0, -1);
				str = '[' + properties + ']';
			}

			_stack.pop();

			return str;
		};

		var str;

		if (value)
		{
			if (((window.json !== undefined) && (window.json !== null))
					&& ((window.json.stringify !== undefined) && (window.json.stringify !== null)))
			{
				str = window.JSON.stringify(value);
			} else
			{
				str = _str(value);
			}
		}

		return str;
	}
};
